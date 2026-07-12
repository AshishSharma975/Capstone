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
        await sendEmail(message.to, message.subject, message.text, message.html);
        channel.ack(msg);
    } catch(error){
        console.error('Error consuming message:', error);
    }

});

export default app;