import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { INaturalPersonAuditTrail } from "../../models/clients/NaturalPersonAuditTrailModel";

export default class NaturalPersonAuditTrailApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private naturalPersonAuditTrailPath(id: string) {
        return `naturalPerson/${id}/auditTrail/`;
    }

    async getAll(id: string) {
        this.store.client.naturalPersonAuditTrail.removeAll();
        const path = this.naturalPersonAuditTrailPath(id);
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const clients: INaturalPersonAuditTrail[] = [];
                querySnapshot.forEach((doc) => {
                    clients.push({ id: doc.id, ...doc.data() } as INaturalPersonAuditTrail);
                });
                this.store.client.naturalPersonAuditTrail.load(clients);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(clientId: string, auditId:string) {
        const path = this.naturalPersonAuditTrailPath(clientId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, auditId), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as INaturalPersonAuditTrail;
            this.store.client.naturalPersonAuditTrail.load([item]);
        });

        return unsubscribe;
    }

    async create(clientId:string, item: INaturalPersonAuditTrail) {

        const path = this.naturalPersonAuditTrailPath(clientId);
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(clientId: string, item: INaturalPersonAuditTrail) {

        const path = this.naturalPersonAuditTrailPath(clientId);
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.client.naturalPersonAuditTrail.load([item]);
        } catch (error) { }
    }

    async delete(clientId: string, item: INaturalPersonAuditTrail) {
        const path = this.naturalPersonAuditTrailPath(clientId);
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.client.naturalPersonAuditTrail.remove(item.id);
        } catch (error) { }
    }
}