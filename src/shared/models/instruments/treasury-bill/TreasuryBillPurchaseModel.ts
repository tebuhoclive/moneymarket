import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultPurchaseTreasuryBill: IPurchaseTreasuryBill = {
    id: "",
    instrumentName: "",
    instrumentId: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    nominal: 0,
    considerationBON: 0,
    considerationClient: 0,
    profit: 0,
    allocatedBy: null,
    purchasedBy: null,
    status: "pending"
}

export interface IPurchaseTreasuryBill {
    id: string;
    instrumentName: string;
    instrumentId: string;
    tradeDate: number;
    settlementDate: number;
    nominal: number;
    considerationBON: number;
    considerationClient: number;
    profit: number;
    allocatedBy: string | null;
    purchasedBy: string | null;
    status: ITreasuryBillPurchaseStatus;
}

export type ITreasuryBillPurchaseStatus = "pending" |"saved"| "submitted" | "re-submitted" | "allocated" | "succesfull" | "unsuccessfull";

export default class PurchaseTreasuryBillModel {
    private treasuryBill: IPurchaseTreasuryBill;

    constructor(private store: AppStore, treasuryBill: IPurchaseTreasuryBill) {
        makeAutoObservable(this);
        this.treasuryBill = treasuryBill;
    }

    get asJson(): IPurchaseTreasuryBill {
        return toJS(this.treasuryBill);
    }
}


