import express from "express";
import morgan from "morgan";

const app = express();

app.use(express.json());

app.use(morgan('dev'));


app.get('/notify', (req, res) => {
    res.json({ message: 'Notification Service is Running...' });
});



export default app;