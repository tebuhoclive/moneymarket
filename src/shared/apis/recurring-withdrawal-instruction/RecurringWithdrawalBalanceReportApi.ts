import { query, collection, updateDoc, doc, deleteDoc, onSnapshot, Unsubscribe, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IRecurringWithdrawalInstruction, RecurringWithdrawalTransactionStatus } from "../../models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
import { IRecurringWithdrawalsBalanceReport } from "../../models/recurring-withdrawal-instruction/RecurringWithdrawalsBalanceReport";


export default class RecurringWithdrawalBalanceReportApi {
  constructor(private api: AppApi, private store: AppStore) { }

  private recurringWithdrawalBalanceReportPath() {
    return "recurringWithdrawalBalanceReport";
  }

  async getAll() {
    this.store.recuralWithdrawalBalanceReport.removeAll();
    const path = this.recurringWithdrawalBalanceReportPath();

    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot($query, (querySnapshot) => {
        const recurringWithdrawalReport: IRecurringWithdrawalsBalanceReport[] = [];
        querySnapshot.forEach((doc) => {
            recurringWithdrawalReport.push({ id: doc.id, ...doc.data() } as IRecurringWithdrawalsBalanceReport);
        });
        this.store.recuralWithdrawalBalanceReport.load(recurringWithdrawalReport);
        resolve(unsubscribe);
      }, (error) => {
        reject();
      });
    });

  }

  async getById(id: string) {
    const path = this.recurringWithdrawalBalanceReportPath();
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IRecurringWithdrawalsBalanceReport;
      this.store.recuralWithdrawalBalanceReport.load([item]);
    });

    return unsubscribe;
  }

  async create(item: IRecurringWithdrawalsBalanceReport) {
    const path = this.recurringWithdrawalBalanceReportPath();
    if (!path) return;

    const itemRef = doc(collection(db, path))
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true, })
    } catch (error) {
    }
  }
//   async updateRecurringWithdrawalStatus(item: IRecurringWithdrawalsBalanceReport, status: string) {
//     const path = this.recurringWithdrawalBalanceReportPath();
//     if (!path) return;

//     try {
//         const updatedItem = { ...item, transactionStatus: status };

//         await updateDoc(doc(db, path, item.id), updatedItem);
//         this.store.recurringWithdrawalInstruction.load([updatedItem]);
//     } catch (error) {
//         // Handle the error as needed
//         console.error("Error updating balance:", error);
//     }
// }

  async update(item: IRecurringWithdrawalsBalanceReport) {
    const path = this.recurringWithdrawalBalanceReportPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.recuralWithdrawalBalanceReport.load([item]);
    } catch (error) { }
  }

  async delete(item: IRecurringWithdrawalsBalanceReport) {
    const path = this.recurringWithdrawalBalanceReportPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.recuralWithdrawalBalanceReport.remove(item.id);
    } catch (error) { }
  }
}         