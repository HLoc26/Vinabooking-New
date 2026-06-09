// reflect-metadata MUST be imported before any decorated class is loaded.
import "reflect-metadata";
import "dotenv/config";
import { Application } from "@/Application";

void new Application().bootstrap();
