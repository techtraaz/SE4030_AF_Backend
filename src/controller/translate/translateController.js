
import {translateText} from "../../service/translate/translateService.js";

async function translate(req, res) {
    try {
        const { text, target, source } = req.body;

        // basic validation
        if (!text || !target) {
            return res.status(400).json({
                message: "text and target language are required",
            });
        }

        const translated = await translateText(
            text,
            target,
            source
        );

        return res.status(200).json({
            original: text,
            translated: translated,
            target: target,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}

export { translate };