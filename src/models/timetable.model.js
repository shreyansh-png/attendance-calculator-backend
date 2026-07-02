import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },

        teacher: {
            type: String,
            required: true,
            trim: true,
        },

        room: {
            type: String,
            required: true,
            trim: true,
        },

        startTime: {
            type: String,
            required: true,
        },

        endTime: {
            type: String,
            required: true,
        },

        classType: {
            type: String,
            enum: ["Theory", "Lab"],
            required: true,
        },
    },
    {
        _id: true,
    }
);

const timetableSchema = new mongoose.Schema(
    {
        batch: {
            type: Number,
            required: true,
        },

        branch: {
            type: String,
            required: true,
            enum: [
                "CSE-R",
                "CSE-AI",
                "CSE-SF",
                "ECE",
                "CHE",
                "EE",
                "ME",
                "CE",
            ],
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },

        // Temporary support for common theory classes
        section: {
            type: String,
            required: true,
            enum: ["A", "B", "A,B"],
        },

        schedule: {
            monday: [classSchema],
            tuesday: [classSchema],
            wednesday: [classSchema],
            thursday: [classSchema],
            friday: [classSchema],
            saturday: [classSchema],
        },
    },
    {
        timestamps: true,
    }
);

timetableSchema.index(
    {
        batch: 1,
        branch: 1,
        semester: 1,
        section: 1,
    },
    {
        unique: true,
    }
);

const Timetable = mongoose.model("Timetable", timetableSchema);

export default Timetable;