// server.js
import dotenv from "dotenv";
import app from "./app.js";

// Load .env at the very start
dotenv.config();

const PORT = process.env.PORT || 4044;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
