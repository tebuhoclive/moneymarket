import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import HashCodeModel, { IHashCode } from "../../models/hash-codes/HashCodeModel";


export default class HashCodeStore extends Store<IHashCode, HashCodeModel> {
    items = new Map<string, HashCodeModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IHashCode[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new HashCodeModel(this.store, item))
            );
        });
    }
}