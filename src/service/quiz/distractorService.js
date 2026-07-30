import axios from "axios";

/**
 * Datamuse API Service
 * Free API for word-finding, word association, rhymes, and more
 * Documentation: https://www.datamuse.com/api/
 */

const DATAMUSE_API_BASE = "https://api.datamuse.com";

/**
 * Generate distractor options (plausible wrong answers) for a quiz question
 * Uses multiple Datamuse endpoints to find related but different words
 * 
 * @param {string} correctAnswer - The correct answer text
 * @param {number} count - Number of distractors to generate (default: 3)
 * @returns {Promise<Array<string>>} Array of distractor words
 */
const generateDistractors = async (correctAnswer, count = 3) => {
    try {
        // Validate input
        if (!correctAnswer || correctAnswer.trim() === '') {
            throw new Error("Correct answer cannot be empty");
        }

        const cleanAnswer = correctAnswer.trim();
        const distractors = new Set(); // Use Set to avoid duplicates

        // Strategy 1: Find words that are "means like" (similar meaning)
        // This gives us synonyms that might confuse learners
        try {
            const synonymsResponse = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    ml: cleanAnswer, // means like
                    max: 10
                },
                timeout: 5000
            });

            synonymsResponse.data.forEach(item => {
                if (item.word.toLowerCase() !== cleanAnswer.toLowerCase()) {
                    distractors.add(capitalizeFirstLetter(item.word));
                }
            });
        } catch (error) {
            console.warn('Datamuse synonyms fetch failed:', error.message);
        }

        // Strategy 2: Find words that are "sounds like" (homophones/similar spelling)
        // Good for confusing learners with similar-sounding words
        try {
            const soundsLikeResponse = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    sl: cleanAnswer, // sounds like
                    max: 10
                },
                timeout: 5000
            });

            soundsLikeResponse.data.forEach(item => {
                if (item.word.toLowerCase() !== cleanAnswer.toLowerCase()) {
                    distractors.add(capitalizeFirstLetter(item.word));
                }
            });
        } catch (error) {
            console.warn('Datamuse sounds-like fetch failed:', error.message);
        }

        // Strategy 3: Find related words (topics, associations)
        try {
            const relatedResponse = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    rel_trg: cleanAnswer, // words that are triggered by this word
                    max: 10
                },
                timeout: 5000
            });

            relatedResponse.data.forEach(item => {
                if (item.word.toLowerCase() !== cleanAnswer.toLowerCase()) {
                    distractors.add(capitalizeFirstLetter(item.word));
                }
            });
        } catch (error) {
            console.warn('Datamuse related words fetch failed:', error.message);
        }

        // Strategy 4: Find words in the same category (related topics)
        try {
            const topicResponse = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    rel_jjb: cleanAnswer, // popular adjectives modifying this noun
                    max: 5
                },
                timeout: 5000
            });

            topicResponse.data.forEach(item => {
                if (item.word.toLowerCase() !== cleanAnswer.toLowerCase()) {
                    distractors.add(capitalizeFirstLetter(item.word));
                }
            });
        } catch (error) {
            console.warn('Datamuse topic words fetch failed:', error.message);
        }

        // Convert Set to Array and return requested count
        const distractorArray = Array.from(distractors);

        if (distractorArray.length === 0) {
            throw new Error(`Could not generate distractors for "${correctAnswer}". The word may be too uncommon or not found in the dictionary.`);
        }

        // Return random selection of distractors
        return shuffleArray(distractorArray).slice(0, count);

    } catch (error) {
        // Re-throw custom errors
        if (error.message.includes("Could not generate distractors")) {
            throw error;
        }
        // Handle network/API errors
        throw new Error(`Failed to generate distractors: ${error.message}`);
    }
};

/**
 * Generate contextual hints for a question answer
 * Returns related words and concepts without revealing the answer
 * 
 * @param {string} correctAnswer - The correct answer text
 * @param {number} maxHints - Maximum number of hint words to return (default: 3)
 * @returns {Promise<Array<string>>} Array of hint words
 */
const generateHints = async (correctAnswer, maxHints = 3) => {
    try {
        if (!correctAnswer || correctAnswer.trim() === '') {
            throw new Error("Correct answer cannot be empty");
        }

        const cleanAnswer = correctAnswer.trim();
        const hints = new Set();

        // Get words that mean similar things (synonyms)
        try {
            const response = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    ml: cleanAnswer,
                    max: 10
                },
                timeout: 5000
            });

            response.data.forEach(item => {
                if (item.word.toLowerCase() !== cleanAnswer.toLowerCase()) {
                    hints.add(item.word);
                }
            });
        } catch (error) {
            console.warn('Datamuse hints fetch failed:', error.message);
        }

        // Get related concepts
        try {
            const response = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    rel_trg: cleanAnswer,
                    max: 8
                },
                timeout: 5000
            });

            response.data.forEach(item => {
                hints.add(item.word);
            });
        } catch (error) {
            console.warn('Datamuse related concepts fetch failed:', error.message);
        }

        const hintArray = Array.from(hints).slice(0, maxHints);

        if (hintArray.length === 0) {
            return ["Think about the meaning of the question"];
        }

        return hintArray;

    } catch (error) {
        throw new Error(`Failed to generate hints: ${error.message}`);
    }
};

/**
 * Get synonyms and related words for educational feedback
 * Used to show learners additional context after answering
 * 
 * @param {string} word - The word to get educational context for
 * @returns {Promise<Object>} Object containing synonyms and related words
 */
const getEducationalContext = async (word) => {
    try {
        if (!word || word.trim() === '') {
            throw new Error("Word cannot be empty");
        }

        const cleanWord = word.trim();
        const context = {
            synonyms: [],
            related: [],
            word: cleanWord
        };

        // Get synonyms
        try {
            const synonymsResponse = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    ml: cleanWord,
                    max: 5
                },
                timeout: 5000
            });

            context.synonyms = synonymsResponse.data
                .map(item => item.word)
                .filter(w => w.toLowerCase() !== cleanWord.toLowerCase());
        } catch (error) {
            console.warn('Educational context synonyms fetch failed:', error.message);
        }

        // Get related words
        try {
            const relatedResponse = await axios.get(`${DATAMUSE_API_BASE}/words`, {
                params: {
                    rel_trg: cleanWord,
                    max: 5
                },
                timeout: 5000
            });

            context.related = relatedResponse.data
                .map(item => item.word)
                .filter(w => w.toLowerCase() !== cleanWord.toLowerCase());
        } catch (error) {
            console.warn('Educational context related words fetch failed:', error.message);
        }

        return context;

    } catch (error) {
        throw new Error(`Failed to get educational context: ${error.message}`);
    }
};

/**
 * Utility: Capitalize first letter of a word
 */
const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Utility: Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export {
    generateDistractors,
    generateHints,
    getEducationalContext
};
