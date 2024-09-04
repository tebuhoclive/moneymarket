import AppApi from "../../../../../../../shared/apis/AppApi";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import AppStore from "../../../../../../../shared/stores/AppStore";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { ACTIVE_ENV } from "../../../../../CloudEnv";
import swal from "sweetalert";

export async function CompleteBackDate(
  transaction: IDepositTransaction,
  store: AppStore,
  api: AppApi,
  setLoader: (value: boolean) => void
) {
  setLoader(true);

  // Fetch the account details
  const mma = store.mma.all.find(
    (mma) => mma.asJson.accountNumber === transaction.accountNumber
  )?.asJson;

  if (!mma) {
    swal({
      icon: "warning",
      title: "Account not found",
      text:
        "No money market account found for the given transaction account number.",
    });
    setLoader(false);
    return;
  }

  const {
    balance: mmaCurrentAccountBalance,
    clientRate: mmaCurrentRate,
    id: mmaAccountId,
  } = mma;

  // Check if balance and rate are available
  if (mmaCurrentAccountBalance == null || mmaCurrentRate == null) {
    swal({
      icon: "warning",
      title: "System error at getting account details",
      text:
        "System did not get the current balance or client rate of the money market account.",
    });
    setLoader(false);
    return;
  }

  // Calculate new balance
  const mmaNewAccountBalance = mmaCurrentAccountBalance + transaction.amount;

  console.log(
    `${mmaCurrentAccountBalance} ${transaction.amount} = ${mmaNewAccountBalance}`
  );

  // Create a new statement transaction
  const statementTransaction: IStatementTransaction = {
    id: transaction.id,
    date: Date.parse(dateFormat_YY_MM_DD(transaction.valueDate)),
    transaction: "deposit",
    amount: transaction.amount,
    balance: mmaNewAccountBalance,
    rate: mmaCurrentRate,
    remark: "deposit",
    createdAt: Date.now(),
  };

  try {
    if (mmaAccountId) {
      // Create statement transaction
      await api.mma.createStatementTransaction(
        mmaAccountId,
        statementTransaction
      );

      // Update deposit transaction status
      await api.depositTransaction.update(transaction);

      //re-align statement and sync mma and statement accounts

      await onReAlign(mma.id);
      await api.statementTransaction.getAll(mma.id);

      swal({
        icon: "success",
        title: "Transaction Completed",
        text: "The deposit transaction has been successfully completed.",
      });
    } else {
      swal({
        icon: "warning",
        title: "System error at creating statement transaction",
        text: "System failed to create the account statement.",
      });
      setLoader(false);
      return;
    }
  } catch (error) {
    console.error("Transaction error:", error);
    swal({
      icon: "error",
      title: "Transaction Failed",
      text:
        "An error occurred while processing the transaction. Please try again later.",
    });
    setLoader(false);
    return;
  }

  // Disable the loader
  setLoader(false);
}

const onReAlign = async (accountId: string) => {
  const url = `${ACTIVE_ENV.url}reAlignStatement`;

  const _accountToUpdate = {
    mmaId: accountId,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_accountToUpdate),
    });

    if (response.ok) {
      console.log("Account", _accountToUpdate);
      return true; // Indicate success
    } else {
      console.log("error: ", response.status);
      return false; // Indicate failure
    }
  } catch (error) {
    console.log("error", error);
    return false;
  }
};
