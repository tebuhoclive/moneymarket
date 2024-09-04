import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { defaultCessionInstruction, ICessionInstruction } from "../../models/cession/CessionInstructionModel";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ICessionInstructionAuditTrail } from "../../models/cession/CessionInstructionAuditTrailModel";
export default class CessionInstructionApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private cessionInstruction(accountId: string) {
        return `moneyMarketAccounts/${accountId}/cessionInstruction`;
    }

    async getAll(accountId: string) {
        this.store.cessionInstruction.removeAll();
        const path = this.cessionInstruction(accountId);
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const products: ICessionInstruction[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() } as ICessionInstruction);
                });
                this.store.cessionInstruction.load(products);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(accountId: string, id: string) {
        const path = this.cessionInstruction(accountId);
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as ICessionInstruction;
            this.store.cessionInstruction.load([item]);
        });

        return unsubscribe;
    }

    async create(accountId: string, item: ICessionInstruction) {

        const path = this.cessionInstruction(accountId);
        if (!path) return;

        const itemRef = doc(collection(db, path));
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, });

            const auditRecord: ICessionInstructionAuditTrail = {
                id: "",
                auditDateTime: Date.now(),
                action: "Loaded",
                actionDescription: "New cession loaded on account",
                dataStateBeforeAudit: {
                    ...defaultCessionInstruction
                },
                dataStateAfterAudit: {
                    ...item
                },
                actionUser: this.store.auth.meUID || ""
            }

            try {
                this.api.cessionAuditTrail.create(accountId, auditRecord);
            } catch (error) {

            }
        } catch (error) {
        }
    }

    async update(accountId: string, audit: ICessionInstructionAuditTrail, item: ICessionInstruction) {
        const path = this.cessionInstruction(accountId);
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.cessionInstruction.load([item]);

            try {
                this.api.cessionAuditTrail.create(accountId, audit);
            } catch (error) {
            }
        } catch (error) { }
    }

    async delete(accountId: string, item: ICessionInstruction) {
        const path = this.cessionInstruction(accountId);
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.cessionInstruction.remove(item.id);
        } catch (error) { }
    }
}