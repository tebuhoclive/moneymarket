import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ISaleFixedDeposit } from "../../models/sales/SaleFixedDepositModel";

export default class SaleFixedDepositApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private fixedDepositsPath() {
        return "fixedDepositSales";
    }

    async getAll() {
        this.store.sale.fixedDeposit.removeAll();
        const path = this.fixedDepositsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: ISaleFixedDeposit[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as ISaleFixedDeposit);
                });
                this.store.sale.fixedDeposit.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.fixedDepositsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ISaleFixedDeposit;
            this.store.sale.fixedDeposit.load([item]);
        });

        return unsubscribe;
    }


    async create(item: ISaleFixedDeposit) {

        const path = this.fixedDepositsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: ISaleFixedDeposit) {

        const path = this.fixedDepositsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.sale.fixedDeposit.load([item]);
        } catch (error) { }
    }


    async delete(item: ISaleFixedDeposit) {
        const path = this.fixedDepositsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.sale.fixedDeposit.remove(item.id);
        } catch (error) { }
    }
}