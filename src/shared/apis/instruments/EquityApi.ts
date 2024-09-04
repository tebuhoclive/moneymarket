import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IEquity, IEquityUpdate } from "../../models/instruments/EquityModel";

export default class EquityApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private equityPath() {
        return "equities";
    }

    async getAll() {
        this.store.instruments.equity.removeAll();
        const path = this.equityPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: IEquity[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as IEquity);
                });
                this.store.instruments.equity.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.equityPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IEquity;
            this.store.instruments.equity.load([item]);
        });

        return unsubscribe;
    }


    async create(item: IEquity) {

        const path = this.equityPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: IEquity) {

        const path = this.equityPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.instruments.equity.load([item]);
        } catch (error) { }
    }

    async updateDailyPrice(item: IEquityUpdate) {
        const path = this.equityPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
        } catch (error) {
        }
    }

    async delete(item: IEquity) {
        const path = this.equityPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.instruments.equity.remove(item.id);
        } catch (error) { }
    }
}