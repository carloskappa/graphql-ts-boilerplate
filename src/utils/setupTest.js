require("ts-node/register");
const { startServer } = require("../startServer");
// If you want to reference other typescript modules, do it via require:

module.exports = async function() {
  // Call your initialization methods here.

  if (!process.env.TEST_HOST) {
    await setup();
  }
  return null;
};

const setup = async () => {
  const app = await startServer();
  const { port } = app.address();
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};
