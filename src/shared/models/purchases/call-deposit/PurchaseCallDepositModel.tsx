import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultPurchaseCallDeposit: IPurchaseCallDeposit = {
    id: "",
    instrumentName: "",
    instrumentId: "",
    tradeDate: Date.now(),
    settlementDate: Date.now(),
    counterParty: "",
    counterPartyId: "",
    fee:0,
    nominal: 0,
    status:"pending",
}
export interface IPurchaseCallDeposit {
    id: string;
    instrumentName: string;
    instrumentId: string;
    tradeDate: number;
    settlementDate: number;
    counterParty: string,
    counterPartyId: string,
    fee:number,
    nominal: number;
    status: IPurchaseCallDepositStatus;

}

export type IPurchaseCallDepositStatus = "pending" |"saved"| "submitted" | "re-submitted" | "allocated" | "succesfull" | "unsuccessfull";

export default class PurchaseCallDepositModel {
    private callDeposit: IPurchaseCallDeposit;

    constructor(private store: AppStore, callDeposit: IPurchaseCallDeposit) {
        makeAutoObservable(this);
        this.callDeposit = callDeposit;
    }

    get asJson(): IPurchaseCallDeposit {
        return toJS(this.callDeposit);
    }
}

