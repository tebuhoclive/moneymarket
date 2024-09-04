import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import { IAssetManagerFlowDay } from "../../models/AssetManagerFlowDayModel";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";


export default class AssetManagerFlowDayApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private assetManagerDailyFlowPath() {
        return `assetManagerDailyFlows/`;
    }

    async getAll() {

        this.store.assetManager.day.removeAll();
        const path = this.assetManagerDailyFlowPath();

        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const days: IAssetManagerFlowDay[] = [];
                querySnapshot.forEach((doc) => {
                    days.push({ id: doc.id, ...doc.data() } as IAssetManagerFlowDay);
                });
                this.store.assetManager.day.load(days);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.assetManagerDailyFlowPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IAssetManagerFlowDay;
            this.store.assetManager.day.load([item]);
        });

        return unsubscribe;
    }

    async create(item: IAssetManagerFlowDay) {

        const path = this.assetManagerDailyFlowPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        item.id = itemRef.id;

        try {
            await setDoc(itemRef, item, { merge: true, })
        } catch (error) {
        }
    }

    async update(item: IAssetManagerFlowDay) {

        const path = this.assetManagerDailyFlowPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, item.id), {
                ...item,
            });
            this.store.assetManager.day.load([item]);
        } catch (error) { }
    }

    async delete(item: IAssetManagerFlowDay) {
        const path = this.assetManagerDailyFlowPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, item.id));
            this.store.assetManager.day.remove(item.id);
        } catch (error) { }
    }
}