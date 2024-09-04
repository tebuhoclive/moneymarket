import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ISaleUnitTrust } from "../../models/sales/SaleUnitTrustModel";

export default class SaleUnitTrustApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private unitTrustsPath() {
        return "unitTrustSales";
    }

    async getAll() {
        this.store.sale.unitTrust.removeAll();
        const path = this.unitTrustsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const units: ISaleUnitTrust[] = [];
                querySnapshot.forEach((doc) => {
                    units.push({ id: doc.id, ...doc.data() } as ISaleUnitTrust);
                });
                this.store.sale.unitTrust.load(units);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.unitTrustsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ISaleUnitTrust;
            this.store.sale.unitTrust.load([item]);
        });

        return unsubscribe;
    }


    async create(item: ISaleUnitTrust) {

        const path = this.unitTrustsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: ISaleUnitTrust) {

        const path = this.unitTrustsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.sale.unitTrust.load([item]);
        } catch (error) { }
    }


    async delete(item: ISaleUnitTrust) {
        const path = this.unitTrustsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.sale.unitTrust.remove(item.id);
        } catch (error) { }
    }
}