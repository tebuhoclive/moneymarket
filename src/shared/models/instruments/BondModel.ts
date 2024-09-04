import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { InstrumentStatus } from "../../utils/utils";

export const defaultBond: IBond = {
    id: "",
    instrumentName: "",
    maturityDate: null,
    issuer: "",
    couponRate: 0,
    couponFrequency: 0,
    nextCouponDate: null,
    instrumentStatus: "pending",
    price: 0,
}

export interface IBond {
    id: string;
    instrumentName: string;
    maturityDate: number | null;
    issuer: string;
    couponRate: number;
    couponFrequency: number;
    nextCouponDate: number | null;
    instrumentStatus: InstrumentStatus;
    price: number;
}

export interface IBondUpdate {
    id: string;
    instrumentName: string;
    // couponRate: number;
    price: number;
}

export default class BondModel {
    private bond: IBond;

    constructor(private store: AppStore, bond: IBond) {
        makeAutoObservable(this);
        this.bond = bond;
    }

    get asJson(): IBond {
        return toJS(this.bond);
    }
}

