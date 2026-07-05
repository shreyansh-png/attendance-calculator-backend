import User from "../models/user.model.js";
import Timetable from "../models/timetable.model.js";
import Attendance from "../models/attendance.model.js";

const getDashboard = async (req, res) => {

    try {

        const student = req.user;

        // Today's Day
        const days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
        ];

        const serverTime = new Date();
        const istTime = new Date(serverTime.getTime() + (5.5 * 60 * 60 * 1000));
        const todayDate = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate()));
        const today = days[todayDate.getUTCDay()];

        // Student Timetable
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

        const todayClasses =
            today === "sunday"
                ? []
                : timetable.schedule[today];

        // Attendance
        const attendance = await Attendance.find({

            studentId: student._id

        }).populate("subjectId");

        let present = 0;

        attendance.forEach(record => {

            if (record.status === "Present")
                present++;

        });

        const overallAttendance =
            attendance.length === 0
                ? 0
                : Number(
                    (
                        present /
                        attendance.length *
                        100
                    ).toFixed(2)
                );

        return res.status(200).json({

            success: true,

            student: {

                fullName: student.fullName,

                rollNo: student.rollNo,

                batch: student.batch,

                semester: student.semester,

                branch: student.branch,

                section: student.section

            },

            today,

            todayClasses,

            overallAttendance

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export { getDashboard };