import express from "express";
import cors from "cors";
import mediasRoutes from "./Media/index.js";

const server = express();
server.use(express.json());
server.use(cors());
const port = process.env.PORT;

server.use("/media", mediasRoutes);
server.listen(port, () => console.log("Server running on port:", port));
