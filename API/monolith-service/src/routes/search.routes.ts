import { Router, Request, Response } from "express";
import RoomController from "@/controllers/room.controller";
import SearchController from "@/controllers/search.controller";
import { SemanticSearchRequest } from "@/dto/request/search.dto";

/**
 * Base: /api/search
 */
class SearchRouter {
	constructor(
		public router: Router,
		private readonly searchController: SearchController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.get("/semantic", (req: Request, res: Response) => {
			return this.searchController.semanticSearch(req as unknown as SemanticSearchRequest, res);
		});
	}
}

export default SearchRouter;
