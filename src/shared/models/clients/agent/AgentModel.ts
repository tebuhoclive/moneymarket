import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultAgent: IAgent = {
    id: "",
    agentName: "",
    bankName: "",
    branch: "",
    branchCode: "",
    accountNumber: "",
    accountHolder: "",
    status:"Pending",
    support:"",
    supportingFile:"",
    reasonForNoInstruction: "",
    transactionAction: "Created",
}

export interface IAgent {
    id: string;
    agentName: string;
    bankName: string;
    branch: string;
    branchCode:string;
    accountNumber: string;
    accountHolder: string;
    status:status;
    support:string;
    supportingFile?:string;
    reasonForNoInstruction: string,
    transactionAction?: AgentOnboardingActions; // used for audit trail
}
export type status = 'Pending' | 'Verified';
export type AgentOnboardingActions = 'Deleted' | 'Verified' | 'Edited' | 'Created';

export default class AgentModel {
    private agent: IAgent;

    constructor(private store: AppStore, agent: IAgent) {
        makeAutoObservable(this);
        this.agent = agent;
    }

    get asJson(): IAgent {
        return toJS(this.agent);
    }
}