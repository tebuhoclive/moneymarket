import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import CounterPartyModel, { ICounterParty } from "../../models/clients/counter-party/CounterPartyModel";
import AgentModel, { IAgent } from "../../models/clients/agent/AgentModel";

export default class AgentStore extends Store<IAgent, AgentModel> {
    items = new Map<string, AgentModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IAgent[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new AgentModel(this.store, item))
            );
        });
    }
}