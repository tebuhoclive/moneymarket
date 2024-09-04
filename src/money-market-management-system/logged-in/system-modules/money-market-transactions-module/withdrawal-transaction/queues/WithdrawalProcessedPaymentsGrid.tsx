import { observer } from "mobx-react-lite";
import { IWithdrawalTransaction, IWithdrawalTransactionQueueData } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { IconButton } from "@mui/material";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getUser } from "../../../../../../shared/functions/MyFunctions";
import { getAccount } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import { getClientName } from "../../../../../../shared/functions/MyFunctions";
import { getTimeFromTimestamp } from "../../../../../../shared/functions/DateToTimestamp";
import { currencyFormat, numberFormat } from "../../../../../../shared/functions/Directives";
import { TransactionType } from "../../../../shared/components/transaction-process-flag/TransactionProcess";
import { Visibility } from '@mui/icons-material';
import { splitAndTrimString, padNumberStringWithZero } from '../../../../../../shared/functions/StringFunctions';
import { useEffect, useRef, useState } from "react";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import Modal from "../../../../../../shared/components/Modal";
import MODAL_NAMES from "../../../../dialogs/ModalName";

import WithdrawalCompleteView from "./transaction-views/completed-transaction-view/WithdrawalCompleteView";
import AppStore from "../../../../../../shared/stores/AppStore";
import showModalFromId from "../../../../../../shared/functions/ModalShow";

interface IProp {
  loading: boolean;
  data: IWithdrawalTransaction[];
  transactionFilter: string;
}

export const WithdrawalProcessedPaymentsGrid = observer(({ data, transactionFilter, loading }: IProp) => {
  const { store } = useAppContext();
  // const [isVisibleProgressbar, setIsVisibleProgressbar] = useState(false);
  // const [progressPercentage, setProgressPercentage] = useState(0);

  const processedQueue: IWithdrawalTransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.completedQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.completedQueue || 0).getTime();
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
      reasonForDeleting: transaction.reasonForDeleting,
      parentTransaction: transaction.parentTransaction,
      withdrawalNodeType: transaction.withdrawalNodeType,
      transactionIdentifier: transaction.transactionIdentifier,
      createdAtTime: transaction.createdAtTime.completedQueue || 0,
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
      },
      capturedBy: transaction.capturedBy,
      firstLevelApprover: transaction.firstLevelApprover,
      secondLevelApprover: transaction.secondLevelApprover
    }));

  // const handleArchiveTransactions = () => {
  //   setIsVisibleProgressbar(true)
  //   setIsVisibleProgressbar(false)
  // }


  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            {/* <button className="btn btn-primary" disabled={selectedTransactions.length === 0 || loading}
              onClick={handleArchiveTransactions}
            >
              {loading ? <span data-uk-spinner={"ratio: .5"}></span> :
                `Archive (${selectedTransactions.length})`
              }
            </button> */}
            <button disabled={filteredData.length === 0 || loading} className="btn btn-primary">Export PDF</button>
            <button disabled={filteredData.length === 0 || loading} className="btn btn-primary">Export Excel</button>
          </>
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
            {/* {selectedTransactions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />} */}
          </>
        }
      />
    );
  };

  const onViewWithdrawalTransaction = (transaction: IWithdrawalTransaction, store: AppStore, setShowOnSubmitModal?: (value: boolean) => void) => {
    store.withdrawalTransaction.select(transaction);
    if (transaction.transactionType !== "Split") {
      showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_COMPLETED_VIEW);
    }
    if (transaction.transactionType === "Split" && setShowOnSubmitModal) {
      setShowOnSubmitModal(true);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL);
    }
  };


  const filteredData = processedQueue.filter((d) => {
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

  const totalValue = filteredData.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

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
      valueGetter: (params) => `${params.row.index}.`,
    },
    {
      field: "transactionIndexedDate",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
          <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
            <span>
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
            {params.row.clientName || "-"}
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
      valueGetter: (params) => params.row.emailAddress || "-"
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
      field: "capturedBy",
      headerName: "Captured By",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.firstLevelApprover, store)
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {user}
          </div>
        )
      },
    },
    {
      field: "firstLevelApprover",
      headerName: "First-Level Approved By",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.firstLevelApprover, store)
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {user}
          </div>
        )
      },
    },
    {
      field: "secondLevelApprover",
      headerName: "Second-Level Approved By",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.firstLevelApprover, store)
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {user}
          </div>
        )
      },
    },
    {
      field: "Option",
      headerName: "Action",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          <IconButton data-uk-tooltip="View" onClick={() => onViewWithdrawalTransaction(params.row, store)}>
            <Visibility />
          </IconButton>
          <TransactionType type={params.row.withdrawalTransactionProcess} />
        </>
      ),
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
            }
          },
          '& .MuiDataGrid-columnHeader': {
            '&:hover .MuiDataGrid-iconButtonContainer': {
              visibility: 'visible',
            },
            '& .MuiDataGrid-iconButtonContainer': {
              visibility: 'visible',
            }
          }
        }}
        loading={false}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={50}
      />
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_COMPLETED_VIEW //! change to view transaction for all grids
        }>
        <WithdrawalCompleteView />
      </Modal>
      {/* <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}>
        {showOnSubmitModal && <ViewSplitWithdrawalModal setShowReturnModal={setShowOnSubmitModal} />}
      </Modal> */}
    </div>
  );
});

