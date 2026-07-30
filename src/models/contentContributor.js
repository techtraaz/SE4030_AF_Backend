import mongoose from "mongoose";
import { ORGANIZATION_TYPES } from "../utils/constants.js";

const contentContributorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        organizationName: {
            type: String,
            required: true
        },
        organizationType: {
            type: String,
            enum: Object.values(ORGANIZATION_TYPES),
            required: true
        },
        contactPerson: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("ContentContributorProfile", contentContributorProfileSchema);