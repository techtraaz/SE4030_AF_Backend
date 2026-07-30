import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

import connectDB from "./src/config/database.js";

const PORT = process.env.PORT

await connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
