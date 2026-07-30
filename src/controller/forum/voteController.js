import * as voteService from "../../service/forum/voteService.js";

const castVote = async (req, res) => {
    try {
        const { targetId, targetType, voteType } = req.body;
        const result = await voteService.castVote(req.user._id, targetId, targetType, voteType);
        return res.success(result.message, result.vote || null);
    } catch (error) {
        if (error.message.includes("not found")) return res.notFound(error.message);
        if (error.message.includes("banned") || error.message.includes("join")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

export { castVote };