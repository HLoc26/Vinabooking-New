import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { type Express } from "express";

export function setupSwagger(app: Express) {
    const swaggerDoc = YAML.load("./src/docs/swagger.yaml");
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}
