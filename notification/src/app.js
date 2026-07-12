import express from "express";
import morgan from "morgan";
import {sendEmail} from "./email.js";
import channel from "./mq.js";

const app = express();

app.use(express.json());

app.use(morgan('dev'));


app.get('/notify', (req, res) => {
    res.json({ message: 'Notification Service is Running...' });
});

app.get("/_status/healthz", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.get("/_status/readyz", (req, res) => {
    if(channel){
        res.status(200).json({
            status: "ok"
        });
    } else {
        res.status(500).json({
            status: "not ready"
        });
    }
});

channel.consume('auth_notification_queue', async (msg) => {
    try {
        if (!msg) {
            console.error('No message received');
            return;
        }   
        const message = JSON.parse(msg.content.toString());
        
        if (message.type === 'USER_CREATED' && message.data && message.data.email) {
            const to = message.data.email;
            const subject = "Welcome to the App!";
            const text = `Hi ${message.data.name},\n\nYour registration was successful. Welcome aboard!`;
            const html = `<h2>Welcome, ${message.data.name}!</h2><p>Your registration was successful. Welcome aboard!</p>`;
            await sendEmail(to, subject, text, html);
        } else if (message.type === 'USER_LOGGED_IN' && message.data && message.data.email) {
            const to = message.data.email;
            const subject = "New Login Alert";
            const text = `Hi ${message.data.name},\n\nA new login was detected on your account.`;
            const html = `<h2>Login Alert</h2><p>Hi ${message.data.name},</p><p>A new login was detected on your account.</p>`;
            await sendEmail(to, subject, text, html);
        } else {
            console.log('Unknown message type or missing email:', message);
        }
        
        channel.ack(msg);
    } catch(error){
        console.error('Error consuming message:', error);
    }

});

export default app;