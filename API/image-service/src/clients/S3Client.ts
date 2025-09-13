import { S3Client } from "@aws-sdk/client-s3";

class S3ClientSingleton {
    private static s3: S3Client;
    public static readonly bucketName = process.env["AWS_BUCKET_NAME"];
    constructor() {}
    public static getInstance() {
        if (!S3ClientSingleton.s3) {
            S3ClientSingleton.s3 = new S3Client({
                region: process.env["AWS_REGION"]!,
                credentials: {
                    accessKeyId: process.env["AWS_ACCESS_KEY_ID"]!,
                    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"]!,
                },
            });
        }
        return S3ClientSingleton.s3;
    }
}

export default S3ClientSingleton;
