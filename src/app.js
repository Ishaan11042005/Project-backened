import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
    ORIGIN:process.env.CORS_ORIGIN?.split(",")|| "http://localhost:5173",
    credential:true,
    methods:["GET","POST","PATCH","DELETE","OPTIONS"],
    allowHeaders:["Content-Type","Authorization"],
}),);

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js"
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);

app.get("/",(req,res) =>{
    res.send("start");
});
app.get("/instagram",(req,res) =>{
    res.send("hello");
});

export default app;
