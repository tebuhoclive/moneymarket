import swal from "sweetalert";
// import "../../../Batches.scss";
import { observer } from "mobx-react-lite";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IWithdrawalTransaction, IWithdrawalTransactionQueueData } from "../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";

import { useAppContext } from "../../../../../../../shared/functions/Context";
import { batchTransactionRevert, getUser } from "../../../../../../../shared/functions/MyFunctions";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import HistoryIcon from "@mui/icons-material/History";
import { IWithdrawalPaymentBatch } from "../../../../../../../shared/models/batches/BatchesModel";
import { useEffect, useRef, useState } from "react";
import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";

import { PaymentTransactions, generateHighValueBankPaymentFile, generateNormalValuePaymentFile, generateZarPaymentFile } from "../../../../../../../shared/functions/PaymentFileGenerator";
import { getElementAtIndex, padNumberStringWithZero, splitAndTrimString } from "../../../../../../../shared/functions/StringFunctions";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { OpenInNew } from "@mui/icons-material";
import Modal from "../../../../../../../shared/components/Modal";
import MODAL_NAMES from "../../../../../dialogs/ModalName";

import DataGridFooter from "../../../../../shared/components/toolbar/DataGridFooter";
import ProgressBar from "../../../../../../../shared/components/progress/Progress";
import { currencyFormat, numberFormat } from "../../../../../../../shared/functions/Directives";
import DataGridToolbar from "../../../../../shared/components/toolbar/DataGridToolbar";
import { getTimeFromTimestamp } from "../../../../../../../shared/functions/DateToTimestamp";
import { getAccount } from "../../../../../../../shared/functions/transactions/BankStatementUpload";
import { onReAlign } from "../../../../../../../shared/functions/transactions/CorrectionsOnStatement";
import showModalFromId from "../../../../../../../shared/functions/ModalShow";
import WithdrawalPaymentBatchTransactionView from "../../../../../dialogs/transactions/withdrawal-transaction/view-approve/WithdrawalPaymentBatchTransactionView";

interface IProp {
  data: IWithdrawalTransaction[];
  batch: IWithdrawalPaymentBatch;
}

