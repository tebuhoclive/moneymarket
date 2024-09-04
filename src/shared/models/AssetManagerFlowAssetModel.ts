import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultAssetManagerFlowAsset: IAssetManagerFlowAsset = {
    id: "",
    flowDate: Date.now(),
    productId: "",
    toFromAccount: "",
    openingUnits: 0,
    netflows: 0,
    depositAmount: 0,
    numberOfDepositUnits: 0,
    withdrawalAmount: 0,
    numberOfWithdrawalUnits:0,
    closingUnits: 0
}

export interface IAssetManagerFlowAsset {
    id: string;
    flowDate: number;
    productId: string;
    toFromAccount: string,
    openingUnits: number;
    netflows: number;
    depositAmount: number;
    numberOfDepositUnits: number;
    withdrawalAmount: number;
    numberOfWithdrawalUnits: number;
    closingUnits: number;
}

export default class AssetManagerFlowAssetModel {
    private assetManagerFlow: IAssetManagerFlowAsset;

    constructor(private store: AppStore, assetManagerFlow: IAssetManagerFlowAsset) {
        makeAutoObservable(this);
        this.assetManagerFlow = assetManagerFlow;
    }

    get asJson(): IAssetManagerFlowAsset {
        return toJS(this.assetManagerFlow);
    }
}