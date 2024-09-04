import { useEffect, useState } from "react";
import swal from "sweetalert";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import {
  IMonthEndRun,
  defaultMonthEndRun,
} from "../../../../../shared/models/MonthEndRunModel";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import MODAL_NAMES from "../../ModalName";
import "./MonthEndModal.scss";
import MoneyMarketAccountModel from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import {
  calculateInterest,
  getFilteredStatementMonthEndTransactions,
  getStatementTotalDays,
  getStatementTotalDistribution,
} from "../../../../../shared/functions/transactions/Statement";
import { getAccountNumber } from "../../../../../shared/functions/MyFunctions";
import { MonthEndSummary } from "./MonthEndSummaryGrid";
import { accountNumber, clientName } from "../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { ExportAsExcel } from "react-export-table";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ACTIVE_ENV } from "../../../CloudEnv";
import { roundOff } from "../../../../../shared/functions/Directives";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

interface IMonthEndRunData {
  accountId?: string;
  clientName?: string;
  rate?: number;
  monthTotalInterest?: number;
  days?: number;
  balance?: number;
  totalNewBalance?: number;
}

interface IProp {
  setIsVisible: (show: boolean) => void;
}

const MonthEndInitiationModal = observer(({ setIsVisible }: IProp) => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdating, setUpdating] = useState<boolean>(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [updatingProduct, setUpdatingProduct] = useState<string>("");
  const [updatedProduct, setUpdatedProduct] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(startOfMonth);
  const [endDate, setEndDate] = useState<Date>(endOfMonth);
  const month = new Date(Date.now()).getMonth();
  const year = new Date(Date.now()).getFullYear();
  const [pids, setPids] = useState<string[]>([]); // Explicitly typing pids as an array of strings

  const [monthEndRun, setMonthEndRun] = useState<IMonthEndRun>({
    ...defaultMonthEndRun,
  });

  const moneyMarketAccounts = store.mma
    .getAllLiabilityAccountsNoZeroBalances()
    .sort((a, b) => a.asJson.accountNumber.localeCompare(b.asJson.accountNumber));

  const products = store.product.all
    .filter((p) => p.asJson.assetLiability === "Liability")
    .map((p) => { return p.asJson })

  const selectedProducts = products.filter((product) => pids.includes(product.id));

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = event.target.value;
    const inputDateAsANumber = event.target.valueAsNumber;
    setSelectedDate(inputDate);
    setMonthEndRun({ ...monthEndRun, date: inputDateAsANumber });
  };

  async function updateInterestAccruedAndTotalDays() {
    const totalProducts = selectedProducts.length; // Total number of selected products
    let processedProducts = 0; // Counter for processed products

    if (totalProducts === 0) {
      return;
    }

    for (const product of selectedProducts) {
      const productAccounts = moneyMarketAccounts.filter(
        (account) => account.asJson.accountType === product.productCode
      );

      setUpdatingProduct(product.productCode);

      const monthEndData = {
        accounts: productAccounts.map((a) => a.asJson),
        startDate: startDate,
        endDate: endDate,
        monthDate: monthEndRun.date,
      };

      const url = `${ACTIVE_ENV.url}updateMonthEndInterestSecondGenBulk`;

      try {
        const request = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(monthEndData),
        });

        if (request.ok) {
          processedProducts += 1; // Increment the processed products count
          const progress = (processedProducts / totalProducts) * 100; // Calculate progress percentage
          setProgressPercentage(progress); // Set the progress percentage
          setUpdatedProduct(product.productCode);
          await onFinalExecution(product.productCode, product.productName); // Trigger any final actions for the processed product
          // Continue to the next product only after the current one is processed
        } else {
          const errorText = await request.text();
          throw new Error(errorText);
        }
      } catch (error) {
        throw error;
      }
    }
    // Reload the page only after all products have been processed
    window.location.reload();
  }

  const handleInitiateMonthEndRun = async () => {
    setLoading(true);
    try {
      await updateInterestAccruedAndTotalDays();
      swal({
        icon: "success",
        text: "Data is prepared",
      });
    } catch (error) {
      console.error("Error in handleInitiateMonthEndRun:", error);
      swal({
        icon: "error",
        text: "Error preparing data",
      });
    } finally {
      setLoading(false); // Ensure setLoading is set to false regardless of success or failure
    }
  };

  const onFinalExecution = async (productCode: string, productName: string) => {
    const monthEnd: IMonthEndRun = {
      id: `${month + 1}${productCode}`,
      month: `${month + 1}`,
      year: `${year}`,
      date: Date.now(),
      status: "Pending",
      runStartTime: 0,
      runEndTime: 0,
      processedAccounts: [],
      rolledBackAccounts: [],
      productName: productName,
      productCode: productCode
    };
    try {
      setUpdating(true);
      await api.monthEndRun.create(`${year}`, monthEnd);
    } catch (error) {
      console.error("An error occurred:", error);
      swal({
        icon: "error",
        text: "An error occurred during execution. Please try again.",
      });
    }
  };

  const onCancel = () => {
    setIsVisible(false)
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
  };

  const handleCheckboxChange = (productId: string) => {
    setPids((prevPids) => {
      if (prevPids.includes(productId)) {
        // Remove the product ID if it's already selected
        return prevPids.filter((id) => id !== productId);
      } else {
        // Add the product ID if it's not selected
        return [...prevPids, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (pids.length === products.length) {
      // If all products are selected, clear the selection
      setPids([]);
    } else {
      // Otherwise, select all products
      const allProductIds = products.map((p) => p.id);
      setPids(allProductIds);
    }
  };

  return (
    <ErrorBoundary>
      <div className="month-end-modal view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          type="button"
          data-uk-close
          disabled={loading || isUpdating}
        ></button>
        <div className="form-title">
          <h3 style={{ marginRight: "1rem" }}>
            Month End
          </h3>
          <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
          <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
            Initiation
          </h3>
        </div>
        <hr />
        <div className="">

          <div className="uk-child-width-1-2@m uk-grid-small uk-grid-match" data-uk-grid>
            <div>
              <div className="">
                {!loading && (
                  <form className="uk-grid uk-grid-small" data-uk-grid>
                    <div className="uk-form-controls uk-width-1-1">
                      <label className="uk-form-label required" htmlFor="">
                        Month-End Date
                      </label>
                      <input
                        className="uk-input uk-form-small"
                        type="date"
                        name=""
                        id=""
                        min={dateFormat_YY_MM_DD(Date.now())}
                        value={selectedDate}
                        onChange={handleDateChange}
                      />
                    </div>
                  </form>
                )}
                <div className="uk-width-1-1 uk-margin">
                  <div className="uk-width-1-1">
                    <label className="uk-form-label">
                      You are about to Initiate a Month End that will be Processed on the {selectedDate}
                    </label>
                  </div>
                  <div className="uk-width-1-1 uk-margin">
                    <div className="uk-width-1-1 uk-margin"></div>
                  </div>
                </div>

              </div>
            </div>
            <div>
              <div className="modal-split-view-visible-scrollbar" style={{ height: "270px" }}>
                <label>
                  <input
                    className="uk-checkbox"
                    type="checkbox"
                    checked={pids.length === products.length && products.length > 0} // Check if all products are selected
                    onChange={handleSelectAll}
                  />
                  All
                </label>
                {products.map((p) => (
                  <div className="uk-margin uk-grid-small uk-child-width-auto uk-grid" key={p.id}>
                    <label>
                      <input
                        className="uk-checkbox"
                        type="checkbox"
                        checked={pids.includes(p.id)} // Reflect selection state for each product
                        onChange={() => handleCheckboxChange(p.id)}
                      />
                      {p.productName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="uk-grid uk-text-right uk-margin" >
          <div className="uk-width-1-1 uk-margin">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleInitiateMonthEndRun}
              disabled={loading}
            >
              Update Interest and Initiate
            </button>

            <button
              className="btn btn-danger"
              type="button"
              onClick={onCancel}
              disabled={loading || isUpdating}
            >
              Close
            </button>
            <hr />
            {loading &&
              <div>
                <label>{progressPercentage} %</label>
                <ProgressBar progress={progressPercentage} totalItems={0} title={`Updating: ${updatingProduct}. Updated: ${updatedProduct}`} />
              </div>
            }
          </div>
        </div>
        
      </div>
    </ErrorBoundary>
  );
});

export default MonthEndInitiationModal;

const calculateDays = (
  transactionDate: number,
  nextTransactionDate?: number,
  monthEnd?: number
): number => {
  const currentDate = new Date();
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
      millisecondsPerDay
    );
  } else if (monthEnd) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays =
      Math.ceil(
        (monthEnd - transactionDateTime.getTime()) / millisecondsPerDay
      ) + 1; // Add 1 to include both start and end dates
    return remainingDays;
  } else {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
      ) - 1
    ); // minus 1 to exclude current day
  }
};

