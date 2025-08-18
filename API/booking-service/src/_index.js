import express from "express";
const app = express();
app.use(express.json());

// Base route: /booking

app.get("/health", (req, res) => {
	res.json({ service: "Booking Service", success: true });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
