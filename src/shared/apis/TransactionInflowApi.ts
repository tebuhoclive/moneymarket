import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { ITransactionInflow } from "../models/TransactionInflowModel";

export default class TransactionInflowApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private inflowPath() {
        return "inflows";
    }

    async getAll() {
        this.store.inflow.removeAll();
        const path = this.inflowPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const inflows: ITransactionInflow[] = [];
                querySnapshot.forEach((doc) => {
                    inflows.push({ id: doc.id, ...doc.data() } as ITransactionInflow);
                });
                this.store.inflow.load(inflows);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.inflowPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ITransactionInflow;
            this.store.inflow.load([item]);
        });

        return unsubscribe;
    }

    async create(item: ITransactionInflow) {

        const path = this.inflowPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: ITransactionInflow) {

        const path = this.inflowPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.inflow.load([item]);
        } catch (error) { }
    }

    async delete(item: ITransactionInflow) {
        const path = this.inflowPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.inflow.remove(item.id);
        } catch (error) { }
    }
}