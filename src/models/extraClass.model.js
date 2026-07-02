import mongoose from "mongoose";

const extraClassSchema = new mongoose.Schema(
    {

        batch: {
            type: Number,
            required: true
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
                "CE"
            ]
        },

        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },

        section: {
            type: String,
            required: true,
            enum: ["A", "B", "A,B"]
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        teacher: {
            type: String,
            required: true,
            trim: true
        },

        room: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        classType: {
            type: String,
            enum: ["Theory", "Lab"],
            required: true
        }

    },
    {
        timestamps: true
    }
);

// Prevent duplicate extra classes
extraClassSchema.index(
    {
        batch: 1,
        branch: 1,
        semester: 1,
        section: 1,
        date: 1,
        startTime: 1
    },
    {
        unique: true
    }
);

const ExtraClass = mongoose.model(
    "ExtraClass",
    extraClassSchema
);

export default ExtraClass;