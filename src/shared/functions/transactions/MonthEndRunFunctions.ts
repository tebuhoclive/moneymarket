import swal from "sweetalert";
import AppApi from "../../apis/AppApi";
import { IMonthEndRun, IProcessedAccount } from "../../models/MonthEndRunModel";
import showModalFromId from "../ModalShow";
import MODAL_NAMES from "../../../money-market-management-system/logged-in/dialogs/ModalName";
import AppStore from "../../stores/AppStore";
import { IMoneyMarketAccount } from "../../models/money-market-account/MoneyMarketAccount";
import { IStatementTransaction } from "../../models/StatementTransactionModel";
import { Timestamp } from "firebase/firestore";
import { cloudMonthEndRunEndPoint } from "../cloudFunctionsEbv";
import { ACTIVE_ENV } from "../../../money-market-management-system/logged-in/CloudEnv";

// //initiate
// export const initiateMonthEnd = async (monthEndRun: IMonthEndRun, api: AppApi) => {
//     // create run record per fund
//     const year = new Date(monthEndRun.date).getFullYear();
//     const month = new Date(monthEndRun.date).getMonth();
//     const startTime = new Date(monthEndRun.date).getTime();

//     const _monthEndRun: IMonthEndRun = {
//         ...monthEndRun,
//         id: `${month}`,
//         runStartTime: startTime,
//         year: `${year}monthEndRuns`
//     }

//     const initiate = async () => {
//         try {
//             await api.monthEndRun.create(`${year}monthEndRuns`, _monthEndRun);
//         } catch (error) {
//         }
//     }

//     initiate();
// }

