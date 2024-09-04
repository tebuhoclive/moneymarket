import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultSaleFixedDeposit: ISaleFixedDeposit = {
    id: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    counterParty: "",
    counterPartyId: "",
    yield: 0,
    penalty: 0,
    nominal: 0,
    days: 0,
    saleConsideration: 0,
    clientConsideration: 0,
    profit: 0,
    instrumentName: "",
    instrumentId: ""
}

export interface ISaleFixedDeposit {
    id: string;
    tradeDate: number;
    settlementDate: number;
    counterParty: string;
    counterPartyId: string;
    yield: number;
    penalty: number;
    nominal: number;
    days: number;
    saleConsideration: number;
    clientConsideration: number;
    profit: number;
    instrumentName: string;
    instrumentId: string;


}
export default class SaleFixedDepositModel {
    private deposit: ISaleFixedDeposit;

    constructor(private store: AppStore, deposit: ISaleFixedDeposit) {
        makeAutoObservable(this);
        this.deposit = deposit;
    }

    get asJson(): ISaleFixedDeposit {
        return toJS(this.deposit);
    }
}

