import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultFixedDepositPurchaseExecution: IFixedDepositPurchaseExecution = {
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
    status: "pending",
}

export interface IFixedDepositPurchaseExecution {
    id: string,
    clientId?: string;
    clientName: string;
    moneyMarketAccountNumber: string;
    maturingNominal?: number;
    moneyMarketBalance: number;
    availableBalance: number;
    netBalance: number;
    newNominal: number;
   // altTreasuryBill: string;
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
    status: string;
}

export type IFixedDepositPurchaseExecutionStatus = "pending"|"successfull"|"unsuccessfull";
export default class FixedDepositPurchaseExecutionModel {
    private Execution: IFixedDepositPurchaseExecution;

    constructor(private store: AppStore, Execution: IFixedDepositPurchaseExecution) {
        makeAutoObservable(this);
        this.Execution = Execution;
    }

    get asJson(): IFixedDepositPurchaseExecution {
        return toJS(this.Execution);
    }
}