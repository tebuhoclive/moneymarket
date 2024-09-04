import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import CloseOutDistributionModel, { ICloseOutDistribution } from "../../models/close-outs/CloseOutModel";

export default class CloseOutDistributionStore extends Store<ICloseOutDistribution, CloseOutDistributionModel> {
    items = new Map<string, CloseOutDistributionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICloseOutDistribution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CloseOutDistributionModel(this.store, item))
            );
        });
    }
}