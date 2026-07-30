const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

async function translateText(text, target, source) {
    try {
        const url = `${TRANSLATE_URL}?key=${process.env.TRANSLATE_KEY}`;

        const body = {
            q: text,
            target: target,
            format: "text",
        };

        // optional source
        if (source) {
            body.source = source;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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

export {translateText};