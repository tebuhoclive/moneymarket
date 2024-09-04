import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IFixedDeposit } from "../../models/instruments/FixedDepositModel";
import { ICallDeposit } from "../../models/instruments/CallDepositModel";

export default class CallDepositApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private callDepositsPath() {
        return "callDeposits";
    }

    async getAll() {
        this.store.instruments.callDeposit.removeAll();
        const path = this.callDepositsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const bonds: ICallDeposit[] = [];
                querySnapshot.forEach((doc) => {
                    bonds.push({ id: doc.id, ...doc.data() } as ICallDeposit);
                });
                this.store.instruments.callDeposit.load(bonds);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }


    async getById(id: string) {
        const path = this.callDepositsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IFixedDeposit;
            this.store.instruments.callDeposit.load([item]);
        });

        return unsubscribe;
    }


    async create(item: ICallDeposit) {

        const path = this.callDepositsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }


    async update(item: ICallDeposit) {

        const path = this.callDepositsPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.instruments.callDeposit.load([item]);
        } catch (error) { }
    }


    async delete(item: ICallDeposit) {
        const path = this.callDepositsPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.instruments.callDeposit.remove(item.id);
        } catch (error) { }
    }
}