export const BatchTransactionsGrid = observer(({ data, batch }: IProp) => {
  const { store, api } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [isVisibleProgressbar, setIsVisibleProgressbar] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const [allTransactionsSuccess, setAllTransactionsSuccess] = useState(false);

  const onViewCompletedWithdrawalTransaction = (batchId: string, transactionId: string) => {
    const selectedTransaction = store.withdrawalTransaction.getItemById(transactionId);
    const selectedBatch = store.batches.getItemById(batchId);
    if (selectedTransaction && selectedBatch) {
      store.batches.select(selectedBatch.asJson);
      store.withdrawalTransaction.select(selectedTransaction.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_COMPLETED_VIEW);
    }
  }

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            {batch && batch.paymentBatchFileType === "Normal" && (
              <button className="btn btn-primary" onClick={handleGenerateFile} disabled={allTransactionsSuccess}>
                Download Payment File
              </button>
            )}
            {batch && batch.paymentBatchFileType === "ZAR" && (
              <div>
                <button className="btn btn-primary" onClick={handleGenerateZarFile} disabled={allTransactionsSuccess}>
                  Download Payment File
                </button>
              </div>
            )}
            {batch && batch.paymentBatchFileType === "High" && (
              <div>
                <button className="btn btn-primary" onClick={handleGenerateHighValueFile} disabled={allTransactionsSuccess}>
                  Download Payment File
                </button>
              </div>
            )}
          </>
        }
      />
    );
  };

  const totalValue = data.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const CustomFooter = () => {
    return (
      <DataGridFooter
        rightControls={
          <h4 className="main-title-md">
            Total Amount: {currencyFormat(totalValue)}
          </h4>
        }
        centerControls={
          <>
            {selectedTransactions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />}
          </>
        }
      />
    );
  };

  const batchStatusSuccessSingle = async (
    transaction: IWithdrawalTransaction,
    status: string
  ) => {
    swal({
      title: "Are you sure?",
      text: "You are about to mark the transactions as successful",
      icon: "warning",
      buttons: ["Cancel", "Proceed"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        try {
          setLoading(true);
          if (transaction.transactionType === "Manual Close Out" || transaction.transactionType === "Online Close Out") {
            await processCloseOutTransaction(transaction, status);
          } else {
            await processWithdrawalTransaction(transaction, status);
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.error("Error processing transactions:", error);
        }
      } else {
        swal({
          icon: "error",
          text: "Transaction marked as successful!",
        });
      }
    });
  };

  const batchStatusFailSingle = async (transaction: IWithdrawalTransaction, status: string) => {
    swal({
      title: "Mark transaction as failed?",
      text: "You are about to mark the payment as Failed",
      icon: "warning",
      buttons: ["Cancel", "Proceed"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        try {
          await api.batches.updateBatchTransactionStatus(batch, transaction.id, status);
        } catch (error) {
        }
      } else {
      }
    });
  };

  const batchStatusSuccess = async (
    transactions: IWithdrawalTransaction[],
    status: string
  ) => {
    swal({
      title: "Are you sure?",
      text: "You are about to mark the transactions as successful",
      icon: "warning",
      buttons: ["Cancel", "Proceed"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        try {
          for (const transaction of transactions) {
            if (transaction.transactionType === "Manual Close Out" || transaction.transactionType === "Online Close Out") {
              await processCloseOutTransaction(transaction, status);
            } else {
              await processWithdrawalTransaction(transaction, status);
            }
          }
        } catch (error) {
          console.error("Error processing transactions:", error);
        } finally {
          setLoading(false);
        }
      } else {
        swal({
          icon: "error",
          text: "Transaction marked as successful!",
        });
      }
    });
  };

  const batchStatusFailed = async (transactionId: string, status: string) => {
    swal({
      title: "Are you sure?",
      text: "You are about to mark the transaction as Failed",
      icon: "warning",
      buttons: ["Cancel", "Proceed"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        try {
          await api.batches.updateBatchTransactionStatus(
            batch,
            transactionId,
            status
          );
          // await api.withdrawalTransaction.updateProcessStatus(transactionId);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      } else {
        swal({
          icon: "error",
          text: "Transaction marked as Failed!",
        });
      }
    });
  };

  const revertTransaction = async (transactionId: string) => {
    swal({
      title: "Are you sure?",
      text: "You are about to revert this transaction, reverted transactions are sent back to the payment queue",
      icon: "warning",
      buttons: ["Cancel", "Yes"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        try {
          await batchTransactionRevert(api, store, transactionId, batch, data);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      } else {
        //cancelled operation
        swal({
          icon: "error",
          text: "Operation cancelled!",
        });
      }
    });
  };



  const processWithdrawalTransaction = async (transaction: IWithdrawalTransaction, status: string) => {
    console.log("🚀 ~ processWithdrawalTransaction ~ transaction:", transaction)


    const saveTransaction: IWithdrawalTransaction = {
      ...transaction,
      transactionAction: "Completed",
      transactionStatus: "Completed",
      processedBy: store.auth.meUID || "",
    };

    console.log("save transaction: ", saveTransaction);

    await update(transaction, saveTransaction);

    try {
      const moneyMarketAccount = store.mma.all.find((account) => account.asJson.accountNumber === transaction.accountNumber
      )?.asJson;

      if (moneyMarketAccount) {
        await api.batches.updateBatchTransactionStatus(
          batch,
          transaction.id,
          status
        );

        const statementTransaction: IStatementTransaction = {
          id: transaction.id,
          date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
          transaction: "withdrawal",
          balance: moneyMarketAccount.balance - transaction.amount,
          previousBalance: moneyMarketAccount.balance,
          rate: moneyMarketAccount.clientRate || 0,
          remark: transaction.bankReference,
          amount: transaction.amount,
          createdAt: Date.now(),
        };

        await api.mma.createStatementTransaction(moneyMarketAccount.id || "",
          statementTransaction
        );
        await onReAlign(moneyMarketAccount.id);
      }
    } catch (error) { }

  };


  const processCloseOutTransaction = async (transaction: IWithdrawalTransaction, status: string) => {

    const saveTransaction: IWithdrawalTransaction = {
      ...transaction,
      transactionStatus: "Completed",
      transactionAction: "Completed",
    };

    const transactionId = transaction.id;

    const moneyMarketAccount = store.mma.all.find((account) => account.asJson.accountNumber === transaction.accountNumber)?.asJson;

    const withdrawalTransaction = store.withdrawalTransaction.all.find(transaction => transaction.asJson.id === transactionId)?.asJson;

    if (moneyMarketAccount && withdrawalTransaction && withdrawalTransaction.closeOutInterest) {

      await update(transaction, saveTransaction);
      const statementTransactionCapitalise: IStatementTransaction = {
        id: `${withdrawalTransaction.id}CC`,
        date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
        transaction: "deposit",
        balance: moneyMarketAccount.balance + withdrawalTransaction.closeOutInterest || 0,
        previousBalance: moneyMarketAccount.balance,
        rate: moneyMarketAccount.clientRate || 0,
        remark: `Capitalise`,
        amount: withdrawalTransaction.closeOutInterest || 0,
        createdAt: Date.now(),
      };

      try {
        await api.mma.createStatementTransaction(moneyMarketAccount.id, statementTransactionCapitalise);

        await api.batches.updateBatchTransactionStatus(
          batch,
          transaction.id,
          status
        );
        const statementTransaction: IStatementTransaction = {
          id: transaction.id,
          date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
          transaction: "withdrawal",
          balance: moneyMarketAccount.balance - withdrawalTransaction.amount,
          previousBalance: moneyMarketAccount.balance,
          rate: moneyMarketAccount.balance || 0,
          remark: `Close Out: Withdraw to account ${transaction.clientBankingDetails}`,
          amount: transaction.amount,
          createdAt: Date.now() + 1,
        };
        await api.mma.createStatementTransaction(
          moneyMarketAccount.id || "",
          statementTransaction
        );
        await onReAlign(moneyMarketAccount.id);
      } catch (error) {
      }
    }
  };

  const transactions: PaymentTransactions[] = data.map(
    (transaction, index) => ({
      transactionSubBatchNumber: padNumberStringWithZero(index.toString(), 3),
      transactionReferenceNumber: transaction.bankReference.trim(),
      branchNumber: getElementAtIndex(transaction.clientBankingDetails, 3).trim(),
      accountNumber: getElementAtIndex(transaction.clientBankingDetails, 1).trim(),
      accountName: getElementAtIndex(transaction.clientBankingDetails, 2).trim(),
      amount: transaction.amount,
      bankReference: transaction.bankReference.trim(),
      paymentAlertDestinationType: "E",
      // paymentAlertDestination: transaction.emailAddress || "",
      paymentAlertDestination: "ict@lotsinsights.com",
      streetName: transaction.townName || "18 Kleinne Kuppe",
      townName: transaction.townName || "Windhoek",
      province: transaction.province || "Khomas",
      postalCode: transaction.postalCode || "",
      countryCode: transaction.countryCode || "NA",
      balanceOfPaymentCodes: transaction.balanceOfPaymentCodes || "",
      balanceOfPaymentCodeEntityType: transaction.balanceOfPaymentCodeEntityType || ""
    })
  );

  const handleGenerateFile = async () => {
    if (transactions) {
      generateNormalValuePaymentFile(transactions);
      const _batch: IWithdrawalPaymentBatch = {
        ...batch,
        isFileDownloaded: true,
      };
      await api.batches.update(_batch);
    } else {
      swal({
        icon: "error",
        text: "No transactions to Export!",
      });
    }
  };

  const handleGenerateZarFile = async () => {
    if (transactions) {
      generateZarPaymentFile(transactions);
      const _batch: IWithdrawalPaymentBatch = {
        ...batch,
        isFileDownloaded: true,
      };
      await api.batches.update(_batch);
    } else {
      swal({
        icon: "error",
        text: "No transactions to Export!",
      });
    }
  };

  const handleGenerateHighValueFile = async () => {
    if (transactions) {
      generateHighValueBankPaymentFile(transactions);
      const _batch: IWithdrawalPaymentBatch = {
        ...batch,
        isFileDownloaded: true,
      };
      await api.batches.update(_batch);
    } else {
      swal({
        icon: "error",
        text: "No transactions to Export!",
      });
    }
  };

  const update = async (oldTransactionState: IWithdrawalTransaction, newTransactionState: IWithdrawalTransaction) => {
    try {
      await api.withdrawalTransaction.updateAndCreateAuditTrail(oldTransactionState, newTransactionState);
    } catch (error) { }
  };

  const batchedTransactions: IWithdrawalTransactionQueueData[] = [...data]
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.paymentQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.paymentQueue || 0).getTime();
      return timeB - timeA; // Sorts in descending order
    }).map((transaction, index: number) => ({
      index: padNumberStringWithZero(`${index + 1}`, 2),
      id: transaction.id,
      emailAddress: transaction.emailAddress ?? "",
      valueDateView: dateFormat_YY_MM_DD(transaction.valueDate),
      valueDate: transaction.valueDate,
      transactionDateView: dateFormat_YY_MM_DD(transaction.transactionDate),
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountNumber ? getAccount(transaction.accountNumber, store)?.accountName : "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      clientBankingDetails: transaction.clientBankingDetails,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      withdrawalNodeType: transaction.withdrawalNodeType,
      transactionIdentifier: transaction.transactionIdentifier,
      createdAtTime: transaction.createdAtTime.paymentQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
      description: transaction.description,
      note: transaction.note || "",
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      secondLevelApprover: transaction.secondLevelApprover || ""
    }));



  const [selectedTransactions, setSelectedTransactions] = useState<IWithdrawalTransactionQueueData[]>([]);
  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);

  const handleTransactionCheckboxChange = (transaction: IWithdrawalTransactionQueueData) => {
    const isSelected = selectedTransactions.some(t => t.id === transaction.id);
    const newSelectedTransactions = isSelected
      ? selectedTransactions.filter(t => t.id !== transaction.id)
      : [...selectedTransactions, transaction];
    setSelectedTransactions(newSelectedTransactions);
  };

  const handleSelectAllTransactionChange = () => {
    const newSelectedTransactions = selectedTransactions.length === batchedTransactions.length
      ? []
      : batchedTransactions;
    setSelectedTransactions(newSelectedTransactions);
  };


  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "",
      width: 2,
      headerClassName: "grid",
      disableColumnMenu: true,
      sortable: false,
      renderHeader: () => {
        return (
          <div>
            <input
              className="uk-checkbox uk-margin-top-small"
              type="checkbox"
              ref={selectAllTransactionsRef}
              checked={selectedTransactions.length === batchedTransactions.length}
              onChange={handleSelectAllTransactionChange}
            />
          </div>
        )
      },
      renderCell: (params) => {
        return (
          <input
            className="uk-checkbox"
            type="checkbox"
            checked={selectedTransactions.some(t => t.id === params.row.id)}
            onChange={() => handleTransactionCheckboxChange(params.row)}
          />
        )
      },
    },
    {
      field: "transactionIndexedDate",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {`${dateFormat_YY_MM_DD(params.row.transactionDate)} ${getTimeFromTimestamp(params.row.transactionDate)}`}
          </div>
        )
      },
    },
    {
      field: "accountNumber",
      headerName: "Client Account",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.accountNumber || "-",
    },
    {
      field: "bankAccName",
      headerName: "Bank Acc Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {splitAndTrimString('|', params.row.clientBankingDetails)[2] || "-"}
          </div>
        )
      },
    },
    {
      field: "bankAccNumber",
      headerName: "Bank Acc Number",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {splitAndTrimString('|', params.row.clientBankingDetails)[1] || "-"}
          </div>
        )
      },
    },
    {
      field: "bankName",
      headerName: "Bank Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {splitAndTrimString('|', params.row.clientBankingDetails)[0] || "-"}
          </div>
        )
      },
    },
    {
      field: "product",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.productCode || "-",
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.transactionType} ({params.row.allocationStatus})
          </div>
        )
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      headerClassName: "grid",
      editable: true,
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'right', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {numberFormat(params.row.amount)}
          </div>
        )
      },
    },
    {
      field: "batchTransactionStatus",
      headerName: "Status",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.transactionStatus,
      cellClassName: (params) => {
        const status = params.row.transactionStatus;
        switch (status) {
          case "Pending":
            return "blue-background-batch";
          case "Failed":
            return "red-background-batch";
          case "Completed":
            return "green-background-batch";
          default:
            return "";
        }
      },
    },
    {
      field: "Option",
      headerName: "Option",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          <IconButton
            data-uk-tooltip="View Transaction"
            onClick={() => onViewCompletedWithdrawalTransaction(batch.id, params.row.id)}
          >
            <OpenInNew />
          </IconButton>
          {loading ?
            <LoadingEllipsis />
            :
            <>
              {batch.isFileDownloaded === true ?
                <div>
                  {params.row.transactionStatus !== "Completed" && (
                    <>
                      <IconButton
                        data-uk-tooltip="Mark as Success"
                        onClick={() =>
                          batchStatusSuccessSingle(params.row, "Completed")
                        }
                        disabled={params.row.transactionStatus === "Failed"}>
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton data-uk-tooltip={
                        params.row.transactionStatus === "Failed"
                          ? "Cannot Fail"
                          : "Mark as Fail"
                      }
                        onClick={() => batchStatusFailSingle(params.row.id, "Failed")}
                        disabled={params.row.transactionStatus === "Failed"}>
                        <DangerousIcon />
                      </IconButton>
                      <IconButton
                        data-uk-tooltip="Revert Transaction"
                        onClick={() => revertTransaction(params.row.id)}>
                        <HistoryIcon />
                      </IconButton>
                    </>
                  )}
                </div> :
                <div>

                </div>
              }
            </>
          }
        </>
      ),
    },
  ];

  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < batchedTransactions.length;
    }
  }, [selectedTransactions, batchedTransactions.length]);

  useEffect(() => {
    const data = async () => {
      await api.earlyDistribution.getAll();
      await api.closeOutApi.getAll();
    };

    data();
  }, [api.closeOutApi, api.earlyDistribution]);

  // Check if all transactions are successful
  useEffect(() => {
    const isPartial = batchedTransactions.every((transaction) => transaction.transactionStatus === "Partial");
    const isPending = batchedTransactions.every((transaction) => transaction.transactionStatus === "Pending");
    const isSuccess = batchedTransactions.every((transaction) => transaction.transactionStatus === "Completed");
    const isFailed = batchedTransactions.every((transaction) => transaction.transactionStatus === "Failed");

    setAllTransactionsSuccess(isSuccess);

    const batchToUpdate = {
      ...batch,
      batchFileStatus: "Processed"
    }

    const updateBatchStatus = async () => {
      await api.batches.update(batchToUpdate);
    }

    updateBatchStatus();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.batches]);

  return (
    <div className="grid">
      <DataGrid
        sx={{ height: 'auto', width: '100%', maxHeight: 380 }}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        loading={loading}
        rows={data}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={50}
      />

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_COMPLETED_VIEW}>
        <WithdrawalPaymentBatchTransactionView />
      </Modal>
    </div>
  );
});

