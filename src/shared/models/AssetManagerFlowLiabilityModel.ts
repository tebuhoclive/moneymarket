import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultAssetManagerFlowLiability: IAssetManagerFlowLiability = {
    id: "",
    flowDate: Date.now(),
    productId: "",
    toAccount: "",
    // openingBalance: 0,
    netflows: 0,
    depositAmount: 0,
    numberOfDepositUnits: 0,
    withdrawalAmount: 0,
    numberOfWithdrawalUnits:0,
    // closingBalance: number;
   
}

export interface IAssetManagerFlowLiability {
    id: string;
    flowDate: number;
    productId: string;
    toAccount: string;
    // openingBalance: number;
    netflows: number;
    depositAmount: number;
    numberOfDepositUnits: number;
    withdrawalAmount: number;
    numberOfWithdrawalUnits: number;
    // closingBalance: number;
}

export default class AssetManagerFlowLiabilityModel {
    private assetManagerFlow: IAssetManagerFlowLiability;

    constructor(private store: AppStore, assetManagerFlow: IAssetManagerFlowLiability) {
        makeAutoObservable(this);
        this.assetManagerFlow = assetManagerFlow;
    }

    get asJson(): IAssetManagerFlowLiability {
        return toJS(this.assetManagerFlow);
    }
}