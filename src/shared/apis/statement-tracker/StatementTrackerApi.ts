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
import { IStatementTracker } from "../../models/statements-tracker/StatementTrackerModel";


export default class StatementTrackerApi {
    constructor(private api: AppApi, private store: AppStore) { }

    async getAll() {

        const $query = query(collection(db, "statementTracker"));
        // new promise
        return await new Promise<Unsubscribe>((resolve, reject) => {
            // on snapshot
            const unsubscribe = onSnapshot(
                $query,
                // onNext
                (querySnapshot) => {
                    const items: IStatementTracker[] = [];
                    querySnapshot.forEach((doc) => {
                        items.push({ id: doc.id, ...doc.data() } as IStatementTracker);
                    });

                    this.store.statementTracker.load(items);
                    resolve(unsubscribe);
                },
                (error) => {
                    reject();
                }
            );
        });
    }

    async create(item: IStatementTracker,) {

        const itemRef = doc(collection(db, "statementTracker"));
        item.id = itemRef.id;
        try {
            await setDoc(itemRef, item, {
                merge: true,
            });
            this.store.statementTracker.load([item]);
        } catch (error) { }
    }
}
