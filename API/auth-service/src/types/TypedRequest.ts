import { type Request } from "express";

/// <reference types="express-serve-static-core" />
import type { ParamsDictionary } from "express-serve-static-core";

export type TypedRequest<T> = Request<ParamsDictionary, any, T>;
