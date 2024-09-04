import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IProductDailyPricing } from "../models/ProductDailyPricingModel";

export default class ProductDailyPricingApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private productPath(year: string, month: string) {
        return `pricingYear/${year}/pricingMonth/${month}/pricing`;
    }

    async getAll(year: string, month: string) {

        this.store.productDailyPricing.removeAll();

        const path = this.productPath(year, month);

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const productDailyPricing: IProductDailyPricing[] = [];
                querySnapshot.forEach((doc) => {
                    productDailyPricing.push({ id: doc.id, ...doc.data() } as IProductDailyPricing);
                });
                this.store.productDailyPricing.load(productDailyPricing);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(year: string, month: string, id: string) {

        const path = this.productPath(year, month);

        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IProductDailyPricing;
            this.store.productDailyPricing.load([item]);
        });

        return unsubscribe;
    }

    async create(year: string, month: string, item: IProductDailyPricing) {

        const path = this.productPath(year, month);

        if (!path) return;

        const itemRef = doc(collection(db, path));

        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(year: string, month: string, item: IProductDailyPricing) {

        const path = this.productPath(year, month);

        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.productDailyPricing.load([item]);
        } catch (error) { }
    }

    async delete(year: string, month: string, item: IProductDailyPricing) {

        const path = this.productPath(year, month);

        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.productDailyPricing.remove(item.id);
        } catch (error) { }
    }
}