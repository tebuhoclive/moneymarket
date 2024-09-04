import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ITreasuryBill } from "../../models/instruments/TreasuryBillModel";
import { ITreasuryBillPurchaseAllocation } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";

export default class TreasuryBillApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private treasuryBillsPath() {
        return "treasuryBills";
    }

    async getAll() {
        this.store.instruments.treasuryBill.removeAll();
        const path = this.treasuryBillsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const tbills: ITreasuryBill[] = [];
                querySnapshot.forEach((doc) => {
                    tbills.push({ id: doc.id, ...doc.data() } as ITreasuryBill);
                });
                this.store.instruments.treasuryBill.load(tbills);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.treasuryBillsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ITreasuryBill;
            this.store.instruments.treasuryBill.load([item]);
        });

        return unsubscribe;
    }
    async create(item: ITreasuryBill) {

        const path = this.treasuryBillsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: ITreasuryBill) {

        const path = this.treasuryBillsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.instruments.treasuryBill.load([item]);
        } catch (error) { }
    }

    async delete(item: ITreasuryBill) {
        const path = this.treasuryBillsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.instruments.treasuryBill.remove(item.id);
        } catch (error) { }
    }


    /**
     * * Treasury Bill Allocations
     * 
     * These are the apis for viewing, creating, editing, deleting the allocations made by Front Office on the maturing T-Bill. The Allocation are made on the Tender Sheet or Transaction File
    */

    // auto save an allocation item after user clicks the + new client 
    async autoSave(id: string, item: ITreasuryBillPurchaseAllocation) {
        const path = `${this.treasuryBillsPath}/${id}/allocations`;

        if (!path) return;

        try {

            const itemRef = doc(collection(db, path))
            item.id = itemRef.id;

            try {
                await setDoc(itemRef, item, { merge: true, })
            } catch (error) {
            }
        } catch (error) {

        }
    }

    async getAllAllocationItems(id:string) {
        this.store.instruments.treasuryBill.removeAll();
        const path = `${this.treasuryBillsPath}/${id}/allocations`;

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const tbills: ITreasuryBill[] = [];
                querySnapshot.forEach((doc) => {
                    tbills.push({ id: doc.id, ...doc.data() } as ITreasuryBill);
                });
                this.store.instruments.treasuryBill.load(tbills);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    

}