import dotenv from "dotenv";
dotenv.config({ path: ["../common.env", ".env"] });

import { startRest } from "./restServer";
import { startGrpc } from "./grpcServer";

startGrpc();
startRest();
