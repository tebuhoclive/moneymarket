import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultSaleEquity: ISaleEquity = {
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

export interface ISaleEquity {
    id: string;
    entityId: string;
    account: string;
    tradeDate: number
    settlementDate: number;
    counterParty: string;
    counterPartyId: string;
    instrumentName: string;
    instrumentId: string;
}
export default class SaleEquityModel {
    private equity: ISaleEquity;

    constructor(private store: AppStore, equity: ISaleEquity) {
        makeAutoObservable(this);
        this.equity = equity;
    }

    get asJson(): ISaleEquity {
        return toJS(this.equity);
    }
}

