import * as profileService from "../service/profileService.js";

const createProfile = async (req, res) => {
    try {
        const profile = await profileService.createProfile(
            req.user._id,
            req.user.role,
            req.body
        );
        return res.created("Profile created successfully", profile);
    } catch (error) {
        if (error.message === "Profile already exists") {
            return res.conflict(error.message);
        }
        return res.error(error.message);
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await profileService.getProfile(
            req.user._id,
            req.user.role
        );
        return res.success("Profile fetched successfully", profile);
    } catch (error) {
        if (error.message === "Profile not found") {
            return res.notFound(error.message);
        }
        return res.error(error.message);
    }
};

const updateProfile = async (req, res) => {
    try {
        const profile = await profileService.updateProfile(
            req.user._id,
            req.user.role,
            req.body
        );
        return res.success("Profile updated successfully", profile);
    } catch (error) {
        if (error.message === "Profile not found") {
            return res.notFound(error.message);
        }
        return res.error(error.message);
    }
};

export { createProfile, getProfile, updateProfile };