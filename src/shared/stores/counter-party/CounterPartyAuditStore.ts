import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import CounterPartyOnboardAuditModel, { ICounterPartyOnboardAudit } from "../../models/clients/counter-party/CounterPartyOnboardAuditModel";

export default class CounterPartyOnboardAuditStore extends Store<ICounterPartyOnboardAudit, CounterPartyOnboardAuditModel> {
    items = new Map<string, CounterPartyOnboardAuditModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICounterPartyOnboardAudit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CounterPartyOnboardAuditModel(this.store, item))
            );
        });
    }
}