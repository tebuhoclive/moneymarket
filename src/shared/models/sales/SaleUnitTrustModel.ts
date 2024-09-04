import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultSaleUnitTrust: ISaleUnitTrust = {
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
export interface ISaleUnitTrust {
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

export default class SaleUnitTrustModel {
    private unitTrust: ISaleUnitTrust;

    constructor(private store: AppStore, unitTrust: ISaleUnitTrust) {
        makeAutoObservable(this);
        this.unitTrust = unitTrust;
    }

    get asJson(): ISaleUnitTrust {
        return toJS(this.unitTrust);
    }
}

