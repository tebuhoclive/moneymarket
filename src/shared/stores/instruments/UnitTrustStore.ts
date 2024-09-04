import { runInAction } from "mobx";
import UnitTrustModel, { IUnitTrust } from "../../models/instruments/UnitTrustModel";
import AppStore from "../AppStore";
import Store from "../Store";

export default class UnitTrustStore extends Store<IUnitTrust, UnitTrustModel> {
    items = new Map<string, UnitTrustModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IUnitTrust[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new UnitTrustModel(this.store, item))
            );
        });
    }
    get approvedUnitTrusts() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "approved");
    }
    get pendingUnitTrusts() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "pending");
    }
}