import amqplib from "amqplib";


const QUEUE = 'auth_notification_queue';

let channel;

try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    channel.assertQueue(QUEUE, {durable: true});
    console.log("RabbitMQ connected successfully.");
} catch (err) {
    console.warn("RabbitMQ connection failed:", err.message);
    console.warn("Auth server is running without RabbitMQ. Notifications will not be sent.");
}

function publishToQueue(queue, content){
    if (!channel) return console.warn("No RabbitMQ channel, skipping publishToQueue");
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {persistent: true});
}

export async function sendAuthNotification(message) {
    if (!channel) return console.warn("No RabbitMQ channel, skipping sendAuthNotification");
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('Notification sent:', message);
}