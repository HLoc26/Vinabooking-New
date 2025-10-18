import { Request, Response } from "express";
import { findAccommodationById } from "../services/accommodation.service.js";

export const getHealth = (_req: Request, res: Response) => {
    res.json({ service: "Accommodation Service", success: true });
};

export const getAccommodationById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ error: "Missing id parameter" });

        const accommodation = await findAccommodationById(id);
        if (!accommodation) return res.status(404).json({ error: "Not found" });

        res.json(accommodation);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
