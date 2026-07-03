import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, semester, branch, rollNumber, section, batch } = req.body;

        if (!fullName || !email || !password || !semester || !branch || !rollNumber || !section || !batch) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { rollNumber }] });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            semester,
            branch,
            rollNumber,
            section,
            batch
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate Tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save Refresh Token in Database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Cookie Options
        const options = {
            httpOnly: true,
            secure: false, // Change to true in production (HTTPS)
        };

        // Send Cookies + Response
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "Login Successful",
                accessToken,
                refreshToken
            });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getCurrentUser = async (req, res) => {

    return res.status(200).json({
        success: true,
        user: req.user
    });

};

const logoutUser =  async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options ={
        httpOnly: true,
        secure: false, // Change to true in production (HTTPS)
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
        success: true,
        message: "Logout Successful"
    });
};


const refreshAccessToken = async (req, res) => {
    try {

        const incomingRefreshToken =
            req.cookies.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh Token Missing"
            });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(
            decodedToken._id
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Refresh Token"
            });
        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh Token Expired"
            });
        }

        const accessToken =
            user.generateAccessToken();

        const refreshToken =
            user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({
            validateBeforeSave: false
        });

        const options = {
            httpOnly: true,
            secure: false
        };

        return res
            .status(200)
            .cookie(
                "accessToken",
                accessToken,
                options
            )
            .cookie(
                "refreshToken",
                refreshToken,
                options
            )
            .json({
                success: true,
                accessToken,
                refreshToken
            });

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid Refresh Token"
        });

    }
};

const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user._id)
            .select("-password -refreshToken");

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        return res.status(200).json({

            success: true,

            data: user

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateProfile = async (req, res) => {

    try {

        const {
            fullName,
            semester,
            section
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        if (fullName) {
            user.fullName = fullName;
        }

        if (semester) {
            user.semester = semester;
        }

        if (section) {
            user.section = section;
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password -refreshToken");

        return res.status(200).json({

            success: true,

            message: "Profile updated successfully",

            data: updatedUser

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const changePassword = async (req, res) => {

    try {

        const {

            verificationCode,

            newPassword

        } = req.body;

        if (!verificationCode || !newPassword) {

            return res.status(400).json({

                success: false,

                message: "All fields are required"

            });

        }

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        const expectedCode =

            user.rollNumber.slice(-2) + user.branch;

        if (verificationCode !== expectedCode) {

            return res.status(400).json({

                success: false,

                message: "Invalid Verification Code"

            });

        }

        user.password = newPassword;

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Password changed successfully"

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
    registerUser,
    loginUser,
    getCurrentUser,
    getProfile,
    updateProfile,
    changePassword,
    logoutUser,
    refreshAccessToken
};