import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import AgentOnboardAuditModel, { IAgentOnboardAudit } from "../../models/clients/agent/AgentOnboardAuditModel";

export default class AgentOnboardAuditStore extends Store<IAgentOnboardAudit, AgentOnboardAuditModel> {
    items = new Map<string, AgentOnboardAuditModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IAgentOnboardAudit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new AgentOnboardAuditModel(this.store, item))
            );
        });
    }
}