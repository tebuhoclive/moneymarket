import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultSaleBond: ISaleBond = {
    id: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    instrumentName: "",
    instrumentId: "",
    counterParty: "",
    counterPartyId: "",
    nominal: 0,
    maturityDate: null,
    couponRate: 0,
    sellingYield: 0
}

export interface ISaleBond {
    id: string;
    instrumentName: string;
    instrumentId: string;
    tradeDate: number;
    settlementDate: number;
    counterParty: string;
    counterPartyId: string;
    sellingYield: number;
    nominal: number;
    maturityDate: number | null;
    couponRate: number;
}
export default class SaleBondModel {
    private bond: ISaleBond;

    constructor(private store: AppStore, bond: ISaleBond) {
        makeAutoObservable(this);
        this.bond = bond;
    }

    get asJson(): ISaleBond {
        return toJS(this.bond);
    }
}

