import { query, collection, doc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IDepositTransactionAudit } from "../../models/deposit-transaction/DepositTransactionAuditModel";

export default class DepositTransactionAuditApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private depositTransactionAuditPath(transactionId:string) {
        return `depositTransactions/${transactionId}/depositTransactionAudits`;
    }

    async getAll(transactionId:string) {
        this.store.depositTransactionAudit.removeAll();

        const path = this.depositTransactionAuditPath(transactionId);

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const depositTransactionAudit: IDepositTransactionAudit[] = [];
                querySnapshot.forEach((doc) => {
                    depositTransactionAudit.push({ id: doc.id, ...doc.data() } as IDepositTransactionAudit);
                });
                this.store.depositTransactionAudit.load(depositTransactionAudit);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(transactionId:string, id: string) {
        const path = this.depositTransactionAuditPath(transactionId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IDepositTransactionAudit;
            this.store.depositTransactionAudit.load([item]);
        });

        return unsubscribe;
    }

    async create(transactionId:string, item: IDepositTransactionAudit) {
        const path = this.depositTransactionAuditPath(transactionId);
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }
}