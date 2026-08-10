import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Language Learning App API",
            version: "1.0.0",
            description: "Authentication API Documentation"
        },
        servers: [
            {
                url: process.env.API_BASE_URL || "http://localhost:5000",
                description: process.env.NODE_ENV === "production" ? "Production Server" : "Development Server",
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: [
        "./src/docs/*.js",
        "./src/docs/**/*.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
