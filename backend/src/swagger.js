const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN E-commerce API",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJSDoc(options);
