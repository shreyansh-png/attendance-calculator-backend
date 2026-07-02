import ExtraClass from "../models/extraClass.model.js";

// ==========================================
// Add Extra Class
// ==========================================

const addExtraClass = async (req, res) => {

    try {

        const {
            batch,
            branch,
            semester,
            section,
            subjectId,
            teacher,
            room,
            date,
            startTime,
            endTime,
            classType
        } = req.body;

        if (
            !batch ||
            !branch ||
            !semester ||
            !section ||
            !subjectId ||
            !teacher ||
            !room ||
            !date ||
            !startTime ||
            !endTime ||
            !classType
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check duplicate extra class
        const existingClass = await ExtraClass.findOne({

            batch,
            branch,
            semester,
            section,
            date: new Date(date),
            startTime

        });

        if (existingClass) {

            return res.status(409).json({

                success: false,
                message: "Extra class already exists"

            });

        }

        const extraClass = await ExtraClass.create({

            batch,

            branch,

            semester,

            section,

            subjectId,

            teacher,

            room,

            date: new Date(date),

            startTime,

            endTime,

            classType

        });

        return res.status(201).json({

            success: true,

            message: "Extra class added successfully",

            data: extraClass

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ==========================================
// Get All Extra Classes
// ==========================================

const getExtraClasses = async (req, res) => {

    try {

        const extraClasses = await ExtraClass.find()

            .populate("subjectId")

            .sort({

                date: 1,

                branch: 1,

                semester: 1,

                startTime: 1

            });

        return res.status(200).json({

            success: true,

            count: extraClasses.length,

            data: extraClasses

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ==========================================
// Delete Extra Class
// ==========================================

const deleteExtraClass = async (req, res) => {

    try {

        const { id } = req.params;

        const deletedClass = await ExtraClass.findByIdAndDelete(id);

        if (!deletedClass) {

            return res.status(404).json({

                success: false,

                message: "Extra class not found"

            });

        }

        return res.status(200).json({

            success: true,

            message: "Extra class deleted successfully"

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

    addExtraClass,

    getExtraClasses,

    deleteExtraClass

};