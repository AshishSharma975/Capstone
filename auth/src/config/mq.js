import amqplib from "amqplib";

const QUEUE = 'auth_notification_queue';
let channel = null;

async function connectRabbitMQ() {
    const maxRetries = 30;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            console.log(`Connecting to RabbitMQ in Auth Service (attempt ${retries + 1}/${maxRetries})...`);
            const connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            
            connection.on('error', (err) => {
                console.error('RabbitMQ connection error in Auth Service:', err.message);
                channel = null;
                reconnect();
            });
            connection.on('close', () => {
                console.warn('RabbitMQ connection closed in Auth Service. Reconnecting...');
                channel = null;
                reconnect();
            });

            channel = await connection.createChannel();
            await channel.assertQueue(QUEUE, {durable: true});
            console.log("RabbitMQ connected successfully in Auth Service.");
            return;
        } catch (err) {
            retries++;
            console.warn(`RabbitMQ connection failed in Auth Service (attempt ${retries}/${maxRetries}):`, err.message);
            if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    console.error("Failed to connect to RabbitMQ in Auth Service after maximum retries. Notifications will not be sent.");
}

let reconnecting = false;
async function reconnect() {
    if (reconnecting) return;
    reconnecting = true;
    await connectRabbitMQ();
    reconnecting = false;
}

// Start connection in the background so it doesn't block server startup
connectRabbitMQ().catch(err => console.error("RabbitMQ initialization error:", err));

function publishToQueue(queue, content){
    if (!channel) return console.warn("No RabbitMQ channel, skipping publishToQueue");
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {persistent: true});
}

export async function sendAuthNotification(message) {
    if (!channel) return console.warn("No RabbitMQ channel, skipping sendAuthNotification");
    try {
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log('Notification sent:', message);
    } catch (err) {
        console.error('Failed to send auth notification:', err.message);
    }
}