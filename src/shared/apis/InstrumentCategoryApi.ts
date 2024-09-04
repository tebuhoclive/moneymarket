import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IInstrumentCategory } from "../models/InstrumentCategory";

export default class InstrumentCategoryApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private categoriesPath() {
        return "instrumentCategories";
    }

    async getAll() {
        this.store.category.removeAll();
        const path = this.categoriesPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const category: IInstrumentCategory[] = [];
                querySnapshot.forEach((doc) => {
                    category.push({ id: doc.id, ...doc.data() } as IInstrumentCategory);
                });
                this.store.category.load(category);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.categoriesPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IInstrumentCategory;
            this.store.category.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IInstrumentCategory) {

        const path = this.categoriesPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: IInstrumentCategory) {

        const path = this.categoriesPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.category.load([item]);
        } catch (error) { }
    }

    async delete(item: IInstrumentCategory) {
        const path = this.categoriesPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.category.remove(item.id);
        } catch (error) { }
    }
}