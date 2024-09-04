import { query, collection, doc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { ISwitchAudit } from "../models/SwitchAuditModel";


export default class SwitchAuditApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private switchAuditPath(transactionId:string) {
        return `switches/${transactionId}/switchAudits`;
    }

    async getAll(transactionId:string) {
        this.store.switchAudit.removeAll();

        const path = this.switchAuditPath(transactionId);

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const switchAudit: ISwitchAudit[] = [];
                querySnapshot.forEach((doc) => {
                    switchAudit.push({ id: doc.id, ...doc.data() } as ISwitchAudit);
                });
                this.store.switchAudit.load(switchAudit);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(transactionId:string, id: string) {
        const path = this.switchAuditPath(transactionId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ISwitchAudit;
            this.store.switchAudit.load([item]);
        });

        return unsubscribe;
    }

    async create(transactionId:string, item: ISwitchAudit) {
        const path = this.switchAuditPath(transactionId);
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }
}