import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { IBond, IBondUpdate } from "../../models/instruments/BondModel";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";

export default class BondApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private bondsPath() {
        return "bonds";
    }

    async getAll() {
        this.store.instruments.bond.removeAll();
        const path = this.bondsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: IBond[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as IBond);
                });
                this.store.instruments.bond.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.bondsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IBond;
            this.store.instruments.bond.load([item]);
        });

        return unsubscribe;
    }


    async create(item: IBond) {

        const path = this.bondsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: IBond) {

        const path = this.bondsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.instruments.bond.load([item]);
        } catch (error) { }
    }

    async updateDailyPrice(item: IBondUpdate) {
        const path = this.bondsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
        } catch (error) {
        }
    }


    async delete(item: IBond) {
        const path = this.bondsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.instruments.bond.remove(item.id);
        } catch (error) { }
    }
}