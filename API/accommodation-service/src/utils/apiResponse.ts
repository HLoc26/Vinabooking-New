import { Response } from "express";

/**
 * Sends a successful response (HTTP 200 OK).
 */
export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200) => {
	res.status(statusCode).json({
		success: true,
		data: data,
		error: null,
	});
};

/**
 * Sends a successful creation response (HTTP 201 Created).
 */
export const sendCreated = <T>(res: Response, data: T) => {
	res.status(201).json({
		success: true,
		data: data,
		error: null,
	});
};

/**
 * Sends a successful response with no content (HTTP 204 No Content).
 */
export const sendNoContent = (res: Response) => {
	res.status(204).send();
};
