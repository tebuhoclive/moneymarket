import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { ITransactionOutflow } from "../models/TransactionOutflowModel";

export default class TransactionOutflowApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private outflowPath() {
        return "outflows";
    }

    async getAll() {
        this.store.outflow.removeAll();
        const path = this.outflowPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const outflows: ITransactionOutflow[] = [];
                querySnapshot.forEach((doc) => {
                    outflows.push({ id: doc.id, ...doc.data() } as ITransactionOutflow);
                });
                this.store.outflow.load(outflows);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.outflowPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ITransactionOutflow;
            this.store.outflow.load([item]);
        });

        return unsubscribe;
    }

    async create(item: ITransactionOutflow) {

        const path = this.outflowPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }


    async update(item: ITransactionOutflow) {

        const path = this.outflowPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.outflow.load([item]);
        } catch (error) { }
    }

    async delete(item: ITransactionOutflow) {
        const path = this.outflowPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.outflow.remove(item.id);
        } catch (error) { }
    }
}