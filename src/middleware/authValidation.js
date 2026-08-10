// src/middleware/authValidation.js [NEW FILE]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const validateSignup = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Type check — prevent NoSQL injection objects like { "$gt": "" }
    if (!email || typeof email !== "string") {
        errors.push("A valid email address is required.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.push("Email format is invalid.");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required.");
    } else if (password.length < MIN_PASSWORD_LENGTH) {
        errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }

    if (errors.length > 0) {
        return res.badRequest("Validation failed", errors);
    }

    // Sanitize: ensure email is a plain string (prevents operator injection)
    req.body.email = String(email).trim().toLowerCase();
    req.body.password = String(password);

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== "string") {
        errors.push("Email is required.");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required.");
    }

    if (errors.length > 0) {
        return res.badRequest("Validation failed", errors);
    }

    // Sanitize
    req.body.email = String(email).trim().toLowerCase();
    req.body.password = String(password);

    next();
};

export { validateSignup, validateLogin };
