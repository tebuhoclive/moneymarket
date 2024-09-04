import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultCounterParty: ICounterParty = {
    id: "",
    counterpartyName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    accountHolder: "",
    status:"Pending",
    support:"",
    supportingFile:"",
    reasonForNoInstruction: "",
    transactionAction: "Created", // used for audit trail
}

export interface ICounterParty {
    id: string;
    counterpartyName: string;
    bankName: string;
    branch: string;
    accountNumber: string;
    accountHolder: string;
    status:status;
    support:string;
    supportingFile?:string;
    reasonForNoInstruction: string,
    transactionAction?: CounterPartyOnboardingActions; // used for audit trail


}
export type status = 'Pending' | 'Verified';
export type CounterPartyOnboardingActions = 'Deleted' | 'Verified' | 'Edited' | 'Created';
export default class CounterPartyModel {
    private counterParty: ICounterParty;

    constructor(private store: AppStore, counterParty: ICounterParty) {
        makeAutoObservable(this);
        this.counterParty = counterParty;
    }

    get asJson(): ICounterParty {
        return toJS(this.counterParty);
    }
}