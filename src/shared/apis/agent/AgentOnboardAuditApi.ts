import { query, collection, doc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IAgentOnboardAudit } from "../../models/clients/agent/AgentOnboardAuditModel";

export default class AgentOnboardAuditApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private agentOnboardAuditPath(transactionId:string) {
        return `agents/${transactionId}/agentAudits`;
    }

    async getAll(transactionId:string) {
        this.store.agentOnboardAuditStore.removeAll();

        const path = this.agentOnboardAuditPath(transactionId);

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const agentOnboardAudit: IAgentOnboardAudit[] = [];
                querySnapshot.forEach((doc) => {
                    agentOnboardAudit.push({ id: doc.id, ...doc.data() } as IAgentOnboardAudit);
                });
                this.store.agentOnboardAuditStore.load(agentOnboardAudit);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(transactionId:string, id: string) {
        const path = this.agentOnboardAuditPath(transactionId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IAgentOnboardAudit;
            this.store.agentOnboardAuditStore.load([item]);
        });

        return unsubscribe;
    }

    async create(transactionId:string, item: IAgentOnboardAudit) {
        const path = this.agentOnboardAuditPath(transactionId);
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }
}