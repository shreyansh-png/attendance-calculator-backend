import CancelledClass from "../models/cancelledClass.model.js";

// Add Cancelled Class
const cancelClass = async (req, res) => {

    try {

        const {
            classId,
            date,
            reason
        } = req.body;

        if (!classId || !date || !reason) {

            return res.status(400).json({

                success: false,

                message: "All fields are required"

            });

        }

        const cancelled = await CancelledClass.create({

            classId,

            date,

            reason

        });

        return res.status(201).json({

            success: true,

            message: "Class cancelled successfully",

            data: cancelled

        });

    } catch (error) {

        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message: "Class already cancelled"

            });

        }

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Get Cancelled Classes
const getCancelledClasses = async (req, res) => {

    try {

        const cancelledClasses = await CancelledClass.find();

        return res.status(200).json({

            success: true,

            data: cancelledClasses

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Delete Cancellation
const deleteCancelledClass = async (req, res) => {

    try {

        const { id } = req.params;

        const cancelled = await CancelledClass.findByIdAndDelete(id);

        if (!cancelled) {

            return res.status(404).json({

                success: false,

                message: "Cancelled class not found"

            });

        }

        return res.status(200).json({

            success: true,

            message: "Cancellation removed"

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export {

    cancelClass,

    getCancelledClasses,

    deleteCancelledClass

};