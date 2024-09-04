import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IRecurringWithdrawalInstruction, RecurringWithdrawalTransactionStatus, defaultRecurringWithdrawalInstruction } from "../../models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
import { IRecurringWithdrawalInstructionAudit, defaultRecurringWithdrawalInstructionAudit } from "../../models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionAuditModel";


export default class RecurringWithdrawalInstructionApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private recurringWithdrawalInstructionPath() {
    return "recurringWithdrawalInstructions";
  }

  async getAll() {
    this.store.recurringWithdrawalInstruction.removeAll();
    const path = this.recurringWithdrawalInstructionPath();

    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const recurringWithdrawalInstruction: IRecurringWithdrawalInstruction[] =
            [];
          querySnapshot.forEach((doc) => {
            recurringWithdrawalInstruction.push({
              id: doc.id,
              ...doc.data(),
            } as IRecurringWithdrawalInstruction);
          });
          this.store.recurringWithdrawalInstruction.load(
            recurringWithdrawalInstruction
          );
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }
  async updateAndCreateAuditTrail(oldTransaction: IRecurringWithdrawalInstruction, item: IRecurringWithdrawalInstruction) {
    const path = this.recurringWithdrawalInstructionPath();
    if (!path) return;

    try {
        await updateDoc(doc(db, path, item.id), {
            ...item,
        });
        this.store.recurringWithdrawalInstruction.load([item]);
        const auditRecord: IRecurringWithdrawalInstructionAudit = {
            id: "",
            auditDateTime: Date.now(),
            action: item.transactionAction || "",
            actionDescription: `Transaction was ${item.transactionAction}`,
            dataStateBeforeAudit: {
                ...oldTransaction
            },
            dataStateAfterAudit: {
                ...item
            },
            actionUser: this.store.auth.meUID || ""
        }
        try {
            // await this.api.recurringWithdrawalAudit.create(item.id, auditRecord);
        } catch (error) {
            console.log(error);
        }
    } catch (error) { }
}
  async getById(id: string) {
    const path = this.recurringWithdrawalInstructionPath();
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = {
        id: doc.id,
        ...doc.data(),
      } as IRecurringWithdrawalInstruction;
      this.store.recurringWithdrawalInstruction.load([item]);
    });

    return unsubscribe;
  }

  async create(item: IRecurringWithdrawalInstruction) {
    const path = this.recurringWithdrawalInstructionPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
      const auditRecord: IRecurringWithdrawalInstructionAudit = {
        id: "",
        auditDateTime: Date.now(),
        action: item.transactionAction || "",
        actionDescription: `Transaction was ${item.transactionAction}`,
        dataStateBeforeAudit: {
            ...defaultRecurringWithdrawalInstruction
        },
        dataStateAfterAudit: {
            ...item
        },
        actionUser: this.store.auth.meUID || ""
    }
    try{
      // await this.api.recurringWithdrawalAudit.create(item.id, auditRecord);

    }catch(error){

    }
    } catch (error) {}
  }

  async updateRecurringWithdrawalStatus(
    item: IRecurringWithdrawalInstruction,
    status: RecurringWithdrawalTransactionStatus
  ) {
    const path = this.recurringWithdrawalInstructionPath();
    if (!path) return;

    try {
      const updatedItem = { ...item, transactionStatus: status };
     try{
      this.updateAndCreateAuditTrail(item,updatedItem);
     }catch(error){

     }
     // await updateDoc(doc(db, path, item.id), updatedItem);
      this.store.recurringWithdrawalInstruction.load([updatedItem]);
    } catch (error) {
      // Handle the error as needed
      console.error("Error updating balance:", error);
    }
  }

  async update(item: IRecurringWithdrawalInstruction) {
    const path = this.recurringWithdrawalInstructionPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.recurringWithdrawalInstruction.load([item]);
    } catch (error) {}
  }

  async delete(item: IRecurringWithdrawalInstruction) {
    const path = this.recurringWithdrawalInstructionPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.recurringWithdrawalInstruction.remove(item.id);
    } catch (error) {}
  }
}        