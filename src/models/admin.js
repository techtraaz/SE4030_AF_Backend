import mongoose from "mongoose";
import { ACCESS_LEVELS } from "../utils/constants.js";

const adminProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        accessLevel: {
            type: String,
            enum: Object.values(ACCESS_LEVELS),
            default: ACCESS_LEVELS.STANDARD
        }
    },
    { timestamps: true }
);

export default mongoose.model("AdminProfile", adminProfileSchema);