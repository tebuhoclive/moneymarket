import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ISaleEquity } from "../../models/sales/SaleEquityModel";

export default class SaleEquityApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private equityPath() {
        return "equitySales";
    }

    async getAll() {
        this.store.sale.equity.removeAll();
        const path = this.equityPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: ISaleEquity[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as ISaleEquity);
                });
                this.store.sale.equity.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.equityPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ISaleEquity;
            this.store.sale.equity.load([item]);
        });

        return unsubscribe;
    }


    async create(item: ISaleEquity) {

        const path = this.equityPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: ISaleEquity) {

        const path = this.equityPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.sale.equity.load([item]);
        } catch (error) { }
    }

    async delete(item: ISaleEquity) {
        const path = this.equityPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.sale.equity.remove(item.id);
        } catch (error) { }
    }
}