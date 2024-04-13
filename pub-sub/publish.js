const readline = require('readline');
const redis = require('ioredis');

const publisher = redis.createClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function publishMessage() {
  rl.question('Enter channel name: ', (channel) => {
    rl.question('Enter message to publish: ', (message) => {
      publisher.publish(channel, message, (err) => {
        if (err) {
          console.error('Error publishing message:', err);
        } else {
          console.log(`Message published to channel '${channel}': ${message}`);
        }
        rl.question('Do you want to publish another message? (yes/no): ', (answer) => {
          if (answer.toLowerCase() === 'yes') {
            publishMessage();
          } else {
            rl.close();
            publisher.quit();
            process.exit(0);
          }
        });
      });
    });
  });
}

publishMessage();
