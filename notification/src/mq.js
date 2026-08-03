import amqplib from "amqplib";

const QUEUE = 'auth_notification_queue';
const maxRetries = 30;
let retries = 0;
let connection;
let channel;

while (retries < maxRetries) {
    try {
        console.log(`Connecting to RabbitMQ in Notification Service (attempt ${retries + 1}/${maxRetries})...`);
        connection = await amqplib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE, {durable: true});
        console.log("RabbitMQ connected successfully in Notification Service.");
        break;
    } catch (err) {
        retries++;
        console.error(`RabbitMQ connection failed in Notification Service (attempt ${retries}/${maxRetries}):`, err.message);
        if (retries >= maxRetries) {
            throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

connection.on('error', (err) => {
    console.error('RabbitMQ connection error in Notification Service:', err.message);
});
connection.on('close', () => {
    console.warn('RabbitMQ connection closed in Notification Service. Exiting process to trigger restart...');
    process.exit(1);
});

function publishToQueue(queue, content){
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {persistent: true});
}

export default channel;
// Trigger sync
