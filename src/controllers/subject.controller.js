import Subject from "../models/subject.model.js";

const createSubject = async(req,res) =>{

    try {
        const {
            subjectCode,
            subjectName,
            credits,
            type
        } = req.body;

        if (
            !subjectCode ||
            !subjectName ||
            !credits ||
            !type
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingSubject = await Subject.findOne({
            subjectCode
        });

        if (existingSubject) {
            return res.status(409).json({
                success: false,
                message: "Subject already exists"
            });
        }
          const subject = await Subject.create({
            subjectCode,
            subjectName,
            credits,
            type
        });

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: subject
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllSubjects = async (req, res) => {

    try {

        const subjects = await Subject.find().sort({
            subjectName: 1
        });

        return res.status(200).json({

            success: true,

            data: subjects

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getSubjectById = async (req, res) => {

    try {

        const { id } = req.params;

        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: subject
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



export {
    createSubject,
    getAllSubjects,
    getSubjectById
};