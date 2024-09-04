import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";
import { IPurchaseCallDepositStatus } from "./PurchaseCallDepositModel";

export const defaultCallDepositPurchaseHolding: ICallDepositPurchaseHolding = {
    id: "",
    clientId: "",
    clientName: "",
    moneyMarketAccountNumber: "",
    maturingNominal: 0,
    moneyMarketBalance: 0,
    availableBalance: 0,
    netBalance: 0,
    newNominal: 0,
    //altTreasuryBill: "No",
    tenderRate: 0,
    margin: 0,
    clientRate: 0,
    counterParty: "IJG Securities",
    considerationBON: 0,
    considerationClient: 0,
    profit: 0,
    notes: "",
    contactPerson: "",
    confirmation: "",
    status: "allocated",
    
}

export interface ICallDepositPurchaseHolding {
    id: string,
    clientId?: string;
    clientName: string;
    moneyMarketAccountNumber: string;
    maturingNominal?: number;
    moneyMarketBalance: number;
    availableBalance: number;
    netBalance: number;
    newNominal: number;
  //  altTreasuryBill: string;
    tenderRate: number;
    margin: number;
    clientRate: number;
    counterParty: string;
    considerationBON: number;
    considerationClient: number;
    profit: number;
    notes: string;
    contactPerson: string;
    confirmation: string;
    status: IPurchaseCallDepositStatus
}

export const defaultCallDepositPurchaseHoldingColumnVisibility = {
    id: false,
    clientId: true,
    clientName: true,
    moneyMarketAccountNumber: true,
    maturingNominal: true,
    moneyMarketBalance: true,
    availableBalance: true,
    netBalance: true,
    newNominal: true,
   // altTreasuryBill: true,
    tenderRate: true,
    margin: true,
    clientRate: true,
    counterParty: true,
    considerationBON: true,
    considerationClient: true,
    profit: true,
    notes: true,
    contactPerson: true,
    confirmation: true,
    status: false,
}

export const CallDepositColumnNames = {
    id: "Call Deposit Purchase Holding ID", // leave here for DEV User
    clientId: "Client ID", // leave here for DEV Users
    clientName: "Client Name",
    moneyMarketAccountNumber: "Client MM Acc",
    maturingNominal: "Maturing Balance",
    moneyMarketBalance: "MM Balance",
    availableBalance: "Available Balance",
    netBalance: "Net Balance",
    newNominal: "Nominal New",
   // altTreasuryBill: "Alt. TB",
    tenderRate: "Tender Rate",
    margin: "Margin(%)",
    clientRate: "Client Rate",
    counterParty: "Counter Party",
    considerationBON: "Consideration BON",
    considerationClient: "Consideration Client",
    profit: "Profit",
    notes: "Notes",
    contactPerson: "Contact Person",
    confirmation: "Confirmation",
}

export default class CallDepositPurchaseHoldingModel {
    private allocation: ICallDepositPurchaseHolding;

    constructor(private store: AppStore, allocation: ICallDepositPurchaseHolding) {
        makeAutoObservable(this);
        this.allocation = allocation;
    }

    get asJson(): ICallDepositPurchaseHolding {
        return toJS(this.allocation);
    }
}