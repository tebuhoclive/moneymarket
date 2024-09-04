import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";
import { IFolderFile } from "../../FolderFile";
import { IBondPurchaseStatus } from "./BondPurchaseModel";

export const defaultBondPurchaseTransaction: IBondPurchaseTransaction = {
    id: "",
    clientId: "",
    clientName: "",
    moneyMarketAccountNumber: "",
    moneyMarketBalance: 0,
    availableBalance: 0,
    netBalance: 0,
    newNominal: 0,
    altTreasuryBill: "No",
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
    document: {
        name: "",
        url: "",
        extension: ""
    },
    status:"pending"

}

export interface IBondPurchaseTransaction {
    id: string,
    clientId?: string;
    clientName: string;
    moneyMarketAccountNumber: string;
    moneyMarketBalance: number;
    availableBalance: number;
    netBalance: number;
    newNominal: number;
    altTreasuryBill: string;
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
    document: IFolderFile,
    status: string;

}

export const defaultBondPurchaseTransactionColumnVisibility = {
    id: false,
    clientId: true,
    clientName: true,
    moneyMarketAccountNumber: true,
    moneyMarketBalance: true,
    availableBalance: true,
    netBalance: true,
    newNominal: true,
    altTreasuryBill: true,
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
    document: true,
    status: false

}

export const BondColumnNames = {
    id: "Bond Purchase Transaction ID", // leave here for DEV User
    clientId: "Client ID", // leave here for DEV Users
    clientName: "Client Name",
    moneyMarketAccountNumber: "Client MM Acc",
    moneyMarketBalance: "MM Balance",
    availableBalance: "Available Balance",
    netBalance: "Net Balance",
    newNominal: "Nominal New",
    altTreasuryBill: "Alt. TB",
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
    document: "Document",
    status: "Status"
    
}

export default class BondPurchaseTransactionModel {
    private allocation: IBondPurchaseTransaction;

    constructor(private store: AppStore, allocation: IBondPurchaseTransaction) {
        makeAutoObservable(this);
        this.allocation = allocation;
    }

    get asJson(): IBondPurchaseTransaction {
        return toJS(this.allocation);
    }
}