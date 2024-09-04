import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ICounterParty } from "../../models/clients/counter-party/CounterPartyModel";
import { IAgent, defaultAgent } from "../../models/clients/agent/AgentModel";
import { IAgentOnboardAudit } from "../../models/clients/agent/AgentOnboardAuditModel";

export default class AgentApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private agentPath() {
        return "agents";
    }

    async getAll() {
        this.store.agent.removeAll();
        const path = this.agentPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const agents: IAgent[] = [];
                querySnapshot.forEach((doc) => {
                    agents.push({ id: doc.id, ...doc.data() } as IAgent);
                });
                this.store.agent.load(agents);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.agentPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IAgent;
            this.store.agent.load([item]);
        });

        return unsubscribe;
    }


    async create(item: IAgent) {

        const path = this.agentPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
            const auditRecord: IAgentOnboardAudit = {
                id: "",
                auditDateTime: Date.now(),
                action: item.transactionAction || "",
                actionDescription: `Transaction was ${item.transactionAction}`,
                dataStateBeforeAudit: {
                    ...defaultAgent
                },
                dataStateAfterAudit: {
                    ...item
                },
                actionUser: this.store.auth.meUID || ""
            }
            try {
                await this.api.agentOnboardAuditApi.create(item.id, auditRecord);
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
        }
    }

    async update(item: IAgent) {

        const path = this.agentPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.agent.load([item]);
            const auditRecord: IAgentOnboardAudit = {
                id: "",
                auditDateTime: 0,
                action: item.transactionAction || "",
                actionDescription: `Transaction was ${item.transactionAction}`,
                dataStateBeforeAudit: {
                    ...defaultAgent
                },
                dataStateAfterAudit: {
                    ...item
                },
                actionUser: this.store.auth.meUID || ""
            }
            try {
                await this.api.agentOnboardAuditApi.create(item.id, auditRecord);
            } catch (error) {
                console.log(error);
            }
        } catch (error) { }
    }
    async updateAndCreateAuditTrail(oldTransaction: IAgent, item: IAgent) {
        const path = this.agentPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.agent.load([item]);
            const auditRecord: IAgentOnboardAudit = {
                id: "",
                auditDateTime: Date.now(),
                action: item.transactionAction || "",
                actionDescription: `Transaction was ${item.transactionAction}`,
                dataStateBeforeAudit: {
                    ...oldTransaction
                },
                dataStateAfterAudit: {
                    ...item
                },
                actionUser: this.store.auth.meUID || ""
            }
            try {
                await this.api.agentOnboardAuditApi.create(item.id, auditRecord);
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async delete(item: IAgent) {
        const path = this.agentPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.agent.remove(item.id);
        } catch (error) { }
    }
}