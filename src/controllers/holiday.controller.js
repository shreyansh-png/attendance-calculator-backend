import Holiday from "../models/holiday.model.js";

// Add Holiday
const addHoliday = async (req, res) => {

    try {

        const { title, date, description } = req.body;

        if (!title || !date) {
            return res.status(400).json({
                success: false,
                message: "Title and Date are required"
            });
        }

        const holidayExists = await Holiday.findOne({
            date: new Date(date)
        });

        if (holidayExists) {
            return res.status(409).json({
                success: false,
                message: "Holiday already exists"
            });
        }

        const holiday = await Holiday.create({
            title,
            date,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Holiday added successfully",
            data: holiday
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Holidays
const getAllHolidays = async (req, res) => {

    try {

        const holidays = await Holiday.find().sort({
            date: 1
        });

        return res.status(200).json({
            success: true,
            count: holidays.length,
            data: holidays
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Holiday
const deleteHoliday = async (req, res) => {

    try {

        const { id } = req.params;

        const holiday = await Holiday.findByIdAndDelete(id);

        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Holiday deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export {
    addHoliday,
    getAllHolidays,
    deleteHoliday
};