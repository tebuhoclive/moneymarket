import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import BondModel, { IBond } from "../../models/instruments/BondModel";

export default class BondStore extends Store<IBond, BondModel> {
    items = new Map<string, BondModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IBond[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BondModel(this.store, item))
            );
        });
    }

    get approvedBonds() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "approved");
    }
    get pendingBonds() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "pending");
    }

    getByItemInstrumentName(instrumentName: string) {
        const list = Array.from(toJS(this.items.values()));
        return list.find((item) => item.asJson.instrumentName === instrumentName);
    }
}