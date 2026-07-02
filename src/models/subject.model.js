import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        subjectCode:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppwercase: true
        },
        subjectName: {
            type: String,
            required: true,
            trim: true
        },
        credits:{
            type: Number,
           default:0,
        },
         type: {
            type: String,
            enum: ["Theory", "Lab"],
            required: true
        }

},
{
    timestamps: true
});

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;