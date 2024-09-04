//first level
import { ACTIVE_ENV } from "../../../money-market-management-system/logged-in/CloudEnv";
import MODAL_NAMES from "../../../money-market-management-system/logged-in/dialogs/ModalName";
import AppApi from "../../apis/AppApi";
import { IDepositTransaction } from "../../models/deposit-transaction/DepositTransactionModel";
import AppStore from "../../stores/AppStore";
import showModalFromId from "../ModalShow";
import { getAccount } from "./BankStatementUpload";

export const displayDepositModal = (
  action: string,
  transactionId: string,
  store: AppStore
) => {
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );
  if (selectedTransaction) {
    store.depositTransaction.select(selectedTransaction.asJson);
    switch (action) {
      case "record-manual":
        showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_DEPOSIT_MODAL);
        break;
      case "amend":
        showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
        break;
      case "return-for-amendment":
        showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
        break;
      case "mark-as-non-deposit":
        showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
        break;
      case "move-to-unallocated":
        showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
        break;
      case "first-level-approval":
        showModalFromId(
          MODAL_NAMES.BACK_OFFICE.DEPOSIT_APPROVE_FIRST_LEVEL_MODAL
        );
        break;
      case "second-level-approval":
        showModalFromId(
          MODAL_NAMES.BACK_OFFICE.DEPOSIT_APPROVE_SECOND_LEVEL_MODAL
        );
        break;
      case "view-completed":
        // showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_VIEW_MODAL);
        break;
      default:
        break;
    }
  }
};

export const onSubmitFirstLevelApproval = async (
  transactions: IDepositTransaction[],
  api: AppApi,
  store: AppStore
) => {
  const concurrencyLimit = 100;
  const url = `${ACTIVE_ENV.url}onSubmitDepositFirstLevelApprovalHandler`;

  const processTransaction = async (transaction: IDepositTransaction) => {
    const oldTransaction = store.depositTransaction.getItemById(transaction.id);

    if (oldTransaction) {
      const _transactionToUpdate: IDepositTransaction = {
        ...oldTransaction.asJson,
        accountNumber: oldTransaction.asJson.id,
        transactionStatus: "First Level",
        createdAtTime: {
          transactionQueue:
            oldTransaction.asJson.createdAtTime.transactionQueue,
          firstLevelQueue: Date.now(),
        },
      };

      const payload = {
        oldTransaction: oldTransaction.asJson,
        transaction: _transactionToUpdate,
        user: store.user.me?.asJson.uid,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    }
  };

  const processTransactionsInChunks = async (
    transactions: IDepositTransaction[],
    limit: number
  ) => {
    const chunks = [];
    for (let i = 0; i < transactions.length; i += limit) {
      chunks.push(transactions.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((transaction: IDepositTransaction) =>
          processTransaction(transaction)
        )
      );
    }
  };
  await processTransactionsInChunks(transactions, concurrencyLimit);
};

export const onMarkTransactionAsNonDeposit = async (
  transactions: IDepositTransaction[],
  api: AppApi,
  store: AppStore
) => {
  const concurrencyLimit = 100;
  const url = `${ACTIVE_ENV.url}onMarkAsNonDepositHandler`;

  const processTransaction = async (transaction: IDepositTransaction) => {
    const oldTransaction = store.depositTransaction.getItemById(transaction.id);

    if (oldTransaction) {
      const _transactionToUpdate: IDepositTransaction = {
        ...oldTransaction.asJson,
        transactionStatus: "Non-Deposit",
        createdAtTime: {
          transactionQueue:
            oldTransaction.asJson.createdAtTime.transactionQueue,
          nonDepositsQueue: Date.now(),
        },
      };

      const payload = {
        oldTransaction: oldTransaction.asJson,
        transaction: _transactionToUpdate,
        user: store.user.me?.asJson.uid,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log("Processed", payload);
          return true;
        } else {
          console.log("Failed", response.status);
          return false;
        }
      } catch (error) {
        console.log("Error", error);
        return false;
      }
    }
  };

  const processTransactionsInChunks = async (
    transactions: IDepositTransaction[],
    limit: number
  ) => {
    const chunks = [];
    for (let i = 0; i < transactions.length; i += limit) {
      chunks.push(transactions.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((transaction: IDepositTransaction) =>
          processTransaction(transaction)
        )
      );
    }
  };
  await processTransactionsInChunks(transactions, concurrencyLimit);
};

