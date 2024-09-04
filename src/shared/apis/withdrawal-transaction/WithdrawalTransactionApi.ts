import {
  query,
  collection,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import {
  IWithdrawalTransaction,
  defaultWithdrawalTransaction,
} from "../../models/withdrawal-transaction/WithdrawalTransactionModel";
import { IWithdrawalTransactionAudit } from "../../models/withdrawal-transaction/WithdrawalTransactionAuditModel";

export default class WithdrawalTransactionApi {
  constructor(private api: AppApi, private store: AppStore) { }

  private withdrawalTransactionPath() {
    return "withdrawalTransactions";
  }

  async getAll() {
    this.store.withdrawalTransaction.removeAll();
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const withdrawalTransaction: IWithdrawalTransaction[] = [];
          querySnapshot.forEach((doc) => {
            withdrawalTransaction.push({
              id: doc.id,
              ...doc.data(),
            } as IWithdrawalTransaction);
          });
          this.store.withdrawalTransaction.load(withdrawalTransaction);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getById(id: string) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IWithdrawalTransaction;
      this.store.withdrawalTransaction.load([item]);
    });

    return unsubscribe;
  }

  async create(item: IWithdrawalTransaction) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
      const auditRecord: IWithdrawalTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction || "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
          ...defaultWithdrawalTransaction,
        },
        dataStateAfterAudit: {
          ...item,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.withdrawalTransactionAudit.create(
          item.id,
          auditRecord
        );
      } catch (error) {
      }
    } catch (error) {
    }
  }

  async update(item: IWithdrawalTransaction) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      const auditRecord: IWithdrawalTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction || "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
          ...defaultWithdrawalTransaction,
        },
        dataStateAfterAudit: {
          ...item,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.withdrawalTransactionAudit.create(
          item.id,
          auditRecord
        );
      } catch (error) {
      }
      this.store.withdrawalTransaction.load([item]);
    } catch (error) {
    }
  }

  async returnForAmendment(oldTransaction: IWithdrawalTransaction, item: IWithdrawalTransaction) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });

      const auditRecord: IWithdrawalTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction || "",
        actionDescription: item.note || "",
        dataStateBeforeAudit: {
          ...oldTransaction,
        },
        dataStateAfterAudit: {
          ...item,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        alert("Now here man check");
        await this.api.withdrawalTransactionAudit.create(
          item.id,
          auditRecord
        );
      } catch (error) {
        alert(error)
      }
      this.store.withdrawalTransaction.load([item]);
    } catch (error) {
      console.log("item", item);
      alert(error)
    }
  }
  async updateAndCreateAuditTrail(
    oldTransaction: IWithdrawalTransaction,
    item: IWithdrawalTransaction
  ) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.withdrawalTransaction.load([item]);

      const auditRecord: IWithdrawalTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction || "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
          ...oldTransaction,
        },
        dataStateAfterAudit: {
          ...item,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.withdrawalTransactionAudit.create(
          item.id,
          auditRecord
        );
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
    }
  }

  async updateBatchStatus(withdrawalId: string) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      const querySnapshot = await getDocs(
        query(collection(db, path), where("id", "==", withdrawalId))
      );

      if (!querySnapshot.empty) {
        const document = querySnapshot.docs[0]; // Assuming there's only one document with the given withdrawalId
        const docRef = doc(db, path, document.id);

        await updateDoc(docRef, {
          transactionStatus: "Batched",
        });
      } else {
      }
    } catch (error) { }
  }

  async updateBatchStatusAndCreateAuditTrail(
    oldTransaction: IWithdrawalTransaction,
    item: IWithdrawalTransaction,
    withdrawalId: string
  ) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      const querySnapshot = await getDocs(
        query(collection(db, path), where("id", "==", withdrawalId))
      );

      if (!querySnapshot.empty) {
        const document = querySnapshot.docs[0]; // Assuming there's only one document with the given withdrawalId
        const docRef = doc(db, path, document.id);

        await updateDoc(docRef, {
          transactionStatus: "Batched",
        });
        const auditRecord: IWithdrawalTransactionAudit = {
          id: "",
          auditDateTime: Date.now(),
          action: "Added to Batch",
          actionDescription: `Transaction was Added to Batch`,
          dataStateBeforeAudit: {
            ...oldTransaction,
          },
          dataStateAfterAudit: {
            ...item,
          },
          actionUser: this.store.auth.meUID || "",
        };
        try {
          await this.api.withdrawalTransactionAudit.create(
            item.id,
            auditRecord
          );
        } catch (error) {
          console.log(error);
        }
      } else {
      }
    } catch (error) { }
  }

  async updateBatchStatusToFalse(withdrawalId: string) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      const querySnapshot = await getDocs(
        query(collection(db, path), where("id", "==", withdrawalId))
      );

      if (!querySnapshot.empty) {
        const document = querySnapshot.docs[0]; // Assuming there's only one document with the given withdrawalId
        const docRef = doc(db, path, document.id);

        await updateDoc(docRef, {
          batchStatus: false,
        });
      } else {
      }
    } catch (error) { }
  }

  async updateBatchStatusToFalseAndCreateAuditTrail(
    oldTransaction: IWithdrawalTransaction,
    item: IWithdrawalTransaction,
    withdrawalId: string
  ) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      const querySnapshot = await getDocs(
        query(collection(db, path), where("id", "==", withdrawalId))
      );

      if (!querySnapshot.empty) {
        const document = querySnapshot.docs[0]; // Assuming there's only one document with the given withdrawalId
        const docRef = doc(db, path, document.id);

        await updateDoc(docRef, {
          batchStatus: false,
        });

        const auditRecord: IWithdrawalTransactionAudit = {
          id: "",
          auditDateTime: Date.now(),
          action: "Removed from Batched Transactions",
          actionDescription: `Transaction was Removed from Batched Transactions`,
          dataStateBeforeAudit: {
            ...oldTransaction,
          },
          dataStateAfterAudit: {
            ...item,
          },
          actionUser: this.store.auth.meUID || "",
        };
        try {
          await this.api.withdrawalTransactionAudit.create(
            item.id,
            auditRecord
          );
        } catch (error) {
          console.log(error);
        }
      } else {
      }
    } catch (error) { }
  }

  async updateStatusToDeleted(transactionId: string) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      const itemRef = doc(db, path, transactionId);
      await updateDoc(itemRef, {
        allocationStatus: "Deleted",
        transactionStatus: "Deleted",
        createdAtTime: { deletedQueue: Date.now() },
      });
      const auditRecord: IWithdrawalTransactionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: "Deleted",
        actionDescription: `Transaction was Deleted`,
        dataStateBeforeAudit: {
          ...defaultWithdrawalTransaction,
        },
        dataStateAfterAudit: {
          ...defaultWithdrawalTransaction,
        },
        actionUser: this.store.auth.meUID || "",
      };
      try {
        await this.api.withdrawalTransactionAudit.create(
          transactionId,
          auditRecord
        );
      } catch (error) { }
    } catch (error) { }
  }

  async delete(item: IWithdrawalTransaction) {
    const path = this.withdrawalTransactionPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.withdrawalTransaction.remove(item.id);
    } catch (error) { }
  }
}
