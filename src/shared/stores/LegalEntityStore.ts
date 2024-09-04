import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import LegalEntityModel, { ILegalEntity } from "../models/clients/LegalEntityModel";

export default class LegalEntityStore extends Store<ILegalEntity, LegalEntityModel> {
    items = new Map<string, LegalEntityModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ILegalEntity[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new LegalEntityModel(this.store, item))
            );
        });
    }
}