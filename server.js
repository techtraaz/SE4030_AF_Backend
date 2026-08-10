import dotenv from "dotenv";
import connectDB from "./src/config/database.js";

dotenv.config();

const { default: app } = await import("./src/app.js");

const PORT = process.env.PORT

await connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
