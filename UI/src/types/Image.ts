export type Image = {
    id: string,
    url: string,
    variant: "ORIGINAL" | "THUMBNAIL" | "WEBP" | "OPTIMIZED",
    imageId: string,
    isPrimary: boolean,
};

/**
 * @deprecated use Image instead
 */
export type ImageType = {
    id: string,
    url: string,
    variant: "ORIGINAL" | "WEBP" | "OPTIMIZED" | "THUMBNAIL",
    imageId: string,
};
