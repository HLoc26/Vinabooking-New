import express from "express";
const app = express();
app.use(express.json());

// Base route: /accommodations

app.get("/health", (req, res) => {
    res.json({ service: "Accommodation Service", success: true });
});

app.get("/:id", (req, res) => {
    res.json({ id: req.params.id, name: "Chung Cu 123", location: "Tp.HCM" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Accommodation Service running on port ${PORT}`));
