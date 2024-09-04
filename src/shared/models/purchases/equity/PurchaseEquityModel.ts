import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultPurchaseEquity: IPurchaseEquity = {
    id: "",
    entityId: "",
    account: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    counterParty: "",
    counterPartyId: "",
    instrumentName: "",
    instrumentId: "",
    status:"pending",
}

export interface IPurchaseEquity {
    id: string;
    entityId: string;
    account: string;
    tradeDate: number
    settlementDate: number;
    counterParty: string;
    counterPartyId: string;
    instrumentName: string;
    instrumentId: string;
    status:IEquityPurchaseExecutionStatus;
}
export type IEquityPurchaseExecutionStatus = "pending"|"successfull"|"unsuccessfull";

export default class PurchaseEquityModel {
    private equity: IPurchaseEquity;

    constructor(private store: AppStore, equity: IPurchaseEquity) {
        makeAutoObservable(this);
        this.equity = equity;
    }

    get asJson(): IPurchaseEquity {
        return toJS(this.equity);
    }
}

