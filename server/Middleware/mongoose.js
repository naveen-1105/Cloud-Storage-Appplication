import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

await mongoose.connect(process.env.mongoose_url)