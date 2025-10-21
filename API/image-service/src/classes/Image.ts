import type { IImage } from "../types/Image";

class Image {
    #id: string;
    #s3Key: string;
    #filename: string;
    #contentType: string;
    #size: bigint; // In bytes
    #createdAt: Date;

    constructor(props: IImage) {
        this.#id = props.id;
        this.#s3Key = props.s3Key;
        this.#filename = props.filename;
        this.#contentType = props.contentType;
        this.#size = props.size;
        this.#createdAt = props.createdAt || new Date();
    }

    get id() {
        return this.#id;
    }
    get s3Key() {
        return this.#s3Key;
    }
    get filename() {
        return this.#filename;
    }
    get contentType() {
        return this.#contentType;
    }
    get size() {
        return this.#size;
    }
    get createdAt() {
        return this.#createdAt;
    }
    set s3Key(newKey: string) {
        this.#s3Key = newKey;
    }
    set filename(newName: string) {
        this.#filename = newName;
    }
    set contentType(newType: string) {
        if (!/image\/*/.test(newType)) {
            throw new Error("New type must have the pattern image/*");
        }
        this.#contentType = newType;
    }
    set size(newSize: bigint) {
        this.#size = newSize;
    }
}

export default Image;
