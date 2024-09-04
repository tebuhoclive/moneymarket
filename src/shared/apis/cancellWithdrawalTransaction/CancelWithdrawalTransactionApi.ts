import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ICancelledWithdrawalTransaction } from "../../models/cancelledWithdrawalTransaction/CancelledWithdrawalTransaction";

export default class CancelledWithdrawalTransactionApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private cancelledWithdrawalPath() {
        return "cancelledWithdrawals";
    }

    async getAll() {
        this.store.cancelledWithdrawal.removeAll();
        const path = this.cancelledWithdrawalPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const cancelledWithdrawal: ICancelledWithdrawalTransaction[] = [];
                querySnapshot.forEach((doc) => {
                    cancelledWithdrawal.push({ id: doc.id, ...doc.data() } as ICancelledWithdrawalTransaction);
                });
                this.store.cancelledWithdrawal.load(cancelledWithdrawal);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.cancelledWithdrawalPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ICancelledWithdrawalTransaction;
            this.store.cancelledWithdrawal.load([item]);
        });

        return unsubscribe;
    }

    async create(item: ICancelledWithdrawalTransaction) {
        const path = this.cancelledWithdrawalPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: ICancelledWithdrawalTransaction) {
        const path = this.cancelledWithdrawalPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.cancelledWithdrawal.load([item]);
        } catch (error) { }
    }


    async delete(item: ICancelledWithdrawalTransaction) {
        const path = this.cancelledWithdrawalPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.cancelledWithdrawal.remove(item.id);
        } catch (error) { }
    }
}