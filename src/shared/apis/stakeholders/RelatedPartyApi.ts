import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IRelatedParty } from "../../models/stakeholders/RelatedPartyModel";


export default class RelatedPartyApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private relatedPartyPath() {
        return "relatedParty";
    }

    async getAll() {
        this.store.stakeholder.relatedParty.removeAll();
        const path = this.relatedPartyPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const stakeholders: IRelatedParty[] = [];
                querySnapshot.forEach((doc) => {
                    stakeholders.push({ id: doc.id, ...doc.data() } as IRelatedParty);
                });
                this.store.stakeholder.relatedParty.load(stakeholders);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.relatedPartyPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IRelatedParty;
            this.store.stakeholder.relatedParty.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IRelatedParty) {

        const path = this.relatedPartyPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(item: IRelatedParty) {

        const path = this.relatedPartyPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.stakeholder.relatedParty.load([item]);
        } catch (error) { }
    }

    // async updateAndCreateAuditTrail(item: IRelatedParty, auditTrail: IRelatedPartyAuditTrail) {

    //     const path = this.relatedPartyPath();
    //     if (!path) return;

    //     try {
    //         await updateDoc(doc(db, path, item.id), {
    //             ...item,
    //         });
    //         this.store.stakeholder.relatedParty.load([item]);
    //         //await this.api.stakeholder.relatedPartyAuditTrail.create(item.id, auditTrail);
    //     } catch (error) { }

      
    // }

    async delete(item: IRelatedParty) {
        const path = this.relatedPartyPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.stakeholder.relatedParty.remove(item.id);
        } catch (error) { }
    }
}