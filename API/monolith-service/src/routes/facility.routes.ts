import { Router } from "express";
import FacilityController from "../controllers/facility.controller";

// Base route: /facilities
class FacilityRouter {
	readonly #facilityController: FacilityController;
	constructor(
		public router: Router,
		facilityController: FacilityController
	) {
		this.#facilityController = facilityController;
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.get("/", (req, res) => {
			return this.#facilityController.getAll(req, res);
		});
	}
}

export default FacilityRouter;
