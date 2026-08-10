const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

async function translateText(text, target, source) {
    try {
        const body = {
            q: text,
            target: target,
            format: "text",
        };

        if (source) {
            body.source = source;
        }

        const response = await fetch(TRANSLATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.TRANSLATE_KEY,  // Key in header, not URL
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Translation failed");
        }

        return data.data.translations[0].translatedText;

    } catch (error) {
        throw new Error(`Service Error: ${error.message}`);
    }
}

export { translateText };