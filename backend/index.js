import app from "./app.js";
import connectDB from "./config/db.js";
import { initSyncCron } from "./cron/sync.cron.js";

const PORT = process.env.PORT || 4000;

await connectDB();
initSyncCron();

app.listen(PORT, () => {
  console.log("FarmTrack Server is running on port " + PORT);
});