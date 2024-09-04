import { runInAction } from "mobx";
import AssetManagerFlowLiabilityModel, { IAssetManagerFlowLiability } from "../../models/AssetManagerFlowLiabilityModel";
import AppStore from "../AppStore";
import Store from "../Store";

export default class AssetManagerFlowLiabilityStore extends Store<IAssetManagerFlowLiability, AssetManagerFlowLiabilityModel> {
    items = new Map<string, AssetManagerFlowLiabilityModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IAssetManagerFlowLiability[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new AssetManagerFlowLiabilityModel(this.store, item))
            );
        });
    }
}