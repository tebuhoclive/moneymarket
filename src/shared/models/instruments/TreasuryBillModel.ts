import { makeAutoObservable, toJS } from "mobx";
import { InstrumentStatus } from "../../utils/utils";
import AppStore from "../../stores/AppStore";

export const defaultTreasuryBill: ITreasuryBill = {
    id: "",
    instrumentName: "",
    issueDate: Date.now(),
    maturityDate: null,
    issuer: "",
    instrumentStatus: "pending",
    daysToMaturity: null,
}

export interface ITreasuryBill {
    id: string;
    instrumentName: string;
    issueDate: number;
    maturityDate: number | null;
    issuer: string;
    instrumentStatus: InstrumentStatus;
    daysToMaturity: number | null;
}
export default class TreasuryBillModel {
    private treasuryBill: ITreasuryBill;

    constructor(private store: AppStore, treasuryBill: ITreasuryBill) {
        makeAutoObservable(this);
        this.treasuryBill = treasuryBill;
    }

    get asJson(): ITreasuryBill {
        return toJS(this.treasuryBill);
    }
}


