import dotenv from "dotenv";
dotenv.config({ path: ["../common.env", ".env"] });
import app from "./app";

const PORT = process.env["PORT"] || 3004;

app.listen(PORT, () => {
	console.log(`Review Service running on port ${PORT}`);
});
