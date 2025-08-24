import express from "express";
const app = express();
app.use(express.json());

// Base route: /rooms

app.get("/health", (req, res) => {
    res.json({ service: "Room Service", success: true });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Room Service running on port ${PORT}`));
