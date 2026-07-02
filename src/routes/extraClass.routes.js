import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

import {
    addExtraClass,
    getExtraClasses,
    deleteExtraClass
} from "../controllers/extraClass.controller.js";

import verifyAdmin from "../middlewares/admin.middleware.js";
const router = express.Router();

// Add Extra Class
router.post(
    "/add",
    verifyJWT,
    verifyAdmin,
    addExtraClass
);

// Get All Extra Classes
router.get(
    "/",
    verifyJWT,
    getExtraClasses
);

// Delete Extra Class
router.delete(
    "/:id",
    verifyJWT,
    verifyAdmin,
    deleteExtraClass
);

export default router;