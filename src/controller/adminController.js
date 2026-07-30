import * as adminService from "../service/adminApprovalService.js";

const getPendingContributors = async (req, res) => {
    try {
        const users = await adminService.getPendingContributors();
        return res.success("Pending contributors fetched", users);
    } catch (error) {
        return res.error(error.message);
    }
};

const approveContributor = async (req, res) => {
    try {
        const user = await adminService.approveContributor(req.params.userId);
        return res.success("Contributor approved successfully", user);
    } catch (error) {
        if (error.message === "Pending contributor not found") {
            return res.notFound(error.message);
        }
        return res.error(error.message);
    }
};

const rejectContributor = async (req, res) => {
    try {
        const user = await adminService.rejectContributor(req.params.userId);
        return res.success("Contributor rejected", user);
    } catch (error) {
        if (error.message === "Pending contributor not found") {
            return res.notFound(error.message);
        }
        return res.error(error.message);
    }
};

export { getPendingContributors, approveContributor, rejectContributor };