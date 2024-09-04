import AppStore from "./AppStore";
import AssetManagerFlowAssetStore from "./asset-manger-flow/AssetManagerFlowAssetStore";
import AssetManagerFlowDayStore from "./asset-manger-flow/AssetManagerFlowDayStore";
import AssetManagerFlowLiabilityStore from "./asset-manger-flow/AssetManagerFlowLiabilityStore";

export default class ClientsStore {
    day: AssetManagerFlowDayStore;
    asset: AssetManagerFlowAssetStore;
    liability: AssetManagerFlowLiabilityStore;

    constructor(store: AppStore) {
        this.day = new AssetManagerFlowDayStore(store);
        this.asset = new AssetManagerFlowAssetStore(store);
        this.liability = new AssetManagerFlowLiabilityStore(store);
    }
}