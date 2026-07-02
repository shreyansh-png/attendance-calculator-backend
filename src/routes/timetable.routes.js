import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import {
    uploadTimetable,
    getMyTimetable,
    getTodayTimetable
} from "../controllers/timetable.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";


import verifyAdmin from "../middlewares/admin.middleware.js";

const router = Router();

router.post(
    "/upload",
    upload.single("timetable"),
    verifyJWT,
    verifyAdmin,
    uploadTimetable
);

router.get(
    "/my",
    verifyJWT,
    getMyTimetable
);

router.get(
    "/today",
    verifyJWT,
    getTodayTimetable
);

export default router;