import { query, collection, doc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ICounterPartyOnboardAudit } from "../../models/clients/counter-party/CounterPartyOnboardAuditModel";

export default class CounterPartyOnboardAuditApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private counterPartyOnboardAuditPath(transactionId:string) {
        return `counterParties/${transactionId}/counterPartyAudits`;
    }

    async getAll(transactionId:string) {
        this.store.counterPartyOnboardAuditStore.removeAll();

        const path = this.counterPartyOnboardAuditPath(transactionId);

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const counterPartyAudit: ICounterPartyOnboardAudit[] = [];
                querySnapshot.forEach((doc) => {
                    counterPartyAudit.push({ id: doc.id, ...doc.data() } as ICounterPartyOnboardAudit);
                });
                this.store.counterPartyOnboardAuditStore.load(counterPartyAudit);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(transactionId:string, id: string) {
        const path = this.counterPartyOnboardAuditPath(transactionId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ICounterPartyOnboardAudit;
            this.store.counterPartyOnboardAuditStore.load([item]);
        });

        return unsubscribe;
    }

    async create(transactionId:string, item: ICounterPartyOnboardAudit) {
        const path = this.counterPartyOnboardAuditPath(transactionId);
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }
}