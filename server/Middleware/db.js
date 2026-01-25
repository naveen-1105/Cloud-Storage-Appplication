import mongoose from "mongoose";

export async function connectDB(){
    try {
        await mongoose.connect("mongodb://naveen:naveenwifi13@localhost:27017/storageApp?replicaSet=myReplicaSet")
        console.log('Database connected');
    } catch (error) {
        console.log(error);
        console.log("Could not connect to database");
        process.exit(1)
    }
}

