import {
    Unsubscribe,
    collection,
    doc,
    onSnapshot,
    query,
    setDoc,
} from "firebase/firestore";
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { db } from "../../config/firebase-config";
import { IHashCode } from "../../models/hash-codes/HashCodeModel";


export default class HashCodeApi {
    constructor(private api: AppApi, private store: AppStore) { }

    async getAll() {

        const $query = query(collection(db, "hashCodes"));
        // new promise
        return await new Promise<Unsubscribe>((resolve, reject) => {
            // on snapshot
            const unsubscribe = onSnapshot(
                $query,
                // onNext
                (querySnapshot) => {
                    const items: IHashCode[] = [];
                    querySnapshot.forEach((doc) => {
                        items.push({ id: doc.id, ...doc.data() } as IHashCode);
                    });

                    this.store.hashCode.load(items);
                    resolve(unsubscribe);
                },
                (error) => {
                    reject();
                }
            );
        });
    }

    async create(item: IHashCode,) {

        const itemRef = doc(collection(db, "hashCodes"));
        item.id = itemRef.id;
        try {
            await setDoc(itemRef, item, {
                merge: true,
            });
            this.store.hashCode.load([item]);
        } catch (error) { }
    }
}
