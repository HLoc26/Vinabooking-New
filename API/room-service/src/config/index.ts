import dotenv from "dotenv";

dotenv.config({ path: ["../common.env", ".env"] });

export default {
	port: process.env.PORT || 3005,
	roomEndpoint: process.env.ACCOMMODATION_ENDPOINT || "http://localhost:3001",
	imageEndpoint: process.env.IMAGE_ENDPOINT || "http://localhost:3007",
};