export const onMoveToUnallocated = async (
  transactions: IDepositTransaction[],
  api: AppApi,
  store: AppStore
) => {
  const concurrencyLimit = 100;
  const url = `${ACTIVE_ENV.url}onMoveToUnallocatedHandler`;

  const processTransaction = async (transaction: IDepositTransaction) => {
    const oldTransaction = store.depositTransaction.getItemById(transaction.id);

    if (oldTransaction) {
      const _transactionToUpdate: IDepositTransaction = {
        ...oldTransaction.asJson,
        accountNumber: oldTransaction.asJson.id,
        transactionStatus: "Unallocated",
        createdAtTime: {
          transactionQueue:
            oldTransaction.asJson.createdAtTime.transactionQueue,
          unAllocatedQueue: Date.now(),
        },
      };

      const payload = {
        oldTransaction: oldTransaction.asJson,
        transaction: _transactionToUpdate,
        user: store.user.me?.asJson.uid,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    }
  };

  const processTransactionsInChunks = async (
    transactions: IDepositTransaction[],
    limit: number
  ) => {
    const chunks = [];
    for (let i = 0; i < transactions.length; i += limit) {
      chunks.push(transactions.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((transaction: IDepositTransaction) =>
          processTransaction(transaction)
        )
      );
    }
  };
  await processTransactionsInChunks(transactions, concurrencyLimit);
};

export const onDeleteTransaction = async (
  transactions: IDepositTransaction[],
  api: AppApi,
  store: AppStore
) => {
  const concurrencyLimit = 100;
  const url = `${ACTIVE_ENV.url}onDeleteDepositHandler`;

  const processTransaction = async (transaction: IDepositTransaction) => {
    const oldTransaction = store.depositTransaction.getItemById(transaction.id);

    if (oldTransaction) {
      const _transactionToUpdate: IDepositTransaction = {
        ...oldTransaction.asJson,
        accountNumber: oldTransaction.asJson.id,
        transactionStatus: "Deleted",
        createdAtTime: {
          transactionQueue:
            oldTransaction.asJson.createdAtTime.transactionQueue,
          deletedQueue: Date.now(),
        },
      };

      const payload = {
        oldTransaction: oldTransaction.asJson,
        transaction: _transactionToUpdate,
        user: store.user.me?.asJson.uid,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    }
  };

  const processTransactionsInChunks = async (
    transactions: IDepositTransaction[],
    limit: number
  ) => {
    const chunks = [];
    for (let i = 0; i < transactions.length; i += limit) {
      chunks.push(transactions.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((transaction: IDepositTransaction) =>
          processTransaction(transaction)
        )
      );
    }
  };
  await processTransactionsInChunks(transactions, concurrencyLimit);
};

export const onRestoreToTransactionQueue = async (
  transactions: IDepositTransaction[],
  api: AppApi,
  store: AppStore
) => {
  const concurrencyLimit = 100;
  const url = `${ACTIVE_ENV.url}onRestoreDepositToTransactionQueueHandler`;

  const processTransaction = async (transaction: IDepositTransaction) => {
    const oldTransaction = store.depositTransaction.getItemById(transaction.id);

    if (oldTransaction) {
      const _transactionToUpdate: IDepositTransaction = {
        ...oldTransaction.asJson,
        transactionStatus: "Draft",
        createdAtTime: {
          transactionQueue:
            oldTransaction.asJson.createdAtTime.transactionQueue,
          deletedQueue: Date.now(),
        },
      };

      const payload = {
        oldTransaction: oldTransaction.asJson,
        transaction: _transactionToUpdate,
        user: store.user.me?.asJson.uid,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log("Processed", payload);
          return true;
        } else {
          console.log("Failed", response.status);
          return false;
        }
      } catch (error) {
        console.log("Error", error);
        return false;
      }
    }
  };

  const processTransactionsInChunks = async (
    transactions: IDepositTransaction[],
    limit: number
  ) => {
    const chunks = [];
    for (let i = 0; i < transactions.length; i += limit) {
      chunks.push(transactions.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((transaction: IDepositTransaction) =>
          processTransaction(transaction)
        )
      );
    }
  };
  await processTransactionsInChunks(transactions, concurrencyLimit);
};

export const onApproveDepositFirstLevel = async (
  transactions: IDepositTransaction[],
  api: AppApi,
  store: AppStore
) => {
  const concurrencyLimit = 100;
  const url = `${ACTIVE_ENV.url}onApproveDepositFirstLevelHandler`;
  const currentUser = store.auth.meUID || "";

  const processTransaction = async (transaction: IDepositTransaction) => {
    const account = getAccount(transaction.accountNumber, store);

    const oldTransaction = store.depositTransaction.getItemById(transaction.id);

    if (oldTransaction) {
      const _transactionToUpdate: IDepositTransaction = {
        ...oldTransaction.asJson,
        transactionStatus: "Second Level",
        createdAtTime: {
          transactionQueue:
            oldTransaction.asJson.createdAtTime.transactionQueue,
          firstLevelQueue: oldTransaction.asJson.createdAtTime.firstLevelQueue,
          secondLevelQueue: Date.now(),
        },
        firstLevelApprover: currentUser,
      };

      const payload = {
        oldTransaction: oldTransaction.asJson,
        transaction: _transactionToUpdate,
        account: account,
        user: store.user.me?.asJson.uid,
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    }
  };

  const processTransactionsInChunks = async (
    transactions: IDepositTransaction[],
    limit: number
  ) => {
    const chunks = [];
    for (let i = 0; i < transactions.length; i += limit) {
      chunks.push(transactions.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((transaction: IDepositTransaction) =>
          processTransaction(transaction)
        )
      );
    }
  };
  await processTransactionsInChunks(transactions, concurrencyLimit);
};
