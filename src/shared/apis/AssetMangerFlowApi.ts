import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import AssetManagerFlowAssetApi from "./asset-manager-flow/AssetManagerFlowAssetApi";
import AssetManagerFlowDayApi from "./asset-manager-flow/AssetManagerFlowDayApi";
import AssetManagerFlowLiabilityApi from "./asset-manager-flow/AssetManagerFlowLiabilityApi";

export default class AssetMangerFlowApi {
    day: AssetManagerFlowDayApi
    asset: AssetManagerFlowAssetApi;
    liability: AssetManagerFlowLiabilityApi;

    constructor(api: AppApi, store: AppStore) {
        this.day = new AssetManagerFlowDayApi(api, store);
        this.asset = new AssetManagerFlowAssetApi(api, store);
        this.liability = new AssetManagerFlowLiabilityApi(api, store);
    }
}