function getTotalDaysFromBeginningOfMonth(selectedDate: Date): number {
  // Get the year and month of the selected date
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Create a new Date object for the beginning of the selected month
  const beginningOfMonth = new Date(year, month, 1);

  // Calculate the difference in milliseconds between the selected date and the beginning of the month
  const differenceInMs = selectedDate.getTime() - beginningOfMonth.getTime();

  // Convert milliseconds to days
  const totalDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

  return totalDays;
}

async function trackExecutionTime(fn: () => Promise<void>): Promise<number> {
  const startTime = performance.now();
  await fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  return executionTime;
}


// async function updateInterestAccruedAndTotalDays() {
//   setLoading(true);
//   const maxConcurrentRequests = 600; // Set to a manageable number to avoid overwhelming the server
//   let completedCount = 0;

//   const updateAccount = async (account: any) => {
//     const monthEndData = {
//       accountId: account.id,
//       startDate: startDate,
//       endDate: endDate,
//       monthDate: monthEndRun.date,
//     };
//     const url = `${ACTIVE_ENV.url}updateMonthEndInterestSecondGen`;

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(monthEndData),
//       });

//       if (response.ok) {
//         console.log("success: ", response);
//       } else {
//         swal({
//           icon: "error",
//           text: "Error updating account",
//         });
//       }
//     } catch (error) {
//       console.log(error);
//     } finally {
//       completedCount++;
//       const progress = ((completedCount / accountsToUpdate.length) * 100).toFixed(2);
//       setProgressPercentage(progress);
//       setAccountsUpdated(completedCount);
//     }
//   };

