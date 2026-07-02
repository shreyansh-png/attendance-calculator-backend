import { Router } from "express";

import {
    createSubject,
    getAllSubjects,
    getSubjectById
} from "../controllers/subject.controller.js";

const router = Router();

router.post("/", createSubject);

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);

export default router;