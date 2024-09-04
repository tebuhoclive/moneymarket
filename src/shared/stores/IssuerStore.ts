import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import IssuerModel, { IIssuer } from "../models/IssuerModel";

export default class IssuerStore extends Store<IIssuer, IssuerModel> {
    items = new Map<string, IssuerModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IIssuer[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new IssuerModel(this.store, item))
            );
        });
    }
}