import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ILegalEntity } from "../../models/clients/LegalEntityModel";

export default class LegalEntityApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private bondsPath() {
        return "legalClientEntities";
    }

    async getAll() {
        this.store.client.legalEntity.removeAll();
        const path = this.bondsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const clients: ILegalEntity[] = [];
                querySnapshot.forEach((doc) => {
                    clients.push({ id: doc.id, ...doc.data() } as ILegalEntity);
                });
                this.store.client.legalEntity.load(clients);
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
            const item = { id: doc.id, ...doc.data() } as ILegalEntity;
            this.store.client.legalEntity.load([item]);
        });

        return unsubscribe;
    }


    async create(item: ILegalEntity) {

        const path = this.bondsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: ILegalEntity) {

        const path = this.bondsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.client.legalEntity.load([item]);
        } catch (error) { }
    }


    async delete(item: ILegalEntity) {
        const path = this.bondsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.client.legalEntity.remove(item.id);
        } catch (error) { }
    }


    //
}