import express from "express";
const app = express();
app.use(express.json());

// Base route: /reviews

app.get("/health", (req, res) => {
    res.json({ service: "Review Service", success: true });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Review Service running on port ${PORT}`));
