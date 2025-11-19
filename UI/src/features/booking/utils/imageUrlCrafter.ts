// Generate from s3 bucket and region and image key
export function craftImageUrl(imageKey: string): string {
  const bucketName = import.meta.env.VITE_S3_BUCKET_NAME;
  const region = import.meta.env.VITE_S3_REGION;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${imageKey}`;
}