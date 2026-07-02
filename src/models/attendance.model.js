import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        classId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

      status: {
    type: String,
    enum: [
        "Pending",
        "Present",
        "Absent",
        "Cancelled"
    ],
    default: "Pending"
},

        markedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// One attendance per student per class per day
attendanceSchema.index(
    {
        studentId: 1,
        classId: 1,
        date: 1
    },
    {
        unique: true
    }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;