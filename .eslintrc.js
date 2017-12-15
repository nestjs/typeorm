module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import",
  ],
  "rules": {
    "no-console": 0,
    "prefer-spread": 0,
    "no-underscore-dangle": 0,
    "max-len": ["error", 120],
    "linebreak-style": 0
  },
  "globals": {
    "describe": false,
    "it": false,
    "before": false,
    "beforeEach": false,
    "Promise": true,
  },
};
