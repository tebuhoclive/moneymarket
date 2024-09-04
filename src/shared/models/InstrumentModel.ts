import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

// export const intrumentTypes = ["TreasuryBill", "Bond", "FixedDeposit", "Equity", "UnitTrust"];
// export type InstrumentType = "TreasuryBill" | "Bond" | "FixedDeposit" | "Equity" | "UnitTrust";
export type InstrumentStatus = "pending" | "approved";

export const defaultInstrument: IInstrument = {
    id: "",
    instrumentName: "",
    issueDate: Date.now(),
    maturityDate: null,
    issuer: "",
    couponRate: 0,
    couponFrequency: 0,
    nextCouponDate: null,
    interestRate: 0,
    sharecode: "",
    bloombergCode: "",
    isin: "",
    categoryName: "",
    instrumentStatus: "pending",
    categoryId: "",
}

export interface IInstrument {
    id: string;
    instrumentName: string;
    issueDate: number;
    maturityDate: number | null;
    issuer: string;
    couponRate: number;
    couponFrequency: number;
    nextCouponDate: number | null;
    interestRate: number;
    sharecode: string;
    bloombergCode: string;
    isin: string;
    categoryName: string;
    instrumentStatus: InstrumentStatus;
    categoryId: string;
}
export default class InstrumentModel {
    private instrument: IInstrument;

    constructor(private store: AppStore, instrument: IInstrument) {
        makeAutoObservable(this);
        this.instrument = instrument;
    }

    get asJson(): IInstrument {
        return toJS(this.instrument);
    }
}


// bonds
// couponRate
// couponFrequency
// nextCouponDate

// fixed deposit
// interestRate

// equity
// sharecode
// bloombergCode
// ISIN

// unit trust
// sharecode
// bloombergCode

