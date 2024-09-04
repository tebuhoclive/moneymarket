import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { observer } from "mobx-react-lite";
import { IWithdrawalTransaction, IWithdrawalTransactionQueueData } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { IconButton } from "@mui/material";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getClientName, onAmendWithdrawalTransaction, onViewWithdrawalTransaction } from "../../../../../../shared/functions/MyFunctions";
import swal from "sweetalert";
import { useEffect, useRef, useState } from "react";
import { getTimeFromTimestamp } from "../../../../../../shared/functions/DateToTimestamp";
import { padNumberStringWithZero, splitAndTrimString } from "../../../../../../shared/functions/StringFunctions";
import { getAccount } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import ProgressBar from "../../../../../../shared/components/progress/Progress";
import { currencyFormat, numberFormat } from "../../../../../../shared/functions/Directives";
import { BorderColor, Visibility } from '@mui/icons-material';
import { TransactionType } from "../../../../shared/components/transaction-process-flag/TransactionProcess";
import Modal from "../../../../../../shared/components/Modal";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import AmendWithdrawalModal from "../../../../dialogs/transactions/withdrawal-transaction/AmendWithdrawalModal";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import WithdrawalTransactionQueueView from "./transaction-views/transaction-queue-view/WithdrawalTransactionQueueView";
import { AmendSplitWithdrawalModal } from "../../../../dialogs/transactions/withdrawal-transaction/split-withdrawals/AmendSplitWithdrawalModal";

interface IProp {
  loading: boolean;
  data: IWithdrawalTransaction[];
  transactionFilter: string;
}

