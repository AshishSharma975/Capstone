import express from "express"
import morgan from "morgan"


const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({
        message: "OK Chachu",
        status: 200,
        timestamp: new Date().toISOString()
    });
});

app.get("/api/ash",(req,res)=>{
    res.status(200).json({
        message:"yeeahh",
        status:200,
        timestamp:new Date().toISOString(),
        data:{
            name:"Ash",
            age:20
        }
    })
})


export default app;
