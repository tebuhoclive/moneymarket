import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IProductRateChangeHistory } from "../models/ProductRateChangeHistoryModel";

export default class ProductRateChangeHistoryApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private productRateChangeHistory(productId: string) {
        return `products/${productId}/productRateChangeHistory`;
    }

    async getAll(productId: string) {
        this.store.productRateChangeHistory.removeAll();
        const path = this.productRateChangeHistory(productId);
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const products: IProductRateChangeHistory[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as IProductRateChangeHistory);
                });
                this.store.productRateChangeHistory.load(products);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(productId: string, id: string) {
        const path = this.productRateChangeHistory(productId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IProductRateChangeHistory;
            this.store.productRateChangeHistory.load([item]);
        });

        return unsubscribe;
    }

    async create(productId: string, item: IProductRateChangeHistory) {

        const path = this.productRateChangeHistory(productId);
        if (!path) return;

        const itemRef = doc(collection(db, path), item.id)
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(productId: string, item: IProductRateChangeHistory) {

        const path = this.productRateChangeHistory(productId);
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.productRateChangeHistory.load([item]);
        } catch (error) { }
    }

    async delete(productId: string, item: IProductRateChangeHistory) {
        const path = this.productRateChangeHistory(productId);
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.productRateChangeHistory.remove(item.id);
        } catch (error) { }
    }
}