//run month end
export const runMonthEnd = (
  monthEndRun: IMonthEndRun,
  activeAccounts: IProcessedAccount[],
  api: AppApi,
  setLoading?: (loading: boolean) => void
) => {
  swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: ["Cancel", "Run Month-end"],
    dangerMode: true,
  }).then(async (edit) => {
    if (edit) {
      if (setLoading) {
        setLoading(true);
      }
      const monthEndData = {
        accounts: activeAccounts.filter((a) => a.accountType === monthEndRun.productCode),
        year: monthEndRun.year,
        month: monthEndRun.id,
      };

      // const url = `${ACTIVE_ENV.url}monthEndRun`;
      const url = `${ACTIVE_ENV.url}monthEndRunSecondGen`;
      try {
        const response = await fetch(url || "", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(monthEndData),
        });

        if (response.ok) {
          swal({
            icon: "success",
            text: "Report generated",
          });
          if (setLoading) {
            setLoading(false);
          }
          console.log("response: ", response);
        } else {
          //action
          swal({
            icon: "error",
            text: "Could not generate report",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
};

// export const completeMonthEnd = (
//   activeAccounts: IMoneyMarketAccount[],
//   api?: AppApi,
//   setLoading?: (loading: boolean) => void,
//   setProgress?: (count: string) => void,
//   setAccountNumber?: (account: number) => void,
//   year?: string,
//   month?: string
// ) => {
//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Complete Month End"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoading) {
//         setLoading(true);
//       }

//       let completedCount = 0;

//       for (const account of activeAccounts) {
//         const openingBalance =
//           (account.monthTotalInterest || 0) + account.balance;

//         const nextMonth = new Date();
//         nextMonth.setMonth(nextMonth.getMonth() + 1);
//         nextMonth.setDate(1); // Set the day to 1 to get the first day of the next month

//         //last date of the month
//         const today = new Date();
//         const lastDayOfMonth = new Date(
//           today.getFullYear(),
//           today.getMonth() + 1,
//           0
//         );

//         //first day of next month
//         const firestoreTimestamp: Timestamp = Timestamp.fromDate(nextMonth);
//         const timestampNumber: number = firestoreTimestamp.toMillis();

//         //last day of current month
//         const firestoreTimestamp1: Timestamp = Timestamp.fromDate(
//           lastDayOfMonth
//         );
//         const timestampNumber1: number = firestoreTimestamp1.toMillis();

//         //Capitalized
//         const capitalizedStatement: IStatementTransaction = {
//           id: "",
//           date: timestampNumber1,
//           transaction: "capitalisation",
//           amount: account.monthTotalInterest || 0,
//           balance: openingBalance,
//           rate: account.clientRate || 0,
//           remark: "Capitalise",
//           createdAt: Date.now(),
//         };

//         //opening balance after capitlization
//         const statement: IStatementTransaction = {
//           id: "",
//           date: timestampNumber,
//           transaction: "",
//           amount: 0,
//           balance: openingBalance,
//           rate: account.clientRate || 0,
//           remark: "Opening Balance after Capitalisation",
//           createdAt: Date.now(),
//         };

//         try {
//           await api?.mma.balanceUpdate(account.id, openingBalance);
//           await api?.mma.createStatementTransactionV2(account.id, statement);
//           await api?.mma.createStatementTransactionV2(
//             account.id,
//             capitalizedStatement
//           );
//         } catch (error) {
//         } finally {
//         }

//         completedCount++; // Increment completed count
//         const progress = (
//           (completedCount / activeAccounts.length) *
//           100
//         ).toFixed(2); // Calculate progress percentage

//         if (setProgress && setAccountNumber) {
//           setProgress(progress);
//           setAccountNumber(completedCount);
//         }
//       }

//       try {
//         await api?.monthEndRun.updateMonthEndRunStatus(year || "", month || "");
//       } catch (error) {
//       } finally {
//         swal({
//           icon: "success",
//           text: "Month End Successfully Completed",
//         });
//       }
//     }
//   });
// };

export const completeMonthEnd = async (
  accounts: IMoneyMarketAccount[],
  api: AppApi,
  setLoading: (loading: boolean) => void,
  year: string,
  month: string,
  monthEnd: IMonthEndRun
) => {
  const confirmAction = await swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: ["Cancel", "Complete Month End"],
    dangerMode: true,
  });

  if (!confirmAction) return;

  if (setLoading) {
    setLoading(true);
  }

  const url = `${ACTIVE_ENV.url}createStatementTransactionSecondVersion`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accounts: accounts
          .filter((a) => a.accountType === monthEnd?.productCode),
      }),
    });

    if (response.ok) {

      swal({
        icon: "success",
        text: "Month End Successfully Completed",
      });
      if (setLoading) {
        setLoading(false);
      }
      console.log("response: ", response);
    } else {
      //action
      swal({
        icon: "error",
        text: "Could not complete month end",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    swal({
      icon: "error",
      text: "An error occurred while completing the month end.",
    });
  }

  await api.monthEndRun.updateMonthEndRunStatus(year, month);
};

export const viewMonthEnd = (month: string, store: AppStore) => {
  const selectedMonthEnd = store.monthEndRun.getItemById(month);
  if (selectedMonthEnd) {
    store.monthEndRun.select(selectedMonthEnd.asJson);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_MONTH_END_INITIATION_MODAL);
  }
};

export const viewMonthEndReport = (month: string, store: AppStore) => {
  const selectedMonthEnd = store.monthEndRun.getItemById(month);
  if (selectedMonthEnd) {
    store.monthEndRun.select(selectedMonthEnd.asJson);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_REPORT_MODAL);
  }
};

export const viewMonthEndRollBack = (month: string, store: AppStore) => {
  const selectedMonthEnd = store.monthEndRun.getItemById(month);
  if (selectedMonthEnd) {
    store.monthEndRun.select(selectedMonthEnd.asJson);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_ROLLED_BACK_MODAL);
  }
};

// rollback month end
export const rollBackMonthEndOnSpecifiedAccount = (
  activeAccount: IProcessedAccount,
  api: AppApi
) => {
  //roll back on specified clients
  //roll back on all clients
};

// rollback month end
export const rollBackMonthEndOnAllAccounts = (
  activeAccounts: IProcessedAccount[],
  api: AppApi
) => {
  //roll back on specified clients
  //roll back on all clients
};

//complete month end
export const verifyMonthEndRun = (
  activeAccounts: IProcessedAccount[],
  api: AppApi
) => {
  //record a "capitalisation" transaction for each active client account
};

export const sendBulkStatements = (
  activeAccounts: IProcessedAccount[],
  api: AppApi
) => {
  // function to get account owner info
};
