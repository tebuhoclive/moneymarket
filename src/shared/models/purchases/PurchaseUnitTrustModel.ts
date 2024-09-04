import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultPurchaseUnitTrust: IPurchaseUnitTrust = {
    id: "",
    entityId: "",
    account: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    counterParty: "",
    counterPartyId: "",
    instrumentName: "",
    instrumentId: ""
}
export interface IPurchaseUnitTrust {
    id: string;
    entityId: string;
    account: string;
    tradeDate: number;
    settlementDate: number;
    counterParty: string;
    counterPartyId: string;
    instrumentName: string;
    instrumentId: string;
}

export default class PurchaseUnitTrustModel {
    private unitTrust: IPurchaseUnitTrust;

    constructor(private store: AppStore, unitTrust: IPurchaseUnitTrust) {
        makeAutoObservable(this);
        this.unitTrust = unitTrust;
    }

    get asJson(): IPurchaseUnitTrust {
        return toJS(this.unitTrust);
    }
}

