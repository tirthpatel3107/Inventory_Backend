import mongoose from "mongoose";

export const connectDB = () => {
  mongoose.set("strictQuery", true);
  mongoose.set("strictPopulate", false);
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`mongoDB connected with server: ${data.connection.host}`);
    });

  mongoose.connection.on("disconnected", () => {
    console.log("mongoDB disconnected!");
  });
};

