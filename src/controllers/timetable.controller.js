import ExcelJS from "exceljs";
import Subject from "../models/subject.model.js";
import Timetable from "../models/timetable.model.js";
import Attendance from "../models/attendance.model.js";
import Holiday from "../models/holiday.model.js";
import ExtraClass from "../models/extraClass.model.js";
import CancelledClass from "../models/cancelledClass.model.js";

const uploadTimetable = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return res.status(400).json({
                success: false,
                message: "Worksheet not found"
            });
        }

        const timetableRows = [];

        worksheet.eachRow((row, rowNumber) => {

            if (rowNumber === 1) return;

            const values = row.values;

            timetableRows.push({

                batch: Number(values[1]),

                branch: String(values[2]).trim().toUpperCase(),

                semester: Number(values[3]),

                section: String(values[4]).trim(),

                day: String(values[5]).trim().toLowerCase(),

                startTime: String(values[6]).trim(),

                endTime: String(values[7]).trim(),

                subjectCode: String(values[8]).trim(),

                subjectName: String(values[9]).trim(),

                teacher: String(values[10]).trim(),

                room: String(values[11]).trim(),

                classType: String(values[12]).trim()

            });

        });

        if (timetableRows.length === 0) {

            return res.status(400).json({

                success: false,

                message: "Excel sheet is empty"

            });

        }

        // =====================================
        // Create Subject Map
        // =====================================

        const subjectMap = {};

        for (const row of timetableRows) {

            let subject = await Subject.findOne({

                subjectCode: row.subjectCode

            });

            if (!subject) {

                subject = await Subject.create({

                    subjectCode: row.subjectCode,

                    subjectName: row.subjectName,

                    credits: 0,

                    type: row.classType

                });

            }

            subjectMap[row.subjectCode] = subject._id;

        }

        // =====================================
        // Group Timetable By Day
        // =====================================

        const schedule = {

            monday: [],

            tuesday: [],

            wednesday: [],

            thursday: [],

            friday: [],

            saturday: []

        };

        for (const row of timetableRows) {

            if (!schedule[row.day]) continue;

            schedule[row.day].push({

                subjectId: subjectMap[row.subjectCode],

                teacher: row.teacher,

                room: row.room,

                startTime: row.startTime,

                endTime: row.endTime,

                classType: row.classType

            });

        }

        const firstRow = timetableRows[0];

        const timetable = await Timetable.findOneAndUpdate(

            {

                batch: firstRow.batch,

                branch: firstRow.branch,

                semester: firstRow.semester,

                section: firstRow.section

            },

            {

                batch: firstRow.batch,

                branch: firstRow.branch,

                semester: firstRow.semester,

                section: firstRow.section,

                schedule

            },

            {

                new: true,

                upsert: true,

                runValidators: true

            }

        );

        return res.status(201).json({

            success: true,

            message: "Timetable uploaded successfully",

            data: timetable

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getMyTimetable = async (req, res) => {

    try {

        const {
            batch,
            branch,
            semester,
            section
        } = req.user;

        const timetable = await Timetable.findOne({

            batch,
            branch,
            semester,
            $or: [{ section }, { section: "A,B" }]

        })

        .populate([
            "schedule.monday.subjectId",
            "schedule.tuesday.subjectId",
            "schedule.wednesday.subjectId",
            "schedule.thursday.subjectId",
            "schedule.friday.subjectId",
            "schedule.saturday.subjectId"
        ])

        .lean();

        if (!timetable) {

            return res.status(404).json({

                success: false,

                message: "Timetable not found"

            });

        }

        return res.status(200).json({

            success: true,

            message: "Timetable fetched successfully",

            data: timetable

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getTodayTimetable = async (req, res) => {

    try {

        const student = req.user;

        const serverTime = new Date();
        const istTime = new Date(serverTime.getTime() + (5.5 * 60 * 60 * 1000));
        const todayDate = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate()));

        const tomorrow = new Date(todayDate);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

        // ============================
        // Holiday Check
        // ============================

        const holiday = await Holiday.findOne({

            date: {
                $gte: todayDate,
                $lt: tomorrow
            }

        });

        if (holiday) {

            return res.status(200).json({

                success: true,

                holiday: true,

                message: holiday.title,

                classes: []

            });

        }

        // ============================
        // Get Student Timetable
        // ============================

        const timetable = await Timetable.findOne({

            batch: student.batch,

            branch: student.branch,

            semester: student.semester,

            $or: [{ section: student.section }, { section: "A,B" }]

        }).populate([

            "schedule.monday.subjectId",
            "schedule.tuesday.subjectId",
            "schedule.wednesday.subjectId",
            "schedule.thursday.subjectId",
            "schedule.friday.subjectId",
            "schedule.saturday.subjectId"

        ]);

        if (!timetable) {

            return res.status(404).json({

                success: false,

                message: "Timetable not found"

            });

        }

        // ============================
        // Find Today's Day
        // ============================

        const days = [

            "sunday",

            "monday",

            "tuesday",

            "wednesday",

            "thursday",

            "friday",

            "saturday"

        ];

        const today = days[todayDate.getUTCDay()];

        if (today === "sunday") {

            return res.status(200).json({

                success: true,

                message: "No classes today",

                classes: []

            });

        }

        // ============================
        // Regular Classes
        // ============================

        let classes = [...timetable.schedule[today]];

        // ============================
        // Remove Cancelled Classes
        // ============================

        const cancelledClasses = await CancelledClass.find({

            date: {
                $gte: todayDate,
                $lt: tomorrow
            }

        });

        const cancelledIds = new Set(

            cancelledClasses.map(cls => cls.classId.toString())

        );

        classes = classes.filter(

            cls => !cancelledIds.has(cls._id.toString())

        );

        // ============================
        // Fetch Extra Classes
        // ============================

        const extraClasses = await ExtraClass.find({

            batch: student.batch,

            branch: student.branch,

            semester: student.semester,

            $or: [

                { section: student.section },

                { section: "A,B" }

            ],

            date: {

                $gte: todayDate,

                $lt: tomorrow

            }

        }).populate("subjectId");

        // Merge Extra Classes

        classes.push(...extraClasses);

        // ============================
        // Create Pending Attendance
        // ============================

        for (const cls of classes) {

            await Attendance.findOneAndUpdate(

                {

                    studentId: student._id,

                    classId: cls._id,

                    date: todayDate

                },

                {

                    $setOnInsert: {
                        studentId: student._id,

                        classId: cls._id,

                        subjectId: cls.subjectId._id || cls.subjectId,

                        date: todayDate,

                        status: "Pending"
                    }

                },

                {

                    upsert: true,

                    new: true,

                    setDefaultsOnInsert: true

                }

            );

        }

        return res.status(200).json({

            success: true,

            day: today,

            totalClasses: classes.length,

            classes

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export {
    uploadTimetable,
    getMyTimetable,
    getTodayTimetable
};