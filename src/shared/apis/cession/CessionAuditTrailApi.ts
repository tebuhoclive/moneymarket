import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { ICessionInstructionAuditTrail } from "../../models/cession/CessionInstructionAuditTrailModel";
import { db } from "../../config/firebase-config";

export default class AccountRateChangeHistoryApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private cessionInstructionAuditTrail(accountId: string) {
        return `moneyMarketAccounts/${accountId}/cessionInstructionAuditTrail`;
    }

    async getAll(accountId: string) {
        this.store.cessionInstructionAuditTrail.removeAll();
        const path = this.cessionInstructionAuditTrail(accountId);
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const cessionInstructionAuditTrail: ICessionInstructionAuditTrail[] = [];
                querySnapshot.forEach((doc) => {
                    cessionInstructionAuditTrail.push({ id: doc.id, ...doc.data() } as ICessionInstructionAuditTrail);
                });
                this.store.cessionInstructionAuditTrail.load(cessionInstructionAuditTrail);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(accountId: string, id: string) {
        const path = this.cessionInstructionAuditTrail(accountId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ICessionInstructionAuditTrail;
            this.store.cessionInstructionAuditTrail.load([item]);
        });

        return unsubscribe;
    }

    async create(accountId: string, item: ICessionInstructionAuditTrail) {

        const path = this.cessionInstructionAuditTrail(accountId);
        if (!path) return;

        const itemRef = doc(collection(db, path));
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
            console.log(error);
        }
    }

    async update(accountId: string, item: ICessionInstructionAuditTrail) {

        const path = this.cessionInstructionAuditTrail(accountId);
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.cessionInstructionAuditTrail.load([item]);
        } catch (error) { }
    }

    async delete(accountId: string, item: ICessionInstructionAuditTrail) {
        const path = this.cessionInstructionAuditTrail(accountId);
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.cessionInstructionAuditTrail.remove(item.id);
        } catch (error) { }
    }
}