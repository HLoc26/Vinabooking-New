import { Response } from "express";

/**
 * Gửi response thành công (HTTP 200 OK)
 * @param res Đối tượng Response của Express
 * @param data Dữ liệu cần gửi
 * @param statusCode Mã HTTP (mặc định 200)
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode: number = 200
) => {
    res.status(statusCode).json({
        success: true,
        data: data,
        error: null,
    });
};

/**
 * Gửi response tạo thành công (HTTP 201 Created)
 * @param res Đối tượng Response của Express
 * @param data Dữ liệu đã được tạo
 */
export const sendCreated = <T>(
    res: Response,
    data: T
) => {
    res.status(201).json({
        success: true,
        data: data,
        error: null,
    });
};

/**
 * Gửi response thành công nhưng không có nội dung (HTTP 204 No Content)
 * Thường dùng cho các request DELETE thành công.
 * @param res Đối tượng Response của Express
 */
export const sendNoContent = (res: Response) => {
    // 204 No Content không bao giờ được gửi kèm body
    res.status(204).send();
};
