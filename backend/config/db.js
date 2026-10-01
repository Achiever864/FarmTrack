import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if(mongoose.connections[0].readyState) return;
        
        const connect = await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB: Connection Established;", connect.connection.host)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default connectDB;