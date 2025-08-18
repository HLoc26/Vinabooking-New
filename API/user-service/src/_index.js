import express from "express";
const app = express();
app.use(express.json());

// Base route: /users

app.get("/health", (req, res) => {
	res.json({ service: "User Service", success: true });
});

app.get("/:id", (req, res) => {
	res.json({ id: req.params.id, name: "Nguyen Van A" });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
