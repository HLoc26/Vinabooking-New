import express from "express";
const app = express();
app.use(express.json());

// Base route: /image

app.get("/health", (_req, res) => {
    res.json({ service: "Image Service", success: true });
});

const PORT = process.env["PORT"] || 3007;
app.listen(PORT, () => console.log(`Image Service running on port ${PORT}`));
