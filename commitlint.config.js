module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 0 = disable, 1 = warning, 2 = error
    "subject-case": [0],
  },
};
