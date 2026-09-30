import "dotenv/config";
import express from "express";
import cors from "cors";
import ndviRoutes from "./routes/ndvi.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/ndvi", ndviRoutes);

app.listen(process.env.PORT || 3000, () => console.log("up"));