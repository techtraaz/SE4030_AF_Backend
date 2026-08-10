import RefugeeProfile from "../models/refugee.js";
import ContentContributorProfile from "../models/contentContributor.js";
import AdminProfile from "../models/admin.js";
import { ROLES } from "../utils/constants.js";
import * as forumService from "./forum/forumService.js";

// Helper: get the correct model by role
const getProfileModel = (role) => {
    switch (role) {
        case ROLES.REFUGEE:      return RefugeeProfile;
        case ROLES.CONTENT_CONTRIBUTOR: return ContentContributorProfile;
        case ROLES.ADMIN:        return AdminProfile;
        default: throw new Error("Invalid role for profile");
    }
};

// Create Profile 
const createProfile = async (userId, role, data) => {
    const ProfileModel = getProfileModel(role);

    const existingProfile = await ProfileModel.findOne({ userId });
    if (existingProfile) {
        throw new Error("Profile already exists");
    }

    const allowedFields = ALLOWED_UPDATE_FIELDS[role];
    const sanitizedData = pickAllowedFields(data, allowedFields);
    const profile = await ProfileModel.create({ userId, ...sanitizedData });
    return profile;
};

//Get Profile 
const getProfile = async (userId, role) => {
    const ProfileModel = getProfileModel(role);

    const profile = await ProfileModel.findOne({ userId });
    if (!profile) {
        throw new Error("Profile not found");
    }

    // Get user's joined forums with pagination (page 1, limit 10)
    const forumsData = await forumService.getUserForumsPaginated(userId.toString(), userId, role, 1, 10);
    
    // Convert profile to object and add forums
    const profileWithForums = profile.toObject();
    profileWithForums.forumsJoined = forumsData;

    return profileWithForums;
};

//Update Profile
// Replace the existing updateProfile function with more secure and role-aware implementation
const ALLOWED_UPDATE_FIELDS = {
    [ROLES.REFUGEE]: ['fullName', 'originCountry', 'preferredLanguage', 'educationLevel', 'dateOfBirth'],
    [ROLES.CONTENT_CONTRIBUTOR]: ['organisationName', 'organisationType', 'contactPerson', 'phoneNumber', 'country'],
    [ROLES.ADMIN]: ['fullName']
};

// Helper function to filter data based on allowed fields for the role
const pickAllowedFields = (data, allowedFields) => {
    const filteredData = {};
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            filteredData[key] = data[key];
        }
    }
    return filteredData;
};

const updateProfile = async (userId, role, data) => {
    const ProfileModel = getProfileModel(role);

    const allowedFields = ALLOWED_UPDATE_FIELDS[role];
    if (!allowedFields) {
        throw new Error("No allowed fields for this role");
    }

    const sanitizedData = pickAllowedFields(data, allowedFields);

    const profile = await ProfileModel.findOneAndUpdate(
        { userId },
        { $set: sanitizedData },
        { new: true, runValidators: true }
    );

    if (!profile) {
        throw new Error("Profile not found");
    }

    return profile;
};

export { createProfile, getProfile, updateProfile };