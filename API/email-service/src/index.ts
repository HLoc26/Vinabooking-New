import GrpcServerFactory from "./GrpcServer";
import RestServer from "./RestServer";

import dotenv from "dotenv";
dotenv.config();

const restServer = new RestServer();
restServer.start();

const grpcServer = GrpcServerFactory.createGrpcServer();
grpcServer.start();
