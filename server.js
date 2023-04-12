import app from "./app.js";
import { connectDB } from "./config/database.js";

// Connect with Database
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`server is working on PORT: ${process.env.PORT}`);
});
