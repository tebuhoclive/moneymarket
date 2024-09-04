import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { INaturalPerson } from "../../models/clients/NaturalPersonModel";
import { INaturalPersonAuditTrail } from "../../models/clients/NaturalPersonAuditTrailModel";

export default class NaturalPersonApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private naturalPersonPath() {
        return "naturalPerson";
    }

    async getAll() {
        this.store.client.naturalPerson.removeAll();
        const path = this.naturalPersonPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const clients: INaturalPerson[] = [];
                querySnapshot.forEach((doc) => {
                    clients.push({ id: doc.id, ...doc.data() } as INaturalPerson);
                });
                this.store.client.naturalPerson.load(clients);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.naturalPersonPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as INaturalPerson;
            this.store.client.naturalPerson.load([item]);
        });

        return unsubscribe;
    }

    async create(item: INaturalPerson) {

        const path = this.naturalPersonPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(item: INaturalPerson) {

        const path = this.naturalPersonPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.client.naturalPerson.load([item]);
        } catch (error) { }
    }

    async updateAndCreateAuditTrail(item: INaturalPerson, auditTrail: INaturalPersonAuditTrail) {

        const path = this.naturalPersonPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.client.naturalPerson.load([item]);
            await this.api.client.naturalPersonAuditTrail.create(item.id, auditTrail);
        } catch (error) { }

      
    }

    async delete(item: INaturalPerson) {
        const path = this.naturalPersonPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.client.naturalPerson.remove(item.id);
        } catch (error) { }
    }
}