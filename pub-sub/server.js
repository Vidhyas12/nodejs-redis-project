const readline = require('readline');
const redis = require('ioredis');

const client = redis.createClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function startServer() {
  rl.question('Enter channel name to listen: ', (channel) => {
    client.subscribe(channel, () => {
      console.log(`Server subscribed to channel '${channel}'`);
    });

    client.on('message', (subscribedChannel, message) => {
      console.log(`Received message from channel '${subscribedChannel}' in server.js: ${message}`);
    });

    rl.on('SIGINT', () => {
      client.unsubscribe();
      client.quit();
      rl.close();
      process.exit(0);
    });
  });
}

startServer();
