import dotenv from "dotenv";

dotenv.config();

export default {
	port: process.env.PORT || 3001,
	userEndpoint: process.env.USER_ENDPOINT || "http://localhost:3006",
	roomEndpoint: process.env.ROOM_ENDPOINT || "http://localhost:3005",
	imageEndpoint: process.env.IMAGE_ENDPOINT || "http://localhost:3007",
	reviewEndpoint: process.env.REVIEW_ENDPOINT || "http://localhost:3004",
};
