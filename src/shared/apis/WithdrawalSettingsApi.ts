import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IWithdrawalSetting } from "../models/WithdrawalSettings";

export default class WithdrawalSettingsApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private withdrawalSettings() {
        return `settings`;
    }

    async getAll() {
        this.store.withdrawalSettings.removeAll();
        const path = this.withdrawalSettings();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const products: IWithdrawalSetting[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as IWithdrawalSetting);
                });
                this.store.withdrawalSettings.load(products);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.withdrawalSettings();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IWithdrawalSetting;
            this.store.withdrawalSettings.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IWithdrawalSetting) {
        const path = this.withdrawalSettings();
        if (!path) return;

        const itemRef = doc(collection(db, path), item.id)
        item.id = itemRef.id;
        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            alert(error)
        }
    }

    async update(item: IWithdrawalSetting) {

        const path = this.withdrawalSettings();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.withdrawalSettings.load([item]);
        } catch (error) { }
    }

    async delete(item: IWithdrawalSetting) {
        const path = this.withdrawalSettings();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.withdrawalSettings.remove(item.id);
        } catch (error) { }
    }
}