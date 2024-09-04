import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import CounterPartyModel, { ICounterParty } from "../../models/clients/counter-party/CounterPartyModel";

export default class CounterPartyStore extends Store<ICounterParty, CounterPartyModel> {
    items = new Map<string, CounterPartyModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICounterParty[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CounterPartyModel(this.store, item))
            );
        });
    }
}