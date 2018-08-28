const server = require('./src/app');
server.listen(server.port, () => {
  console.log(`bitcdn-resize is listening on port ${server.port}`);
});