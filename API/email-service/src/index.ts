import GrpcServerFactory from "./GrpcServer";
import RestServer from "./restServer";

const restServer = new RestServer();
restServer.start();

const grpcServer = GrpcServerFactory.createGrpcServer();
grpcServer.start();
