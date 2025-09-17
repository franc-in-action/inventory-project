// server.js
import dotenv from "dotenv";

// Load .env at the very start
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 4044;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
