import { useState } from "react";
import { observer } from "mobx-react-lite";
import "./Transactions.scss";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
export interface ITransactionsData {
  index: number;
  reference: string;
  amount: number;
  amountDisplay: string;
  transactionDate: string;
  bank: string;
  allocation: string;
  allocatedBy: string;
  allocationApprovedBy: string;
  transactionStatus: string;
}

const Transactions = observer(() => {

  const [loading] = useState(false);

  // const sortAndFilterSwitchData = (data: SwitchTransactionModel[], filterCondition: (item: SwitchTransactionModel) => boolean): SwitchTransactionModel[] => {
  //   return store.switch.all
  //     .sort(
  //       (a, b) =>
  //         new Date(b.asJson.switchDate || 0).getTime() -
  //         new Date(a.asJson.switchDate || 0).getTime()
  //     ).filter(filterCondition);
  // };

  // const getSwitchDataByStatus = (status: SwitchTransactionStatus) => {
  //   return sortAndFilterSwitchData(
  //     store.switch.all,
  //     (c) => c.asJson.switchStatus === status
  //   ).map((c) => {
  //     return c.asJson;
  //   });
  // };

  // const switchTransactionQueue = getSwitchDataByStatus("Pending");

  // const firstLevelApprovalSwitches = getSwitchDataByStatus("Verified");
  // const secondLevelApprovalSwitches = getSwitchDataByStatus("Approved");
  // const completedSwitches = getSwitchDataByStatus("Completed");
  // const deletedSwitches = getSwitchDataByStatus("Deleted");

  if (loading) return <LoadingEllipsis />;

  return (
    <ErrorBoundary>

    </ErrorBoundary >
  );
});
export default Transactions;
