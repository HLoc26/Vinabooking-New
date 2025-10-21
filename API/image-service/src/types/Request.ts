import { type Request } from "express";
import { EEntityType } from "../../generated/prisma/index.js";
import type { ApiResponse, UploadResponse } from "./Response";

export type ImageUploadType = "profile" | "accommodation" | "room" | "review";

export const ImageUploadMapper: Record<ImageUploadType, EEntityType> = {
    profile: EEntityType.USER_PROFILE,
    accommodation: EEntityType.ACCOMMODATION,
    room: EEntityType.ROOM,
    review: EEntityType.REVIEW,
};

export interface UploadRequestType {
    type: ImageUploadType;
    id: string;
}

export type UploadRequest = Request<UploadRequestType, unknown, ApiResponse<UploadResponse>, unknown>;
