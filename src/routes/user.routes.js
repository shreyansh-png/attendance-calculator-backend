import { Router } from "express";
import { registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    getProfile,
    updateProfile,
    forgotPassword,
    changePassword
 } from "../controllers/user.controller.js";

 import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);


//protected route

router.post("/logout",verifyJWT,logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get(
    "/profile",
    verifyJWT,
    getProfile
);
router.patch(
    "/profile",
    verifyJWT,
    updateProfile
);
router.patch(
    "/change-password",
    verifyJWT,
    changePassword
);
export default router;