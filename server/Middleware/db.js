import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

export async function connectDB(){
    try {
        await mongoose.connect(process.env.mongo_url)
        console.log('Database connected');
    } catch (error) {
        console.log(error);
        console.log("Could not connect to database");
        process.exit(1)
    }
}

