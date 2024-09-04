import {
  query,
  collection,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  getDoc,
  addDoc,
  runTransaction,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IMoneyMarketAccount } from "../../models/money-market-account/MoneyMarketAccount";
import { IProductUpdate } from "../../models/ProductModel";
import { generateNextAccountNumber } from "../../functions/MyFunctions";
import { IStatementTransaction } from "../../models/StatementTransactionModel";
export interface IMoneyAccountInterestLog {
  id: string;
  interestLogDate: string;
  fee: number;
  interest: number;
  runningBalance: number;
  accountBalance: number;
}

export default class MoneyMarketAccountApi {
  constructor(private api: AppApi, private store: AppStore) { }

  private categoriesPath() {
    return "moneyMarketAccounts";
  }

  async getAll() {
    this.store.mma.removeAll();
    const path = this.categoriesPath();
    if (!path) return;

    const $query = query(collection(db, path));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const mma: IMoneyMarketAccount[] = [];
          querySnapshot.forEach((doc) => {
            mma.push({ id: doc.id, ...doc.data() } as IMoneyMarketAccount);
          });
          this.store.mma.load(mma);

          // Check if all data is loaded
          if (querySnapshot.size === mma.length) {
            resolve(unsubscribe); // Resolve the promise only when all data is loaded
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getAllActiveAccounts() {
    this.store.mma.removeAll();
    const path = this.categoriesPath();
    if (!path) return;

    const $query = query(collection(db, path), where('status', '==', 'Active'));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot($query, (querySnapshot) => {
        const mma: IMoneyMarketAccount[] = [];
        querySnapshot.forEach((doc) => {
          mma.push({ id: doc.id, ...doc.data() } as IMoneyMarketAccount);
        });

        this.store.mma.load(mma);

        // Check if all data is loaded
        if (querySnapshot.size === mma.length) {
          resolve(unsubscribe); // Resolve the promise only when all data is loaded
        }
      },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getAllInActiveAccounts() {
    this.store.mma.removeAll();
    const path = this.categoriesPath();
    if (!path) return;

    const $query = query(collection(db, path), where('status', '==', 'inactive'));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const mma: IMoneyMarketAccount[] = [];
          querySnapshot.forEach((doc) => {
            mma.push({ id: doc.id, ...doc.data() } as IMoneyMarketAccount);
          });
          this.store.mma.load(mma);

          // Check if all data is loaded
          if (querySnapshot.size === mma.length) {
            resolve(unsubscribe); // Resolve the promise only when all data is loaded
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getAllArchivedAccounts() {
    this.store.mma.removeAll();
    const path = this.categoriesPath();
    if (!path) return;

    const $query = query(collection(db, path), where('status', '==', 'archived'));

    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const mma: IMoneyMarketAccount[] = [];
          querySnapshot.forEach((doc) => {
            mma.push({ id: doc.id, ...doc.data() } as IMoneyMarketAccount);
          });
          this.store.mma.load(mma);

          // Check if all data is loaded
          if (querySnapshot.size === mma.length) {
            resolve(unsubscribe); // Resolve the promise only when all data is loaded
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getById(id: string) {
    const path = this.categoriesPath();
    if (!path) return;

    const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IMoneyMarketAccount;
      this.store.mma.load([item]);
    });

    return unsubscribe;
  }

  async getByAccountNumber(accountNumber: string) {
    const path = this.categoriesPath();
    if (!path) return;

    const queryParam = query(
      collection(db, path),
      where("accountNumber", "==", accountNumber)
    );

    const unsubscribe = onSnapshot(queryParam, (snapshot) => {
      const documents = snapshot.docs;

      if (documents.length > 0) {
        const firstDocument = documents[0];
        const item = {
          id: firstDocument.id,
          ...firstDocument.data(),
        } as IMoneyMarketAccount;
        console.log("Item: ", item);
        this.store.mma.load([item]);
      }
    });

    return unsubscribe;
  }

  async create(item: IMoneyMarketAccount) {
    const path = this.categoriesPath();
    if (!path) return;

    const itemRef = doc(collection(db, path));
    item.id = itemRef.id;

    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
    } finally {
    }
  }

  async createAuto(item: IMoneyMarketAccount, clientRate?: number) {
    const path = this.categoriesPath();
    if (!path) return;

    const trackerRef = doc(db, "accountNumberTracker", "id");

    try {
      await runTransaction(db, async (transaction) => {
        const trackerSnapshot = await transaction.get(trackerRef);
        let currentAccountNumber = "A000001";

        if (trackerSnapshot.exists()) {
          const data = trackerSnapshot.data();
          currentAccountNumber = data.accountNumber || currentAccountNumber;
        } else {
          await transaction.set(trackerRef, {
            accountNumber: currentAccountNumber,
          });
        }

        item.accountNumber = currentAccountNumber;

        const newItemRef = await addDoc(collection(db, path), item);
        const newItemId = newItemRef.id;

        await updateDoc(newItemRef, { id: newItemId });

        const transactionData: IStatementTransaction = {
          balance: 0,
          id: "TURwHEkCzkSRVcbjdtTk",
          date: Date.parse("2024-04-01"), // change this to current date
          transaction: "",
          amount: 0,
          rate: clientRate || 0,
          remark: "Opening Balance after account creation",
          createdAt: Date.now(),
        };
        try {
          this.api.mma.createStatementTransaction(newItemId, transactionData);
        } catch (error) { }

        const nextAccountNumber = await generateNextAccountNumber(
          currentAccountNumber
        );
        await transaction.update(trackerRef, {
          accountNumber: nextAccountNumber,
        });
      });
    } catch (error) {
      console.error("Error creating account:", error);
      // Handle error as needed
      throw error;
    }
  }

  async update(item: IMoneyMarketAccount) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.mma.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  // async balanceUpdate(accountId: string, newMonthBalance: number) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     const docRef = doc(db, path, accountId);
  //     const docSnapshot = await getDoc(docRef);

  //     if (docSnapshot.exists()) {
  //       const accountData = docSnapshot.data();
  //       await updateDoc(docRef, {
  //         balance: newMonthBalance,
  //       });
  //     } else {
  //       console.log("Document not found for account ID:", accountId);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async updateDaysAndInterestProcessed(
    accountId: string,
    newDays: number,
    newMonthTotalInterest: number,
    month?: string,
    year?: string
  ) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      const docRef = doc(db, path, accountId);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const accountData = docSnapshot.data();
        const accountNumber = accountData.accountNumber; // Assuming 'accountNumber' is the field name containing the account number

        // Update only the 'days' and 'monthTotalInterest' fields in the Firestore document
        await updateDoc(docRef, {
          days: newDays,
          monthTotalInterest: newMonthTotalInterest,
        });

        const accountBalance = accountData.balance;

        // update here.
        await this.api.monthEndRun.updateInterestAndDaysProcessed(
          year || "",
          month || "",
          accountId,
          newDays,
          newMonthTotalInterest,
          accountBalance
        );

        console.log(
          "Updated document for account:",
          accountNumber,
          "with days:",
          newDays,
          "and interest:",
          newMonthTotalInterest
        );
        this.store.mma.load();
      } else {
        console.log("Document not found for account ID:", accountId);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async $updateDaysAndInterest(
    accountId: string,
    newDays: number,
    newMonthTotalInterest: number
  ) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      const docRef = doc(db, path, accountId);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const accountData = docSnapshot.data();
        const accountNumber = accountData.accountNumber; // Assuming 'accountNumber' is the field name containing the account number

        // Update only the 'days' and 'monthTotalInterest' fields in the Firestore document
        await updateDoc(docRef, {
          days: newDays,
          monthTotalInterest: newMonthTotalInterest,
        });
      } else {
        console.log("Document not found for account ID:", accountId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateCloseOutDaysAndInterest(
    accountId: string,
    newDays: number,
    newMonthTotalInterest: number
  ) {
    const path = this.categoriesPath();
    if (!path) {
      return;
    } else {
      try {
        await updateDoc(doc(db, path, accountId), {
          days: newDays, monthTotalInterest: newMonthTotalInterest
        });

      } catch (error) {
        alert(error);
      }
    }
  }

  async updateDaysAndInterest(
    accountId: string,
    newDays: number,
    newMonthTotalInterest: number,
    month?: string,
    year?: string
  ) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      const docRef = doc(db, path, accountId);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const accountData = docSnapshot.data();
        const accountNumber = accountData.accountNumber; // Assuming 'accountNumber' is the field name containing the account number

        // Update only the 'days' and 'monthTotalInterest' fields in the Firestore document
        await updateDoc(docRef, {
          days: newDays,
          monthTotalInterest: newMonthTotalInterest,
        });

        const accountBalance = accountData.balance;

        // update here.
        await this.api.monthEndRun.updateInterestAndDays(
          year || "",
          month || "",
          accountId,
          newDays,
          newMonthTotalInterest,
          accountBalance
        );

        console.log(
          "Updated document for account:",
          accountNumber,
          "with days:",
          newDays,
          "and interest:",
          newMonthTotalInterest
        );
        this.store.mma.load();
      } else {
        console.log("Document not found for account ID:", accountId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // async updateBalanceStatus(item: IMoneyMarketAccount, status: string) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     const updatedItem = { ...item, status: status };

  //     await updateDoc(doc(db, path, item.id), updatedItem);
  //     console.log(updatedItem);
  //     this.store.mma.load([updatedItem]);
  //   } catch (error) {
  //     // Handle the error as needed
  //     console.error("Error updating balance:", error);
  //   }
  // }

  async delete(item: IMoneyMarketAccount) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, item.id));
      this.store.mma.remove(item.id);
    } catch (error) { }
  }

  // async updateBalance(item: IMoneyMarketAccount) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     await updateDoc(doc(db, path, item.id), {
  //       ...item,
  //     });
  //     this.store.mma.load([item]);
  //   } catch (error) { }
  // }

  // async updateBalanceDeposit(item: IMoneyMarketAccount, newBalance: number) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     const updatedItem = { ...item, balance: newBalance };

  //     await updateDoc(doc(db, path, item.id), updatedItem);
  //     this.store.mma.load([updatedItem]);
  //   } catch (error) {
  //     // Handle the error as needed
  //     console.error("Error updating balance:", error);
  //   }
  // }

  // async updateApprovalStatus(item: IMoneyMarketAccount) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     await updateDoc(doc(db, path, item.id), {
  //       status: "In-Active",
  //     });
  //     this.store.mma.load([item]);
  //   } catch (error) {
  //     // Handle the error if needed
  //   }
  // }

  // async updateBalanceStatement(item: IMoneyMarketAccount, newBalance: number) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     const updatedItem = { ...item, balance: newBalance };

  //     await updateDoc(doc(db, path, item.id), updatedItem);
  //     this.store.mma.load([updatedItem]);
  //   } catch (error) { }
  // }

  // async updateBalanceWithdraw(item: IMoneyMarketAccount, newBalance: number) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     let updatedItem;
  //     if (item.status === "Pending") {
  //       updatedItem = { ...item, balance: newBalance, status: "Closed" };
  //     } else {
  //       // If no, update only the balance
  //       updatedItem = { ...item, balance: newBalance };
  //     }

  //     await updateDoc(doc(db, path, item.id), updatedItem);
  //     this.store.mma.load([updatedItem]);
  //   } catch (error) {
  //     // Handle the error as needed
  //     console.error("Error updating balance:", error);
  //   }
  // }

  // async reverseBalanceUpdate(itemId: string, amountToAdd: number) {
  //   const path = this.categoriesPath();
  //   if (!path) return;

  //   try {
  //     const docRef = doc(db, path, itemId);
  //     const docSnapshot = await getDoc(docRef);

  //     if (docSnapshot.exists()) {
  //       const item = docSnapshot.data() as IMoneyMarketAccount;
  //       const updatedItem = { ...item, balance: item.balance + amountToAdd };

  //       await updateDoc(docRef, updatedItem);
  //       this.store.mma.load([updatedItem]);
  //     }
  //   } catch (error) { }
  // }

  async updateBaseRate(item: IMoneyMarketAccount) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
      this.store.mma.load([item]);
    } catch (error) { }
  }