//   // Function to run updates with limited concurrency
//   const runUpdatesWithConcurrencyLimit = async (accounts: any[]) => {
//     const executing: any = [];
//     for (const account of accounts) {
//       const p = updateAccount(account).then(() => {
//         executing.splice(executing.indexOf(p), 1);
//       });
//       executing.push(p);
//       if (executing.length >= maxConcurrentRequests) {
//         await Promise.race(executing);
//       }
//     }
//     await Promise.all(executing);
//   };

//   try {
//     const batches = [];
//     for (let i = 0; i < accountsToUpdate.length; i += maxConcurrentRequests) {
//       batches.push(accountsToUpdate.slice(i, i + maxConcurrentRequests));
//     }

//     for (const batch of batches) {
//       await runUpdatesWithConcurrencyLimit(batch);
//     }

//     swal({
//       icon: "success",
//       text: "Update Account",
//     });
//   } catch (error) {
//     console.error("Error updating accounts:", error);
//   } finally {
//     setLoading(false);
//   }
// }

// async function updateInterestAccruedAndTotalDays() {
//   setLoading(true);
//   const maxConcurrentRequests = 400; // Set to a manageable number to avoid overwhelming the server
//   let completedCount = 0;

//   const updateAccount = async (account:any) => {
//     const monthEndData = {
//       accountId: account.id,
//       startDate: startDate,
//       endDate: endDate,
//       monthDate: monthEndRun.date,
//     };
//     const url = `${ACTIVE_ENV.url}updateMonthEndInterestSecondGen`;

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(monthEndData),
//       });

//       if (response.ok) {
//         console.log("success: ", response);
//       } else {
//         swal({
//           icon: "error",
//           text: "Error updating account",
//         });
//       }
//     } catch (error) {
//       console.log(error);
//     } finally {
//       completedCount++;
//       const progress = ((completedCount / accountsToUpdate.length) * 100).toFixed(2);
//       setProgressPercentage(progress);
//       setAccountsUpdated(completedCount);
//     }
//   };

//   const runBatchUpdateWithConcurrencyLimit = async (accounts:any) => {
//     const executing:any = [];
//     for (const account of accounts) {
//       const p = updateAccount(account).then(() => {
//         executing.splice(executing.indexOf(p), 1);
//       });
//       executing.push(p);
//       if (executing.length >= maxConcurrentRequests) {
//         await Promise.race(executing);
//       }
//     }
//     await Promise.all(executing);
//   };

//   try {
//     const batches = [];
//     for (let i = 0; i < accountsToUpdate.length; i += maxConcurrentRequests) {
//       batches.push(accountsToUpdate.slice(i, i + maxConcurrentRequests));
//     }

//     for (const batch of batches) {
//       await runBatchUpdateWithConcurrencyLimit(batch);
//     }

//     swal({
//       icon: "success",
//       text: "Update Account",
//     });
//   } catch (error) {
//     console.error("Error updating accounts:", error);
//   } finally {
//     setLoading(false);
//   }
// }


// async function updateInterestAccruedAndTotalDays() {
//   const monthEndData = {
//     accounts: moneyMarketAccounts
//       .map((a) => a.asJson),
//     startDate: startDate,
//     endDate: endDate,
//     monthDate: monthEndRun.date,
//   };


//   const url = `${ACTIVE_ENV.url}updateMonthEndInterestSecondGenBulk`;

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(monthEndData),
//     });

//     if (response.ok) {
//       console.log("success:", response);
//     } else {
//       const errorText = await response.text();
//       console.error("Error updating account:", errorText);
//       throw new Error(errorText);
//     }
//   } catch (error) {
//     console.error("Error in updateInterestAccruedAndTotalDays:", error);
//     throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
//   }
// };
