import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IFixedDeposit } from "../../models/instruments/FixedDepositModel";

export default class FixedDepositApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private fixedDepositsPath() {
        return "fixedDeposits";
    }

    async getAll() {
        this.store.instruments.fixedDeposit.removeAll();
        const path = this.fixedDepositsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: IFixedDeposit[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as IFixedDeposit);
                });
                this.store.instruments.fixedDeposit.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.fixedDepositsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IFixedDeposit;
            this.store.instruments.fixedDeposit.load([item]);
        });

        return unsubscribe;
    }


    async create(item: IFixedDeposit) {

        const path = this.fixedDepositsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: IFixedDeposit) {

        const path = this.fixedDepositsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.instruments.fixedDeposit.load([item]);
        } catch (error) { }
    }


    async delete(item: IFixedDeposit) {
        const path = this.fixedDepositsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.instruments.fixedDeposit.remove(item.id);
        } catch (error) { }
    }
}