import {
  query,
  collection,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import { ISwitchTransaction } from "../models/SwitchTransactionModel";
import { ISwitchAudit } from "../models/SwitchAuditModel";

export default class SwitchTransactionApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private switchPath() {
    return "switchTransactions";
  }

  async getAll() {
    this.store.switch.removeAll();
    const path = this.switchPath();
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const switches: ISwitchTransaction[] = [];
          querySnapshot.forEach((doc) => {
            switches.push({ id: doc.id, ...doc.data() } as ISwitchTransaction);
          });
          this.store.switch.load(switches);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getById(id: string) {
    const path = this.switchPath();
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as ISwitchTransaction;
      this.store.switch.load([item]);
    });

    return unsubscribe;
  }

  async create(item: ISwitchTransaction) {
    const path = this.switchPath();
    if (!path) return;
    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;
    try {
      await setDoc(itemRef, item, { merge: true });
      const auditRecord: ISwitchAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.switchAction || "",
        actionDescription: `Transaction was ${item.switchAction}`,
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.switchAudit.create(item.id, auditRecord);
      } catch (error) {
        console.log("Error " + error);
      }
    } catch (error) {
      console.log("Error " + error);
    }
  }
  async update(item: ISwitchTransaction) {
    const path = this.switchPath();
    if (!path) return;

    try {
      console.log("I am about to update  transaction")
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      const auditRecord: ISwitchAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.switchAction || "",
        actionDescription: `Transaction was ${item.switchAction}`,
        actionUser: this.store.auth.meUID || "",
      };
      try {
        console.log("I am about to create audit")
        await this.api.switchAudit.create(
          item.id,
          auditRecord
        );
      } catch (error) {
        console.log("Error creating audit trail "+error);
      }
      this.store.switch.load([item]);
    } catch (error) {
      console.log("Error updating transaction "+error)
    }
  }
  async updateAndCreateAuditTrail(
    oldTransaction: ISwitchTransaction,
    item: ISwitchTransaction
  ) {
    const path = this.switchPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.switch.load([item]);
      const auditRecord: ISwitchAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.switchAction || "",
        actionDescription: `Transaction was ${item.switchAction}`,
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.switchAudit.create(item.id, auditRecord);
      } catch (error) {
        console.log("Error "+error);
      }
    } catch (error) {
      console.log("Error "+error);
    }
  }

  async updateStatusToDeleted(transactionId: string) {
    const path = this.switchPath();
    if (!path) return;

    try {
      const itemRef = doc(db, path, transactionId);
      await updateDoc(itemRef, {
        allocationStatus: "Deleted",
        transactionStatus: "Deleted",
        createdAtTime: { deletedQueue: Date.now() },
      });
      const auditRecord: ISwitchAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: "Deleted",
        actionDescription: `Transaction was Deleted`,
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.switchAudit.create(transactionId, auditRecord);
      } catch (error) {}
    } catch (error) {}
  }

  async delete(item: ISwitchTransaction) {
    const path = this.switchPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.switch.remove(item.id);
    } catch (error) {}
  }
}
