import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { IIssuer } from "../models/IssuerModel";

export default class IssuerApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private issuerPath() {
        return "issuers";
    }

    async getAll() {
        this.store.issuer.removeAll();
        const path = this.issuerPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const issuers: IIssuer[] = [];
                querySnapshot.forEach((doc) => {
                    issuers.push({ id: doc.id, ...doc.data() } as IIssuer);
                });
                this.store.issuer.load(issuers);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.issuerPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IIssuer;
            this.store.issuer.load([item]);
        });

        return unsubscribe;
    }


    async create(item: IIssuer) {

        const path = this.issuerPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: IIssuer) {

        const path = this.issuerPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.issuer.load([item]);
        } catch (error) { }
    }


    async delete(item: IIssuer) {
        const path = this.issuerPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.issuer.remove(item.id);
        } catch (error) { }
    }
}