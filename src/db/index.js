import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB Connected");
        console.log(`Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;