import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IAccountRateChangeHistory } from "../models/AccountRateChangeHistoryModel";

export default class AccountRateChangeHistoryApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private accountRateChangeHistory(accountId: string) {
        return `moneyMarketAccounts/${accountId}/accountRateChangeHistory`;
    }

    async getAll(accountId: string) {
        this.store.accountRateChangeHistory.removeAll();
        const path = this.accountRateChangeHistory(accountId);
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const products: IAccountRateChangeHistory[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as IAccountRateChangeHistory);
                });
                this.store.accountRateChangeHistory.load(products);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(accountId: string, id: string) {
        const path = this.accountRateChangeHistory(accountId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IAccountRateChangeHistory;
            this.store.accountRateChangeHistory.load([item]);
        });

        return unsubscribe;
    }

    async create(accountId: string, item: IAccountRateChangeHistory) {

        const path = this.accountRateChangeHistory(accountId);
        if (!path) return;

        const itemRef = doc(collection(db, path), item.id)
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(accountId: string, item: IAccountRateChangeHistory) {

        const path = this.accountRateChangeHistory(accountId);
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.accountRateChangeHistory.load([item]);
        } catch (error) { }
    }

    async delete(accountId: string, item: IAccountRateChangeHistory) {
        const path = this.accountRateChangeHistory(accountId);
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.accountRateChangeHistory.remove(item.id);
        } catch (error) { }
    }
}