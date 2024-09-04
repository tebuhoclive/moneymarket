import { runInAction } from "mobx";
import AssetManagerFlowAssetModel, { IAssetManagerFlowAsset } from "../../models/AssetManagerFlowAssetModel";
import AppStore from "../AppStore";
import Store from "../Store";

export default class AssetManagerFlowAssetStore extends Store<IAssetManagerFlowAsset, AssetManagerFlowAssetModel> {
    items = new Map<string, AssetManagerFlowAssetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IAssetManagerFlowAsset[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new AssetManagerFlowAssetModel(this.store, item))
            );
        });
    }
}