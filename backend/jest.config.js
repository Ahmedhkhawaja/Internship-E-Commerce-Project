module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
    testTimeout: 30000,
    coverageThreshold: {
        global: {
            statements: 75,
            branches: 50,
            functions: 70,
            lines: 75
        }
    }
};

