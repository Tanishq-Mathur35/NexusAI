import { createServer } from "http";
import app from "./app.js";
import connectDB from "./config/database.js";
import { initializeSocket } from "./sockets/socketManager.js";

import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initializeSocket(httpServer);

connectDB().then(() =>
    httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`)),
);
