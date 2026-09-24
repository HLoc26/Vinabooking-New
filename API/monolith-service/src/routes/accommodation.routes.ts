import { Router, Request, Response } from "express";
import AccommodationController from "../controllers/accommodation.controller";

import { GetAccommodationByIdRequest, GetAccommodationByEntityRequest, GetAccommodationCountRequest, SearchAccommodationRequest, PostAccommodationIdsRequest } from "@/dto/request";

class AccommodationRouter {
	constructor(
		public router: Router,
		private accommodationController: AccommodationController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		// GET /stats
		this.router.get("/stats", (req: Request, res: Response) => this.accommodationController.getHomepageStats(req, res));

		// GET /count?city=...&type=...
		this.router.get("/count", (req: Request, res: Response) => this.accommodationController.getCount(req as GetAccommodationCountRequest, res));

		// GET /search
		this.router.get("/search", (req: Request, res: Response) => this.accommodationController.search(req as SearchAccommodationRequest, res));

		/**
		 * GET /?byEntity=room&entityId=:roomId
		 */
		this.router.get("/", (req: Request, res: Response) => this.accommodationController.getAccommodations(req as GetAccommodationByEntityRequest, res));

		/**
		 * POST /_mget
		 * Use POST /_mget (though it does not follow the RESTful convention) for 2 reasons:
		 *   1. Already have a GET accommodations/ route
		 *	 2. List of IDs could be too long for GET (414 URI too long)
		 */
		this.router.post("/_mget", (req: Request, res: Response) => this.accommodationController.getAccommodationsBatch(req as PostAccommodationIdsRequest, res));

		// GET /:id
		this.router.get("/:id", (req: Request, res: Response) => this.accommodationController.getById(req as unknown as GetAccommodationByIdRequest, res));
	}
}

export default AccommodationRouter;
