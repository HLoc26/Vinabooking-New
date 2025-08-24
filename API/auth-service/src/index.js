import express from "express";
const app = express();
app.use(express.json());

// Base route: /auth

app.get("/health", (req, res) => {
    res.json({ service: "Auth Service", success: true });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
