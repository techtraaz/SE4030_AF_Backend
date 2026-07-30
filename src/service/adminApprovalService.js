import User from "../models/auth/user.js";
import { ROLES, ACCOUNT_STATUSES } from "../utils/constants.js";

const getPendingContributors = async () => {
    return await User.find({
        role: ROLES.CONTENT_CONTRIBUTOR,
        status: ACCOUNT_STATUSES.PENDING
    }).select("-password");
};

const approveContributor = async (userId) => {
    const user = await User.findOneAndUpdate(
        { _id: userId, role: ROLES.CONTENT_CONTRIBUTOR, status: ACCOUNT_STATUSES.PENDING },
        { status: ACCOUNT_STATUSES.ACTIVE },
        { new: true }
    ).select("-password");

    if (!user) throw new Error("Pending contributor not found");
    return user;
};

const rejectContributor = async (userId) => {
    const user = await User.findOneAndUpdate(
        { _id: userId, role: ROLES.CONTENT_CONTRIBUTOR, status: ACCOUNT_STATUSES.PENDING },
        { status: ACCOUNT_STATUSES.REJECTED },
        { new: true }
    ).select("-password");

    if (!user) throw new Error("Pending contributor not found");
    return user;
};

export { getPendingContributors, approveContributor, rejectContributor };