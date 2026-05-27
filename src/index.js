// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import dns from "dns";
//import mongoose from 'mongoose';

import connectDB from "./db/index.js";
//import {app} from './app.js'
dotenv.config({
    path: './.env'
})

dns.setServers(["8.8.8.8", "1.1.1.1"]);

connectDB();


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
