import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
},

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

   branch: {
    type: String,
    required: true,
    enum: ["CSE-R","CSE-AI","CSE-SF", "ECE", "EE", "ME", "CHE","CE"],
},
section: {
    type: String,
    required: true,
    enum: ["A", "B"],
},
batch: {
    type: Number,
    required: true,
},
    refreshToken :{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = mongoose.model("User", userSchema);
export default User;