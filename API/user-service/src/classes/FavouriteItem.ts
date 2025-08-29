import { type IFavouriteItem } from "../types/Favourite.ts";

class FavouriteItem {
    #id: string;
    #accommodationId: string;

    constructor(props: IFavouriteItem) {
        this.#id = props.id;
        this.#accommodationId = props.accommodationId;
    }

    public toJson() {
        return {
            id: this.id,
            accommodationId: this.accommodationId,
        };
    }

    get id() {
        return this.#id;
    }
    get accommodationId() {
        return this.#accommodationId;
    }
    set accommodationId(newId: string) {
        this.#accommodationId = newId;
    }
}

export default FavouriteItem;
