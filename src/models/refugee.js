import mongoose from "mongoose";
import { EDUCATION_LEVELS } from "../utils/constants.js";

const refugeeProfileSchema = new mongoose.Schema(
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
        nic: {
            type: String,
            default: null
        },
        originCountry: {
            type: String,
            required: true
        },
        currentCountry: {
            type: String,
            required: true
        },
        livingCamp: {
            type: String,
            default: null
        },
        preferredLanguage: {
            type: String,
            default: null
        },
        educationLevel: {
            type: String,
            enum: Object.values(EDUCATION_LEVELS),
            default: EDUCATION_LEVELS.NONE
        },
        dateOfBirth: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("RefugeeProfile", refugeeProfileSchema);