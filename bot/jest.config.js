module.exports = {
  // discord.js needs fetch and web streams, which the node environment exposes from Jest 28 on.
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
