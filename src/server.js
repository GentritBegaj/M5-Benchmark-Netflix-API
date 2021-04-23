import express from "express";
import cors from "cors";
import mediasRoutes from "./Media/index.js";
import reviewsRoutes from "./Reviews/index.js";

const server = express();
server.use(express.json());
server.use(cors());
const port = process.env.PORT;
server.use("/media", mediasRoutes);
server.use("/reviews", reviewsRoutes);
server.listen(port, () => console.log("Server running on port:", port));
