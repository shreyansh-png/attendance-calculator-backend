import mongoose from "mongoose";

const cancelledClassSchema = new mongoose.Schema(
{
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    reason: {
        type: String,
        required: true,
        trim: true
    }
},
{
    timestamps: true
}
);

// Prevent duplicate cancellation
cancelledClassSchema.index(
{
    classId: 1,
    date: 1
},
{
    unique: true
}
);

const CancelledClass = mongoose.model(
    "CancelledClass",
    cancelledClassSchema
);

export default CancelledClass;