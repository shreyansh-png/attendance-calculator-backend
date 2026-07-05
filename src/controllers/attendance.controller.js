import Attendance from "../models/attendance.model.js";
import Timetable from "../models/timetable.model.js";
import ExtraClass from "../models/extraClass.model.js";
const markAttendance = async (req, res) => {
    try {

        const { classId, status = "Present" } = req.body;

        if (!classId) {
            return res.status(400).json({
                success: false,
                message: "Class ID is required"
            });
        }

        if (status !== "Present" && status !== "Absent") {
            return res.status(400).json({
                success: false,
                message: "Status must be Present or Absent"
            });
        }

        // Logged-in student
        const student = req.user;

        // Find only this student's timetable
        const timetable = await Timetable.findOne({
            batch: student.batch,
            branch: student.branch,
            semester: student.semester,
            $or: [{ section: student.section }, { section: "A,B" }]
        });

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "Timetable not found"
            });
        }

        let selectedClass = null;

// Search in Timetable
const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];

for (const day of days) {

    const foundClass = timetable.schedule[day].find(
        cls => cls._id.toString() === classId
    );

    if (foundClass) {
        selectedClass = foundClass;
        break;
    }
}

// If not found, search Extra Classes
if (!selectedClass) {

    selectedClass = await ExtraClass.findById(classId);

}

        if (!selectedClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // Today's date (00:00:00) bucketed for IST
        const serverTime = new Date();
        const istTime = new Date(serverTime.getTime() + (5.5 * 60 * 60 * 1000));
        const today = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate()));

        // Check if already marked
        const alreadyMarked = await Attendance.findOne({
            studentId: student._id,
            classId,
           date:{
    $gte:today,
    $lt:new Date(today.getTime()+24*60*60*1000)
},
            status: { $in: ["Present", "Absent"] }
        });

        if (alreadyMarked) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked"
            });
        }

        // Save attendance
const attendance = await Attendance.findOneAndUpdate(
    {
        studentId: student._id,
        classId,
        date:{
    $gte:today,
    $lt:new Date(today.getTime()+24*60*60*1000)
},
        status: "Pending"
    },
    {
        status: status,
        markedAt:new Date()
    },
    {
        new: true
    }
);
        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data: attendance
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getAttendanceReport = async (req, res) => {

    try {

        const studentId = req.user._id;

        const report = await Attendance.aggregate([

            {
                $match: {
                    studentId: req.user._id
                }
            },

            {
                $group: {

                    _id: "$subjectId",

                    total: {
                        $sum: 1
                    },

                    present: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "Present"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    absent: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "Absent"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }

                }

            },

            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subject"
                }
            },

            {
                $unwind: "$subject"
            }

        ]);

        let overallPresent = 0;
        let overallTotal = 0;

        const subjects = report.map(item => {

            overallPresent += item.present;
            overallTotal += item.total;

            return {

                subjectName: item.subject.subjectName,

                subjectCode: item.subject.subjectCode,

                present: item.present,

                absent: item.absent,

                total: item.total,

                percentage: Number(
                    (
                        item.present /
                        item.total *
                        100
                    ).toFixed(2)
                )

            };

        });

        const overallAttendance = overallTotal === 0
            ? 0
            : Number(
                (
                    overallPresent /
                    overallTotal *
                    100
                ).toFixed(2)
            );

        return res.status(200).json({

            success: true,

            overallAttendance,

            subjects

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAttendancePrediction = async (req, res) => {

    try {

        const studentId = req.user._id;

        const report = await Attendance.aggregate([

            {
                $match: {
                    studentId: studentId
                }
            },

            {
                $group: {

                    _id: "$subjectId",

                    total: {
                        $sum: 1
                    },

                    present: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "Present"]
                                },
                                1,
                                0
                            ]
                        }
                    }

                }

            },

            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subject"
                }
            },

            {
                $unwind: "$subject"
            }

        ]);

        const predictions = report.map(item => {

            const present = item.present;
            const total = item.total;

            const percentage = Number(
                ((present / total) * 100).toFixed(2)
            );

            let canMiss = 0;
            let needToAttend = 0;

            // Attendance >= 75%
            if (percentage >= 75) {

                while (
                    (present / (total + canMiss + 1)) * 100 >= 75
                ) {
                    canMiss++;
                }

            }

            // Attendance < 75%
            else {

                while (
                    ((present + needToAttend) /
                        (total + needToAttend)) * 100 < 75
                ) {
                    needToAttend++;
                }

            }

            return {

                subjectName: item.subject.subjectName,

                subjectCode: item.subject.subjectCode,

                present,

                total,

                attendance: percentage,

                canMiss,

                needToAttend

            };

        });

        return res.status(200).json({

            success: true,

            data: predictions

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAttendanceHistory = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 20;

        const skip = (page - 1) * limit;

        const attendance = await Attendance.find({

            studentId: req.user._id

        })

        .populate("subjectId")

        .sort({

            date: -1,

            markedAt: -1

        })

        .skip(skip)

        .limit(limit);

        const total = await Attendance.countDocuments({

            studentId: req.user._id

        });

        return res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(total / limit),

            totalRecords: total,

            data: attendance

        });

    }

    catch(error){

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

export { markAttendance, getAttendanceReport, getAttendancePrediction, getAttendanceHistory };