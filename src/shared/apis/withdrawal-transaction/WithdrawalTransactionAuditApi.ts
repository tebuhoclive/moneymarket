import { query, collection, doc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IWithdrawalTransactionAudit } from "../../models/withdrawal-transaction/WithdrawalTransactionAuditModel";

export default class ClientWithdrawalPaymentAuditApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private clientWithdrawalPaymentAuditPath(transactionId:string) {
        return `withdrawalTransactions/${transactionId}/clientWithdrawalPaymentAudits`;
    }

    async getAll(transactionId:string) {
        this.store.withdrawalTransactionAudit.removeAll();

        const path = this.clientWithdrawalPaymentAuditPath(transactionId);

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const withdrawalTransactionAudit: IWithdrawalTransactionAudit[] = [];
                querySnapshot.forEach((doc) => {
                    withdrawalTransactionAudit.push({ id: doc.id, ...doc.data() } as IWithdrawalTransactionAudit);
                });
                this.store.withdrawalTransactionAudit.load(withdrawalTransactionAudit);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(transactionId:string, id: string) {
        const path = this.clientWithdrawalPaymentAuditPath(transactionId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IWithdrawalTransactionAudit;
            this.store.withdrawalTransactionAudit.load([item]);
        });

        return unsubscribe;
    }

    async create(transactionId:string, item: IWithdrawalTransactionAudit) {
        const path = this.clientWithdrawalPaymentAuditPath(transactionId);
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log("Error", error);
            
        }
    }
}