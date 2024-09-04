import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import RelatedPartyModel, { IRelatedParty } from "../models/stakeholders/RelatedPartyModel";

export default class RelatedPartyStore extends Store<IRelatedParty, RelatedPartyModel> {
    items = new Map<string, RelatedPartyModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IRelatedParty[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new RelatedPartyModel(this.store, item))
            );
        });
    }
}
