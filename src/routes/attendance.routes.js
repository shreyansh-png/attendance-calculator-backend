import express from "express";
import { markAttendance ,
    getAttendanceReport,
    getAttendancePrediction,
    getAttendanceHistory
} from "../controllers/attendance.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/mark", verifyJWT, markAttendance);


router.get(
"/report",
verifyJWT,
getAttendanceReport
);


router.get(
"/prediction",
verifyJWT,
getAttendancePrediction
);

router.get(
"/history",
verifyJWT,
getAttendanceHistory
);

export default router;