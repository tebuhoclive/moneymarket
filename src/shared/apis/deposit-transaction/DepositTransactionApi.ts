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
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import {
  IDepositTransaction,
  defaultDepositTransaction,
} from "../../models/deposit-transaction/DepositTransactionModel";
import { IDepositTransactionAudit } from "../../models/deposit-transaction/DepositTransactionAuditModel";
import { IStatementTracker } from "../../models/statements-tracker/StatementTrackerModel";

export default class DepositTransactionApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private depositTransactionPath() {
    return "depositTransactions";
  }

  async getAll() {
    this.store.depositTransaction.removeAll();
    const path = this.depositTransactionPath();
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const depositTransaction: IDepositTransaction[] = [];
          querySnapshot.forEach((doc) => {
            depositTransaction.push({
              id: doc.id,
              ...doc.data(),
            } as IDepositTransaction);
          });
          this.store.depositTransaction.load(depositTransaction);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getAllPending() {
    this.store.depositTransaction.removeAll();

    const path = this.depositTransactionPath();

    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const depositTransaction: IDepositTransaction[] = [];
          querySnapshot.forEach((doc) => {
            depositTransaction.push({
              id: doc.id,
              ...doc.data(),
            } as IDepositTransaction);
          });
          this.store.depositTransaction.load(depositTransaction);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getById(id: string) {
    const path = this.depositTransactionPath();
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IDepositTransaction;
      this.store.depositTransaction.load([item]);
    });

    return unsubscribe;
  }

  async create(item: IDepositTransaction) {
    const path = this.depositTransactionPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });

      const auditRecord: IDepositTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction ?? "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
          ...defaultDepositTransaction,
        },
        dataStateAfterAudit: {
          ...item,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.depositTransactionAudit.create(item.id, auditRecord);
        const statementTracker: IStatementTracker = {
          id: "",
          trackerCode: item.statementIdentifier || "",
        };

        await this.api.statementTracker.create(statementTracker);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async $update(item: IDepositTransaction) {
    const path = this.depositTransactionPath();
    if (!path) return;
    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.depositTransaction.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async update(item: IDepositTransaction) {
    const path = this.depositTransactionPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
        accountName: item.accountName !== undefined ? item.accountName : "",
      });
      this.store.depositTransaction.load([item]);
      const auditRecord: IDepositTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction ?? "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
          ...defaultDepositTransaction,
        },
        dataStateAfterAudit: {
          ...item,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.depositTransactionAudit.create(item.id, auditRecord);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateAndCreateAuditTrail(
    oldTransaction: IDepositTransaction,
    item: IDepositTransaction
  ) {
    const path = this.depositTransactionPath();
    if (!path) return;

    // Assign a default value if bankTransactionDate is undefined
    const updatedItem = {
      ...item,
      bankTransactionDate:
        item.bankTransactionDate !== undefined ? item.bankTransactionDate : 0,
      bankValueDate: item.bankValueDate !== undefined ? item.bankValueDate : 0,
      parentTransaction:
        item.parentTransaction !== undefined ? item.parentTransaction : "",
    };

    try {
      await updateDoc(doc(db, path, item.id), updatedItem);
      this.store.depositTransaction.load([updatedItem]);
      const auditRecord: IDepositTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction ?? "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
          ...oldTransaction,
        },
        dataStateAfterAudit: {
          ...updatedItem,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.depositTransactionAudit.create(item.id, auditRecord);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateBalanceWithdraw(
    item: IDepositTransaction,
    previousBalance: number
  ) {
    const path = this.depositTransactionPath();
    if (!path) return;

    try {
      const updatedItem = { ...item, previousBalance: previousBalance };

      await updateDoc(doc(db, path, item.id), updatedItem);
      this.store.depositTransaction.load([updatedItem]);
    } catch (error) {
      // Handle the error as needed
      console.error("Error updating balance:", error);
    }
  }

  async updateStatusToCompleted(itemId: string) {
    const path = this.depositTransactionPath();
    if (!path) return;

    try {
      const itemRef = doc(db, path, itemId);
      await updateDoc(itemRef, {
        allocationStatus: "Completed",
        transactionStatus: "Completed",
        timeCompleted: Date.now(),
        ijgValueDate: Date.now(),
      });
    } catch (error) {}
  }

  async updateStatusToDeleted(transactionId: string) {
    const path = this.depositTransactionPath();
    if (!path) return;

    try {
      const itemRef = doc(db, path, transactionId);
      await updateDoc(itemRef, {
        allocationStatus: "Deleted",
        transactionStatus: "Corrected", // 
         createdAtTime: { deletedQueue: Date.now() },
      });
      const auditRecord: IDepositTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: "Deleted",
        actionDescription: `Transaction was Deleted`,
        dataStateBeforeAudit: {
          ...defaultDepositTransaction,
        },
        dataStateAfterAudit: {
          ...defaultDepositTransaction,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.depositTransactionAudit.create(
          transactionId,
          auditRecord
        );
      } catch (error) {}
    } catch (error) {}
  }

  async delete(item: IDepositTransaction) {
    const path = this.depositTransactionPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.depositTransaction.remove(item.id);
    } catch (error) {}
  }
}
