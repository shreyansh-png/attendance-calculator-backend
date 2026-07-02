import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true,
        trim:true
    },

    date:{
        type:Date,
        required:true,
        unique:true
    },

    description:{
        type:String,
        default:""
    }
},
{
    timestamps:true
});

const Holiday = mongoose.model(
    "Holiday",
    holidaySchema
);

export default Holiday;