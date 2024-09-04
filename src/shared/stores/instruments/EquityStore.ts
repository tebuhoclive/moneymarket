import { runInAction, toJS } from "mobx";
import EquityModel, { IEquity } from "../../models/instruments/EquityModel";
import AppStore from "../AppStore";
import Store from "../Store";

export default class EquityStore extends Store<IEquity, EquityModel> {
    items = new Map<string, EquityModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEquity[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EquityModel(this.store, item))
            );
        });
    }
    
    get approvedEquities() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "approved");
    }
    get pendingEquities() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "pending");
    }

    getByItemShareCode(shareCode: string) {
        const list = Array.from(toJS(this.items.values()));
        return list.find((item) => item.asJson.sharecode === shareCode);
    }
}