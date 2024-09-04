import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultSaleTreasuryBill: ISaleTreasuryBill = {
    id: "",
    counterParty: "",
    counterPartyId: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    nominal: 0,
    days: 0,
    yield: 0,
    instrumentName: "",
    instrumentId: ""
}

export interface ISaleTreasuryBill {
    id: string;
    counterParty: string;
    counterPartyId: string;
    tradeDate: number;
    settlementDate: number;
    nominal: number;
    days: number;
    yield: number;
    instrumentName: string;
    instrumentId: string;
}
export default class SaleTreasuryBillModel {
    private treasuryBill: ISaleTreasuryBill;

    constructor(private store: AppStore, treasuryBill: ISaleTreasuryBill) {
        makeAutoObservable(this);
        this.treasuryBill = treasuryBill;
    }

    get asJson(): ISaleTreasuryBill {
        return toJS(this.treasuryBill);
    }
}

