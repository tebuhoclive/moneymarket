import { runInAction } from "mobx";
import Store from "./Store";
import AppStore from "./AppStore";
import SwitchAuditModel, { ISwitchAudit } from "../models/SwitchAuditModel";

export default class SwitchAuditStore extends Store<ISwitchAudit, SwitchAuditModel> {
    items = new Map<string, SwitchAuditModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISwitchAudit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SwitchAuditModel(this.store, item))
            );
        });
    }
}