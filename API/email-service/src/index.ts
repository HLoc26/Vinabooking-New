import GrpcServerFactory from "./GrpcServer";
import RestServer from "./RestServer";

const restServer = new RestServer();
restServer.start();

const grpcServer = GrpcServerFactory.createGrpcServer();
grpcServer.start();
