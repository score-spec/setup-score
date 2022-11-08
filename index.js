const core = require('@actions/core');

const setup = require('./lib/setup-score');

(async () => {
  try {
    await setup();
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
})();