import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import verifyAdmin from "../middlewares/admin.middleware.js";


import {
    addHoliday,
    getAllHolidays,
    deleteHoliday
} from "../controllers/holiday.controller.js";

const router = express.Router();

// Add Holiday
router.post(
    "/add",
    verifyJWT,
    verifyAdmin,
    addHoliday
);
// Get All Holidays
router.get(
    "/",
    verifyJWT,
    verifyAdmin,
    getAllHolidays
);

// Delete Holiday
router.delete(
    "/:id",
    verifyJWT,
    verifyAdmin,
    deleteHoliday
);

export default router;