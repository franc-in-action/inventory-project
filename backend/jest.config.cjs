module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid)/)", // transpile uuid module
  ],
  moduleFileExtensions: ["js", "json", "node"],
};
