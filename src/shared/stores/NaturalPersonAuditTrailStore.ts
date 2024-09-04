import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import NaturalPersonAuditTrailModel, { INaturalPersonAuditTrail } from "../models/clients/NaturalPersonAuditTrailModel";

export default class NaturalPersonAuditTrailStore extends Store<INaturalPersonAuditTrail, NaturalPersonAuditTrailModel> {
    items = new Map<string, NaturalPersonAuditTrailModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: INaturalPersonAuditTrail[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new NaturalPersonAuditTrailModel(this.store, item))
            );
        });
    }
}