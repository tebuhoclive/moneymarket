import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultPurchaseFixedDeposit: IPurchaseFixedDeposit = {
    id: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    counterParty: "",
    counterPartyId: "",
    yield: 0,
    fee: 0,
    clientYield: 0,
    nominal: 0,
    days: 0,
    instrumentName: "",
    instrumentId: ""
}

export interface IPurchaseFixedDeposit {
    id: string;
    tradeDate: number;
    settlementDate: number;
    counterParty: string;
    counterPartyId: string;
    yield: number;
    fee: number;
    clientYield: number;
    nominal: number;
    days: number;
    instrumentName: string;
    instrumentId: string;
}
export type IFixedDepositPurchaseExecutionStatus = "pending"|"successfull"|"unsuccessfull";

export default class PurchaseFixedDepositModel {
    private deposit: IPurchaseFixedDeposit;

    constructor(private store: AppStore, deposit: IPurchaseFixedDeposit) {
        makeAutoObservable(this);
        this.deposit = deposit;
    }

    get asJson(): IPurchaseFixedDeposit {
        return toJS(this.deposit);
    }
}

