import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebase-config";
import { IMoneyMarketAccountPurchase } from "../../../models/MoneyMarketAccountPurchase";
import { ITreasuryBillPurchaseAllocation } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import AppStore from "../../../stores/AppStore";
import AppApi from "../../AppApi";

export default class PurchaseTreasuryBillApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private generateRandomString(length: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charactersLength);
            result += characters.charAt(randomIndex);
        }

        return result;
    }

    async getAllFromAcount(accountId: string) {
        this.store.purchase.moneyMarket.removeAll();
        const path = `moneyMarketAccounts/${accountId}/purchases`
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const tBills: IMoneyMarketAccountPurchase[] = [];
                querySnapshot.forEach((doc) => {
                    tBills.push({ id: doc.id, ...doc.data() } as IMoneyMarketAccountPurchase);
                });
                this.store.purchase.moneyMarket.load(tBills);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getFromAccountById(accountId: string, purchaseId: string) {
        const path = `moneyMarketAccounts/${accountId}/purchases/${purchaseId}`
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, purchaseId), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ITreasuryBillPurchaseAllocation;
            this.store.purchase.treasuryBillAllocation.load([item]);
        });

        return unsubscribe;
    }

    async createPurchaseInAccount(accountId: string, item: IMoneyMarketAccountPurchase) {
        const path = `moneyMarketAccounts/${accountId}/purchases`

        if (!path) return;

        const itemRef = doc(collection(db, path), `${this.generateRandomString(20)}-TB`);
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async updatePurchaseInAccount(accountId: string, item: ITreasuryBillPurchaseAllocation) {
        const path = `moneyMarketAccounts/${accountId}/purchases`
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.purchase.treasuryBillAllocation.load([item]);
        } catch (error) { }
    }

    async deletePurchaseInAccount(accountId: string, item: ITreasuryBillPurchaseAllocation) {
        const path = `moneyMarketAccounts/${accountId}/purchases`
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.purchase.treasuryBillAllocation.remove(item.id);
        } catch (error) { }
    }
}