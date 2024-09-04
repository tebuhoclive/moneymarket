import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultPurchaseBond: IPurchaseBond = {
    id: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    instrumentName: "",
    instrumentId: "",
    counterParty: "",
    counterPartyId: "",
    nominal: 0,
    maturityDate: null,
    couponRate: 0
}

export interface IPurchaseBond {
    id: string;
    tradeDate: number;
    settlementDate: number;
    instrumentName: string;
    instrumentId: string;
    counterParty: string;
    counterPartyId: string;
    nominal: number;
    maturityDate: number | null;
    couponRate: number;
}
export default class PurchaseBondModel {
    private bond: IPurchaseBond;

    constructor(private store: AppStore, bond: IPurchaseBond) {
        makeAutoObservable(this);
        this.bond = bond;
    }

    get asJson(): IPurchaseBond {
        return toJS(this.bond);
    }
}

