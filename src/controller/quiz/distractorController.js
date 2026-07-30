import * as distractorService from "../../service/quiz/distractorService.js";

/**
 * Generate distractor options for a quiz question
 * POST /api/quizzes/distractors/generate
 * Body: { correctAnswer: string, count?: number }
 */
const generateDistractors = async (req, res) => {
    try {
        const { correctAnswer, count = 3 } = req.body;

        if (!correctAnswer || correctAnswer.trim() === '') {
            return res.badRequest("Correct answer is required");
        }

        if (count < 1 || count > 10) {
            return res.badRequest("Count must be between 1 and 10");
        }

        const distractors = await distractorService.generateDistractors(correctAnswer, count);
        
        return res.success("Distractors generated successfully", {
            correctAnswer,
            distractors,
            count: distractors.length
        });
    } catch (error) {
        console.error('Generate distractors error:', error);
        return res.error(error.message);
    }
};

/**
 * Generate hints for a quiz question
 * POST /api/quizzes/distractors/hints
 * Body: { correctAnswer: string, maxHints?: number }
 */
const generateHints = async (req, res) => {
    try {
        const { correctAnswer, maxHints = 3 } = req.body;

        if (!correctAnswer || correctAnswer.trim() === '') {
            return res.badRequest("Correct answer is required");
        }

        const hints = await distractorService.generateHints(correctAnswer, maxHints);
        
        return res.success("Hints generated successfully", {
            hints,
            hintText: `This word is related to: ${hints.join(", ")}`
        });
    } catch (error) {
        console.error('Generate hints error:', error);
        return res.error(error.message);
    }
};

/**
 * Get educational context for a word (synonyms, related words)
 * GET /api/quizzes/distractors/context/:word
 */
const getEducationalContext = async (req, res) => {
    try {
        const { word } = req.params;

        if (!word || word.trim() === '') {
            return res.badRequest("Word parameter is required");
        }

        const context = await distractorService.getEducationalContext(word);
        
        return res.success("Educational context retrieved successfully", context);
    } catch (error) {
        console.error('Get educational context error:', error);
        return res.error(error.message);
    }
};

export {
    generateDistractors,
    generateHints,
    getEducationalContext
};
