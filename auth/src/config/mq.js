import amqplib from "amqplib";


const QUEUE = 'auth_notification_queue';

const connection = await amqplib.connect(process.env.RABBITMQ_URL);
const channel = await connection.createChannel();

channel.assertQueue(QUEUE, {durable: true});

function publishToQueue(queue, content){
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {persistent: true});
}

export async function sendAuthNotification(message) {
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('Notification sent:', message);
}