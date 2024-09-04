import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import AssetManagerFlowDayModel, { IAssetManagerFlowDay } from "../../models/AssetManagerFlowDayModel";

export default class AssetManagerFlowDayStore extends Store<IAssetManagerFlowDay, AssetManagerFlowDayModel> {
    items = new Map<string, AssetManagerFlowDayModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IAssetManagerFlowDay[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new AssetManagerFlowDayModel(this.store, item))
            );
        });
    }
}