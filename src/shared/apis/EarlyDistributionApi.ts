import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import AppApi from "./AppApi";
import AppStore from "../stores/AppStore";
import { db } from "../config/firebase-config";
import { IEarlyDistributionAccount } from "../models/EarlyDistributionAccountModel";

export default class EarlyDistroApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private distributionPath() {
        return "earlyDistribution";
    }

    async getAll() {
        this.store.counterParty.removeAll();
        const path = this.distributionPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const parties: IEarlyDistributionAccount[] = [];
                querySnapshot.forEach((doc) => {
                    parties.push({ id: doc.id, ...doc.data() } as IEarlyDistributionAccount);
                });
                this.store.earlyDistribution.load(parties);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.distributionPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IEarlyDistributionAccount;
            this.store.earlyDistribution.load([item]);
        });

        return unsubscribe;
    }

    //create 

    async create(item: IEarlyDistributionAccount) {

        const path = this.distributionPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    //update
    async update(item: IEarlyDistributionAccount) {
        const path = this.distributionPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.earlyDistribution.load([item]);
        } catch (error) { }
    }
    async updateStatus(item: IEarlyDistributionAccount) {
        const path = this.distributionPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                isApproved: true,
            });
            this.store.earlyDistribution.load([item]);
        } catch (error) {
            // Handle the error if needed
        }
    }

    async updateMinusBalance(item: IEarlyDistributionAccount, amount: number) {
        const path = this.distributionPath();
        if (!path) return;

        try {

            const newBalance = item.balance - amount;
            await updateDoc(doc(db, path, item.id), {
                balance: newBalance,
            });
            this.store.earlyDistribution.load([item]);
        } catch (error) {
            // Handle the error if needed
        }
    }


    async updateAddBalance(item: IEarlyDistributionAccount, amount: number) {
        const path = this.distributionPath();
        if (!path) return;

        const newBalance = item.balance + amount;

        try {
            await updateDoc(doc(db, path, item.id), {
                balance: newBalance,
            });
            this.store.earlyDistribution.load([item]);
        } catch (error) {
            // Handle the error if needed
        }
    }

    async delete(item: IEarlyDistributionAccount) {
        const path = this.distributionPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.counterParty.remove(item.id);
        } catch (error) { }
    }
}