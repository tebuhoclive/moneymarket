import { makeAutoObservable, toJS } from "mobx";
import { IAgent } from "./AgentModel";
import AppStore from "../../../stores/AppStore";

export interface IAgentOnboardAudit {
    id: string;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    dataStateBeforeAudit:IAgent;
    dataStateAfterAudit:IAgent;
    actionUser: string;
}

export default class AgentOnboardAuditModel {
    private AgentAudit: IAgentOnboardAudit;

    constructor(private store: AppStore, AgentAudit: IAgentOnboardAudit) {
        makeAutoObservable(this);
        this.AgentAudit = AgentAudit;
    }

    get asJson(): IAgentOnboardAudit {
        return toJS(this.AgentAudit);
    }
}