import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IWithdrawalPaymentBatch } from "../../models/batches/BatchesModel";
import { withdrawFromEarlyDistribution } from "../../../money-market-management-system/logged-in/system-modules/money-market-transactions-module/withdrawal-transaction/batches/modal/UpdateEDAccountAndCloseOut";

export default class BatchesApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private batchesPath() {
        return "batches";
    }

    async getAll() {
        this.store.batches.removeAll();
        const path = this.batchesPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const batches: IWithdrawalPaymentBatch[] = [];
                querySnapshot.forEach((doc) => {
                    batches.push({ id: doc.id, ...doc.data() } as IWithdrawalPaymentBatch);
                });
                this.store.batches.load(batches);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.batchesPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IWithdrawalPaymentBatch;
            this.store.batches.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IWithdrawalPaymentBatch) {
        const path = this.batchesPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: IWithdrawalPaymentBatch) {
        const path = this.batchesPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.batches.load([item]);
        } catch (error) { }
    }

    async updateBatchTransactionStatus(item: IWithdrawalPaymentBatch, transactionId: string, status: string) {
        const path = this.batchesPath();
        if (!path) return;

        try {
            // Find the index of the transaction with the specified ID
            const transactionIndex = item.paymentBatchFileTransactions.findIndex(transaction => transaction.id === transactionId);

            if (transactionIndex !== -1) {
                const transaction = item.paymentBatchFileTransactions[transactionIndex];

                // Check if the description is "close out"
                if (transaction.transactionType === "Manual Close Out" || transaction.transactionType === "Manual Close Out") {
                    await withdrawFromEarlyDistribution(
                        this.api,
                        this.store,
                        transaction.productCode || "",
                        transaction.id || "",
                        transaction.closeOutInterest || 0
                    );
                }

                // Update its status
                transaction.transactionStatus = status;

                // Update the document in Firestore
                await updateDoc(doc(db, path, item.id), {
                    ...item,
                });

                // Reload the batches in the store
                this.store.batches.load([item]);
            }
        } catch (error) {
            // Handle error
        }
    }



    async deleteBatchTransaction(item: IWithdrawalPaymentBatch, transactionId: string) {
        const path = this.batchesPath();
        if (!path) return;

        try {
            // Find the index of the transaction with the specified ID
            const transactionIndex = item.paymentBatchFileTransactions.findIndex(transaction => transaction.id === transactionId);

            // If the transaction is found, remove it from the array
            if (transactionIndex !== -1) {
                item.paymentBatchFileTransactions.splice(transactionIndex, 1);

                // Update the document in Firestore
                await updateDoc(doc(db, path, item.id), {
                    ...item,
                });

                // Reload the batches in the store
                this.store.batches.load([item]);
            }
        } catch (error) {
            // Handle error
        }
    }


    async delete(item: IWithdrawalPaymentBatch) {
        const path = this.batchesPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.batches.remove(item.id);
        } catch (error) { }
    }
}