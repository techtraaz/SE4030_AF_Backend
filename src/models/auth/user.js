import mongoose from "mongoose";
import { ACCOUNT_STATUSES, ROLES } from "../../utils/constants.js";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.REFUGEE
        },
        status: {
            type: String,
            enum: Object.values(ACCOUNT_STATUSES),
            default: ACCOUNT_STATUSES.ACTIVE
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true } 
    }
);

userSchema.virtual("isActive").get(function () {
    return this.status === ACCOUNT_STATUSES.ACTIVE;
});

export default mongoose.model("User", userSchema);
