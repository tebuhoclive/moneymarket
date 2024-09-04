import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IProduct, IProductUpdate } from "../models/ProductModel";

export default class ProductApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private productPath() {
        return "products";
    }

    async getAll() {
        this.store.product.removeAll();
        const path = this.productPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const products: IProduct[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as IProduct);
                });
                this.store.product.load(products);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getAllProductAccounts() {
        this.store.product.removeAll();
        const path = this.productPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const products: IProduct[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as IProduct);
                });
                this.store.product.load(products);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.productPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IProduct;
            this.store.product.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IProduct) {

        const path = this.productPath();
        if (!path) return;

        const itemRef = doc(collection(db, path), item.id)
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(item: IProduct) {

        const path = this.productPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.product.load([item]);
        } catch (error) { }
    }

    async updateDailyPrice(item: IProductUpdate) {
        const path = this.productPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
        } catch (error) {
            console.log(error);
         }
    }
    
    async delete(item: IProduct) {
        const path = this.productPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.product.remove(item.id);
        } catch (error) { }
    }
}