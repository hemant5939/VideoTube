//require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import dns from "dns";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// dotenv.config({
//     path: './.env'
// })

console.log(process.env.MONGODB_URI)
dns.setServers(["8.8.8.8", "1.1.1.1"]);   

console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API SECRET:", process.env.CLOUDINARY_API_SECRET);

connectDB()
.then(() => {
    app.listen(process.env.PORT ||  8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
        //console.log(`PID: ${process.pid}`);
        //console.log(`Started at: ${new Date().toISOString()}`);
    });
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with an error code
});























































/*
import express from 'express';

const app = express();

async(() => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log('Connected to MongoDB');

        app.on("error", (error) => {
            console.error('Error starting the server:', error);
        });

        app.listen(process.env.PORT,() => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }
    catch(error){
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
})();
*/