const WithdrawalTransactionQueueGrid = observer((props: IProp) => {
  const { api, store } = useAppContext();
  const { data, loading, transactionFilter } = props;
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isVisibleProgressbar, setIsVisibleProgressbar] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const currentUser = store.user.me?.asJson.uid;

  const transactionQueue: IWithdrawalTransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.transactionQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.transactionQueue || 0).getTime();
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
      accountName: transaction.accountName ? getAccount(transaction.accountNumber, store)?.accountName : "",
      clientName: getClientName(transaction, store) || "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      clientBankingDetails: transaction.clientBankingDetails,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      withdrawalNodeType: transaction.withdrawalNodeType,
      transactionIdentifier: transaction.transactionIdentifier,
      createdAtTime: transaction.createdAtTime.transactionQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
      description: transaction.description,
      note: transaction.note || "",
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      }
    }));

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <button
            className="btn btn-primary"
            disabled={selectedTransactions.length === 0 || loading || loadingSubmit}
            onClick={submitForFirstLevelApproval}
          >
            {loading || loadingSubmit ? (
              <span data-uk-spinner={"ratio: .5"}></span>
            ) : (
              `Submit (${selectedTransactions.length}) for Approval`
            )}
          </button>
        }
      />
    );
  };

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
  const filteredData = transactionQueue.filter((d) => {
    if (transactionFilter.trim() === "All") {
      return true;
    } else {
      return d.transactionType.includes(transactionFilter);
    }
  });
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
    const newSelectedTransactions = selectedTransactions.length === filteredData.length
      ? []
      : filteredData;
    setSelectedTransactions(newSelectedTransactions);
  };

  const canSubmitTransaction = (transaction: IWithdrawalTransactionQueueData): boolean => {
    return (
      !!transaction.amount &&
      !!transaction.clientBankingDetails &&
      (!!transaction.clientInstruction.url || !!transaction.clientInstruction.reasonForNotAttaching) &&
      !!transaction.accountNumber
    );
  };

  const totalValue = filteredData.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < filteredData.length;
    }
  }, [selectedTransactions, filteredData.length]);

  const submitForFirstLevelApproval = async () => {
    setLoadingSubmit(true);
    setIsVisibleProgressbar(true);
    const validTransactions = selectedTransactions.filter(transaction =>
      transaction.accountNumber !== "" && canSubmitTransaction(transaction)
    );
    let completedCount = 0;
    let totalTransactions = validTransactions.length;
    let invalidTransactionCount = selectedTransactions.length - validTransactions.length;
    for (const transaction of selectedTransactions) {
      if (transaction.accountNumber !== "" && currentUser && canSubmitTransaction(transaction)) {
        const newWithdrawalTransaction: IWithdrawalTransaction = {
          transactionStatus: "First Level",
          createdAtTime: {
            firstLevelQueue: Date.now(),
          },
          transactionAction: "Submitted for First Level Approval",
          capturedBy: currentUser,
          id: transaction.id,
          transactionDate: transaction.transactionDate,
          valueDate: transaction.valueDate,
          amount: transaction.amount,
          accountNumber: transaction.accountNumber,
          productCode: transaction.productCode,
          entityNumber: transaction.entityNumber,
          clientBankingDetails: transaction.clientBankingDetails,
          bankReference: transaction.bankReference,
          clientInstruction: {
            url: transaction.clientInstruction.url,
            reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
          },
          sourceOfFundsAttachment: {
            url: transaction.sourceOfFundsAttachment.url,
            reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
          },
          sourceOfFunds: transaction.sourceOfFunds,
          withdrawalNodeType: "Parent",
          transactionIdentifier: transaction.transactionIdentifier,
          transactionType: transaction.transactionType,
          allocationStatus: transaction.allocationStatus,
          withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
          description: transaction.description,
          emailAddress: transaction.emailAddress
        };
        try {
          await api.withdrawalTransaction.update(newWithdrawalTransaction);
          completedCount++;
          const progress = (completedCount / totalTransactions) * 100; // Calculate progress percentage
          setProgressPercentage(progress);
        } catch (error) {
          console.log("🚀 ~ submitForFirstLevelApproval ~ error:", error)
        }
      } else {
        if (invalidTransactionCount > 1) {
          swal({
            icon: "error",
            text: `${invalidTransactionCount} Transactions Not Allocated`
          });
        } else {
          swal({
            icon: "error",
            text: `${invalidTransactionCount} Transaction Not Allocated`
          });
        }
      }
    }
    setLoadingSubmit(false);
    setIsVisibleProgressbar(false);

  };
  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < filteredData.length;
    }
  }, [selectedTransactions, filteredData.length]);
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
              checked={selectedTransactions.length === filteredData.length}
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
      field: "index",
      headerName: "No",
      width: 2,
      headerClassName: "grid",
      disableColumnMenu: true,
      sortable: false,
      valueGetter: (params) => params.row.index,
    },
    {
      field: "transactionIndexedDate",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <span className='uk-width-4-5'>
              {`${dateFormat_YY_MM_DD(params.row.transactionDate)} ${getTimeFromTimestamp(params.row.transactionDate)}`}
            </span>
          </div>
        )
      },
    },
    {
      field: "lastUpdate",
      headerName: "Last Update",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <span className='uk-width-4-5'>
              {`${dateFormat_YY_MM_DD(params.row.createdAtTime)} ${getTimeFromTimestamp(params.row.createdAtTime)}`}
            </span>
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
      field: "accountName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {

        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.clientName}
          </div>
        )
      },
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
      field: "email",
      headerName: "Client Email",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.emailAddress}
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
      }
    },
    {
      field: "Option",
      headerName: "Actions",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <>
            <IconButton data-uk-tooltip="Edit Transaction" onClick={() => onAmendWithdrawalTransaction(params.row, store, setShowOnAmendModal)}>
              <BorderColor />
            </IconButton>
            <IconButton data-uk-tooltip="View" onClick={() => onViewWithdrawalTransaction(params.row, store, setShowOnSubmitModal)}>
              <Visibility />
            </IconButton>
            <TransactionType type={params.row.withdrawalTransactionProcess} />
          </>
        )
      }
    },
  ];

  return (
    <div className="grid">
      <DataGrid
        sx={{
          height: 'auto', width: '100%', maxHeight: 480,
          '& .MuiDataGrid-main': {
            overflow: 'auto',
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            },
            '& .MuiDataGrid-columnHeader': {
              '&:hover .MuiDataGrid-iconButtonContainer': {
                visibility: 'visible',
              },
              '& .MuiDataGrid-iconButtonContainer': {
                visibility: 'visible',
              }
            }
          }
        }}
        loading={loading || loadingSubmit}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter,
        }}
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={50}
      />
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL
        }>
        {showOnAmendModal &&
          <AmendWithdrawalModal isVisible={setShowOnAmendModal} />
        }
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_TRANSACTION_MODAL}>
        {showOnAmendModal && <AmendSplitWithdrawalModal isVisible={setShowOnAmendModal} />}
      </Modal>

      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW //! change to view transaction for all grids
        }>
        {showOnSubmitModal &&
          <WithdrawalTransactionQueueView isVisible={setShowOnSubmitModal} />
        }
      </Modal>
    </div>
  );
})
export default WithdrawalTransactionQueueGrid;
