import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

import {

    cancelClass,

    getCancelledClasses,

    deleteCancelledClass

} from "../controllers/cancelledClass.controller.js";

import verifyAdmin from "../middlewares/admin.middleware.js";
const router = express.Router();

router.post(
    "/add",
    verifyJWT,
    verifyAdmin,
    cancelClass
);

router.get(
    "/",
    verifyJWT,
    getCancelledClasses
);

router.delete(
    "/:id",
    verifyJWT,
    verifyAdmin,
    deleteCancelledClass
);

export default router;