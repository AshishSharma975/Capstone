import "dotenv/config";
import app from "./src/app";

const PORT = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Notification server running on port ${port}`);
});