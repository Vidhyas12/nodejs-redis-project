const readline = require('readline');
const redis = require('ioredis');

const subscriber = redis.createClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function subscribeToChannel() {
  rl.question('Enter channel name to subscribe: ', (channel) => {
    subscriber.subscribe(channel, () => {
      console.log(`Subscribed to channel '${channel}'`);
    });

    subscriber.on('message', (subscribedChannel, message) => {
      console.log(`Received message from channel '${subscribedChannel}': ${message}`);
    });

    rl.on('SIGINT', () => {
      subscriber.unsubscribe();
      subscriber.quit();
      rl.close();
      process.exit(0);
    });
  });
}

subscribeToChannel();