  async updateDailyPricing(item: IProductUpdate) {
    const path = this.categoriesPath();
    if (!path) return;

    try {
      await updateDoc(doc(db, path, item.id), {
        ...item,
      });
    } catch (error) { }
  }

  async createStatementTransactionV2(
    accountId: string,
    item: IStatementTransaction
  ) {
    const subcollectionPath = `moneyMarketAccounts/${accountId}/transactions`;

    try {
      const subcollectionRef = collection(db, subcollectionPath);
      const newItemRef = doc(subcollectionRef);
      item.id = newItemRef.id;

      await setDoc(newItemRef, item);
      console.log("Transaction created successfully!");
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  }

  async createStatementTransaction(
    accountId: string,
    item: IStatementTransaction
  ) {
    const path = `moneyMarketAccounts/${accountId}/transactions`;
    if (!path) return;
    const itemRef = doc(collection(db, path), item.id);
    item.id = itemRef.id;
    try {
      await setDoc(itemRef, item, { merge: true });
    } catch (error) {
      console.log("api error: ", error);
    }
  }

  // async createWithdrawalCapitalisationTransaction(
  //   accountId: string,
  //   item: IStatementTransaction,
  //   statementTransaction: IWithdrawalTransaction,
  //   monthTotalInterest: number
  // ) {
  //   const path = `moneyMarketAccounts/${accountId}/transactions`;
  //   if (!path) return;
  //   const itemRef = doc(collection(db, path), item.id);
  //   item.id = itemRef.id;
  //   try {
  //     await setDoc(itemRef, item, { merge: true });
  //   } catch (error) {
  //   } finally {
  //     const _statementTransaction: IStatementTransaction = {
  //       id: statementTransaction.id,
  //       date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
  //       transaction: "withdrawal",
  //       balance: 0,
  //       previousBalance: getAccountBalance(
  //         statementTransaction.accountNumber,
  //         this.store
  //       ),
  //       rate: getAccountRate(statementTransaction.accountNumber, this.store) || 0,
  //       remark: `Close Out: Withdrawal to account ${statementTransaction.clientBankingDetails}`,
  //       amount: statementTransaction.amount,
  //       createdAt: Date.now() + 1,
  //     };

  //     const balance = getAccountBalance(
  //       statementTransaction.accountNumber,
  //       this.store
  //     );

  //     this.createStatementTransaction(accountId, _statementTransaction);
  //     await minusWithdrawalAmountFromBalance(
  //       balance,
  //       statementTransaction.accountNumber,
  //       this.store,
  //       this.api,
  //       statementTransaction.id
  //     );
  //   }
  // }

  // async createSwitchCapitalisationTransaction(
  //   accountId: string,
  //   item: IStatementTransaction,
  //   statementTransaction: ISwitchTransaction,
  //   monthTotalInterest: number
  // ) {
  //   const path = `moneyMarketAccounts/${accountId}/transactions`;
  //   if (!path) return;
  //   const itemRef = doc(collection(db, path), item.id);
  //   item.id = itemRef.id;
  //   try {
  //     await setDoc(itemRef, item, { merge: true });
  //   } catch (error) {
  //   } finally {
  //     const _statementTransaction: IStatementTransaction = {
  //       id: statementTransaction.id,
  //       date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
  //       transaction: "switchFrom",
  //       balance: 0,
  //       previousBalance: getAccountBalance(
  //         statementTransaction.fromAccount,
  //         this.store
  //       ),
  //       rate: getAccountRate(statementTransaction.fromAccount, this.store) || 0,
  //       remark: `Close Out: Switch to account ${statementTransaction.toAccount}`,
  //       amount: statementTransaction.amount,
  //       createdAt: Date.now() + 1,
  //     };

  //     const balance = getAccountBalance(
  //       statementTransaction.fromAccount,
  //       this.store
  //     );

  //     this.createStatementTransaction(accountId, _statementTransaction);

  //     await minusWithdrawalAmountFromBalance(
  //       balance,
  //       statementTransaction.fromAccount,
  //       this.store,
  //       this.api,
  //       statementTransaction.id
  //     );

  //     const statementTransactionDeposit: IStatementTransaction = {
  //       id: statementTransaction.id,
  //       date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
  //       transaction: "switchTo",
  //       balance:
  //         getAccountBalance(statementTransaction.toAccount, this.store) +
  //         statementTransaction.amount,
  //       previousBalance: getAccountBalance(
  //         statementTransaction.toAccount,
  //         this.store
  //       ),
  //       rate: getAccountRate(statementTransaction.toAccount, this.store) || 0,
  //       remark: `Switch from Account ${statementTransaction.fromAccount}`,
  //       amount: statementTransaction.amount,
  //       createdAt: Date.now(),
  //     };

  //     this.createStatementTransaction(
  //       getAccountId(statementTransaction.toAccount, this.store) || "",
  //       statementTransactionDeposit
  //     );

  //     addDepositedAmountToBalance(
  //       statementTransactionDeposit.balance,
  //       statementTransaction.toAccount,
  //       this.store,
  //       this.api,
  //       statementTransaction.id
  //     );
  //   }
  // }
}
