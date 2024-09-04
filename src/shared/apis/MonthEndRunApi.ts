import {
  query,
  collection,
  onSnapshot,
  Unsubscribe,
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import {
  IMonthEndRun,
  IProcessedAccount,
  IRolledBackAccount,
} from "../models/MonthEndRunModel";

export default class MonthEndRunApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private monthEndRunPath(year: string) {
    return `monthEndRuns/${year}/months`;
  }

  async getAll(year: string) {
    this.store.monthEndRun.removeAll();
    const path = this.monthEndRunPath(year);
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const monthEndRun: IMonthEndRun[] = [];
          querySnapshot.forEach((doc) => {
            monthEndRun.push({ id: doc.id, ...doc.data() } as IMonthEndRun);
          });
          this.store.monthEndRun.load(monthEndRun);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }

  async getById(year: string, month: string) {
    const path = this.monthEndRunPath(year);
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, month), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IMonthEndRun;
      this.store.monthEndRun.load([item]);
    });

    return unsubscribe;
  }

  async create(year: string, item: IMonthEndRun) {
    const path = this.monthEndRunPath(year);
    if (!path) return;

    const itemRef = doc(collection(db, path), item.id);
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {}
  }

  async update(year: string, item: IMonthEndRun) {
    const path = this.monthEndRunPath(year);
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.monthEndRun.load([item]);
    } catch (error) {}
  }

  async updateMonthEndRunStatus(year: string, month: string) {
    console.log("🚀 ~ MonthEndRunApi ~ updateMonthEndRunStatus ~ year:", year)
    console.log("🚀 ~ MonthEndRunApi ~ updateMonthEndRunStatus ~ month:", month)
    const path = this.monthEndRunPath(year);
    if (!path) return;

    try {
      await updateDoc(doc(db, path, month), {
        status: "Completed",
      });
      console.log("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  
  async updateMonthEndRunStatusPending(year: string, month: string) {
    const path = this.monthEndRunPath(year);
    if (!path) return;

    try {
      await updateDoc(doc(db, path, month), {
        status: "Pending",
      });
      console.log("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async updateRollBackAccountBalance(
    year: string,
    item: IMonthEndRun,
    accountId: string,
    newBalance: number,
    newInterest: number
  ) {
    const path = this.monthEndRunPath(year);
    if (!path) return;
    try {
      // Find the index of the account in the rolledBackAccounts array
      const index = item.rolledBackAccounts.findIndex(
        (account) => account.id === accountId
      );

      // If the account exists in the array, update its balance
      if (index !== -1) {
        // Update the balance of the account at the found index
        item.rolledBackAccounts[index].lastBalance = newBalance;
        item.rolledBackAccounts[index].totalInterest = newInterest;

        // Update the document in the Firestore database
        await updateDoc(doc(db, path, item.id), {
          ...item,
        });
        // Refresh the data in the store
        this.store.monthEndRun.load([item]);
      }
    } catch (error) {}
  }

  async delete(year: string, item: IMonthEndRun) {
    const path = this.monthEndRunPath(year);
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.monthEndRun.remove(item.id);
    } catch (error) {}
  }

  async processAccount(
    year: string,
    month: string,
    account: IProcessedAccount
  ) {
    const path = this.monthEndRunPath(year);

    if (!path) return;
    try {
      await updateDoc(doc(db, path, month), {
        processedAccounts: arrayUnion(account),
      });
      console.log("Created");
    } catch (error) {
      console.log(error);
    }
  }

  // async rollBackAccount(year: string, month: string, account: IProcessedAccount) {
  //     const path = this.monthEndRunPath(year);
  //     if (!path) return;
  //     try {
  //         const docRef = doc(db, path, month);
  //         const docSnapshot = await getDoc(docRef);
  //         if (docSnapshot.exists()) {
  //             const data = docSnapshot.data();
  //             if (data && data.processedAccounts) {
  //                 const processedAccounts = data.processedAccounts;
  //                 const index = processedAccounts.findIndex((acc: IProcessedAccount) => acc.id === account.id);
  //                 if (index !== -1) {
  //                     processedAccounts.splice(index, 1); // Remove the element at the found index
  //                     await updateDoc(docRef, {
  //                         processedAccounts,
  //                         rolledBackAccounts: arrayUnion(account) // Add account to rollBackAccounts array
  //                     });
  //                     console.log('Account Rolled back');
  //                 } else {
  //                     console.log('Account not found in processedAccounts');
  //                 }
  //             } else {
  //                 console.log('processedAccounts array not found in document');
  //             }
  //         } else {
  //             console.log('Document does not exist at the specified path');
  //         }
  //     } catch (error) {
  //         console.error('Error updating Firestore:', error);
  //     } finally {
  //         this.store.monthEndRun.load();
  //     }
  // }

  async rollBackAccount(
    year: string,
    month: string,
    account: IProcessedAccount
  ) {
    const path = this.monthEndRunPath(year);
    if (!path) return;
    try {
      const docRef = doc(db, path, month);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data && data.processedAccounts) {
          const processedAccounts = data.processedAccounts;
          const index = processedAccounts.findIndex(
            (acc: IProcessedAccount) => acc.id === account.id
          );
          if (index !== -1) {
            processedAccounts.splice(index, 1); // Remove the element at the found index
            await updateDoc(docRef, {
              processedAccounts,
              rolledBackAccounts: arrayUnion(account), // Add account to rolledBackAccounts array
            });
            console.log("Account Rolled back");
          } else {
            console.log("Account not found in processedAccounts");
          }
        } else {
          console.log("processedAccounts array not found in document");
        }
      } else {
        console.log("Document does not exist at the specified path");
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    } finally {
      this.store.monthEndRun.load();
    }
  }

  async updateInterestAndDaysProcessed(
    year: string,
    month: string,
    accountIdToUpdate: string,
    days: number,
    interest: number,
    accountBalance: number
  ) {
    const path = this.monthEndRunPath(year);
    if (!path) return;
    try {
      const docRef = doc(db, path, month);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const processedAccounts = data.processedAccounts || [];

        // Find the index of the account with the given accountId
        const accountIndex = processedAccounts.findIndex(
          (account: IProcessedAccount) => account.id === accountIdToUpdate
        );

        if (accountIndex !== -1) {
          // Update the days and interest for the found account
          processedAccounts[accountIndex].days = days;
          processedAccounts[accountIndex].totalInterest = interest;
          processedAccounts[accountIndex].lastBalance = accountBalance;

          // Update only the rolledBackAccounts array in the Firestore document
          await updateDoc(docRef, {
            processedAccounts: processedAccounts,
          });

          console.log(
            "Successfully updated days and interest for account",
            accountIdToUpdate
          );
        } else {
          console.error(
            "Account with ID",
            accountIdToUpdate,
            "not found in Firestore document"
          );
        }
      } else {
        console.error("Firestore document not found:", path, month);
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    } finally {
      this.store.monthEndRun.load();
    }
  }
  async updateInterestAndDays(
    year: string,
    month: string,
    accountIdToUpdate: string,
    days: number,
    interest: number,
    accountBalance: number
  ) {
    const path = this.monthEndRunPath(year);
    if (!path) return;
    try {
      const docRef = doc(db, path, month);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const rolledBackAccounts = data.rolledBackAccounts || [];

        // Find the index of the account with the given accountId
        const accountIndex = rolledBackAccounts.findIndex(
          (account: IRolledBackAccount) => account.id === accountIdToUpdate
        );

        if (accountIndex !== -1) {
          // Update the days and interest for the found account
          rolledBackAccounts[accountIndex].days = days;
          rolledBackAccounts[accountIndex].totalInterest = interest;
          rolledBackAccounts[accountIndex].lastBalance = accountBalance;

          // Update only the rolledBackAccounts array in the Firestore document
          await updateDoc(docRef, {
            rolledBackAccounts: rolledBackAccounts,
          });

          console.log(
            "Successfully updated days and interest for account",
            accountIdToUpdate
          );
        } else {
          console.error(
            "Account with ID",
            accountIdToUpdate,
            "not found in Firestore document"
          );
        }
      } else {
        console.error("Firestore document not found:", path, month);
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    } finally {
      this.store.monthEndRun.load();
    }
  }

  //update the interest in

  async rerunMonthEnd(year: string, month: string, account: IProcessedAccount) {
    const path = this.monthEndRunPath(year);
    if (!path) return;

    try {
      const docRef = doc(db, path, month);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data && data.rolledBackAccounts) {
          const rolledBackAccounts = data.rolledBackAccounts;
          const index = rolledBackAccounts.findIndex(
            (acc: IProcessedAccount) => acc.id === account.id
          );
          if (index !== -1) {
            rolledBackAccounts.splice(index, 1); // Remove the element at the found index
            await updateDoc(docRef, {
              rolledBackAccounts,
              processedAccounts: arrayUnion(account), // Add account to processedAccounts array
            });
          } else {
            console.log("Account not found in rolledBackAccounts");
          }
        } else {
          console.log("rolledBackAccounts array not found in document");
        }
      } else {
        console.log("Document does not exist at the specified path");
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    } finally {
      // Load data or perform any other necessary cleanupl
      this.store.monthEndRun.load();
    }
  }
  //roll back api. individual account
}
