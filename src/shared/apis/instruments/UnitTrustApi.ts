import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IUnitTrust } from "../../models/instruments/UnitTrustModel";

export default class UnitTrustApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private unitTrustsPath() {
        return "unitTrusts";
    }

    async getAll() {
        this.store.instruments.unitTrust.removeAll();
        const path = this.unitTrustsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const units: IUnitTrust[] = [];
                querySnapshot.forEach((doc) => {
                    units.push({ id: doc.id, ...doc.data() } as IUnitTrust);
                });
                this.store.instruments.unitTrust.load(units);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.unitTrustsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IUnitTrust;
            this.store.instruments.unitTrust.load([item]);
        });

        return unsubscribe;
    }


    async create(item: IUnitTrust) {

        const path = this.unitTrustsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: IUnitTrust) {

        const path = this.unitTrustsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.instruments.unitTrust.load([item]);
        } catch (error) { }
    }


    async delete(item: IUnitTrust) {
        const path = this.unitTrustsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.instruments.unitTrust.remove(item.id);
        } catch (error) { }
    }
}