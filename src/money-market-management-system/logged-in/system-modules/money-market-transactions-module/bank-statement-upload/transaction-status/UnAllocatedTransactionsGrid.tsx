import { IconButton } from '@mui/material';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { IDepositTransaction } from '../../../../../../shared/models/deposit-transaction/DepositTransactionModel';
import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../../shared/utils/utils';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { currencyFormat, numberFormat } from '../../../../../../shared/functions/Directives';
import MODAL_NAMES from '../../../../dialogs/ModalName';
import Modal from '../../../../../../shared/components/Modal';
import { useEffect, useRef, useState } from 'react';
import { DepositAmendModal } from '../../../../dialogs/transactions/client-deposit-allocation/new-modals/Deposits/amend-modal/newDepositAmendModal';
import { getAccount } from '../../../../../../shared/functions/transactions/BankStatementUpload';
import { BorderColor } from '@mui/icons-material';
import { getMMAProduct, onViewTransaction } from '../../../../../../shared/functions/MyFunctions';
import { observer } from 'mobx-react-lite';

import { padNumberStringWithZero } from '../../../../../../shared/functions/StringFunctions';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';
import { TransactionType } from '../../../../shared/components/transaction-process-flag/TransactionProcess';
import { AmendSplitDepositModal } from '../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/AmendSplitDepositModal';
import { onAmendDepositTransaction } from '../../../../../../shared/functions/MyFunctions';
import DataGridToolbar from '../../../../shared/components/toolbar/DataGridToolbar';
interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const UnallocatedTransactionsGrid = observer((props: IProps) => {
  const { api,store } = useAppContext();
  const { data, loading } = props;
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [transactionsUpdated, setTransactionsUpdated] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  interface ITransactionQueueData {
    index: string,
    id: string;
    bankTransactionDateView?: string;
    bankTransactionDate?: number;
    emailAddress?:string;
    bankValueDateView?: string;
    bankValueDate?: number;
    valueDateView: string,
    valueDate: number,
    transactionDateView: string;
    transactionDate: number;
    amount: number;
    accountNumber: string;
    productCode: string;
    entityNumber: string;
    sourceBank: string
    bankReference: string;
    sourceOfFunds: string;
    parentTransaction?: string;
    depositNodeType: "Parent" | "Child";
    statementIdentifier: string;
    createdAtTime: number;
    lastModifiedAtTime: number;
    transactionType: string;
    description: string;
    allocationStatus: string;
    transactionStatus: string;
    depositTransactionProcess: string;
    notes?: {
      id: string,
      note: string,
      queue: string,
      createdAt: number,
      createdBy: string,
    };
    sourceOfFundsAttachment: {
      url?: string, // if a source of fund description is provided ensure that an attachment is required
      reasonForNotAttaching: string
    }
    proofOfPaymentAttachment: {
      url?: string,
      reasonForNotAttaching: string
    }
  }


  const transactionQueue: ITransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.transactionQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.transactionQueue || 0).getTime();
      return timeB - timeA; // Sorts in descending order
    }).map((transaction, index: number) => ({
      index: padNumberStringWithZero(`${index + 1}`, 2),
      id: transaction.id,
      bankTransactionDateView: transaction.bankTransactionDate ? dateFormat_YY_MM_DD_NEW(transaction.bankTransactionDate) : "",
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDateView: transaction.bankValueDate ? dateFormat_YY_MM_DD_NEW(transaction.bankValueDate) : "",
      bankValueDate: transaction.bankValueDate,
      emailAddress: transaction.emailAddress ?? "",
      valueDateView: dateFormat_YY_MM_DD(transaction.valueDate),
      valueDate: transaction.valueDate,
      transactionDateView: dateFormat_YY_MM_DD(transaction.transactionDate),
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountName ? getAccount(transaction.accountNumber, store)?.accountName : "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: transaction.createdAtTime.transactionQueue || 0,
      lastModifiedAtTime: transaction.createdAtTime.unAllocatedQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      depositTransactionProcess: transaction.depositTransactionProcess,
      description: transaction.description,
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      proofOfPaymentAttachment: {
        url: transaction.proofOfPaymentAttachment.url,
        reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
      },
      note:transaction.note ??""
    }));

  const totalValue = transactionQueue.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const [selectedTransactions, setSelectedTransactions] = useState<ITransactionQueueData[]>([]);
  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);

  const handleTransactionCheckboxChange = (transaction: ITransactionQueueData) => {
    const isSelected = selectedTransactions.some(t => t.id === transaction.id);
    const newSelectedTransactions = isSelected
      ? selectedTransactions.filter(t => t.id !== transaction.id)
      : [...selectedTransactions, transaction];
    setSelectedTransactions(newSelectedTransactions);
  };

  const handleSelectAllTransactionChange = () => {
    const newSelectedTransactions = selectedTransactions.length === transactionQueue.length
      ? []
      : transactionQueue;
    setSelectedTransactions(newSelectedTransactions);
  };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
      rightControls={
        <>
          {
            
            <>
              <button className="btn btn-danger" disabled={loadingDelete || selectedTransactions.length === 0} onClick={deleteSelectedToTransactionQueue}>
                {loadingDelete ? <span data-uk-spinner={"ratio:.5"}></span> : `  Delete (${selectedTransactions.length}) Unllocated Transactions `}
              </button>
              </>
          }
        </>

      }
      />
    );
    
  }

  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < transactionQueue.length;
    }
  }, [selectedTransactions, transactionQueue.length]);

  const deleteSelectedToTransactionQueue = async () => {
    setLoadingDelete(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;
  
    for (const transaction of selectedTransactions) {
      const newDepositTransaction: IDepositTransaction = {
        id: transaction.id,
        transactionStatus: "Deleted",
        createdAtTime: {
          deletedQueue: Date.now(),
        },
        bankValueDate: transaction.bankValueDate || 0,
        bankTransactionDate: transaction.bankTransactionDate || 0,
        parentTransaction: transaction.parentTransaction || "",
        transactionAction: "Deleted",
        productCode: getMMAProduct(transaction.accountNumber, store),
        capturedBy: store.auth.meUID || "",
        transactionDate: transaction.transactionDate,
        valueDate: transaction.valueDate,
        amount: transaction.amount,
        accountNumber: transaction.accountNumber,
        entityNumber: transaction.entityNumber,
        sourceBank: transaction.sourceBank,
        bankReference: transaction.bankReference,
        sourceOfFundsAttachment: {
          url: transaction.sourceOfFundsAttachment.url,
          reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
        },
        proofOfPaymentAttachment: {
          url: transaction.proofOfPaymentAttachment.url,
          reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
        },
        sourceOfFunds: transaction.sourceOfFunds,
        depositNodeType: transaction.depositNodeType,
        statementIdentifier: transaction.statementIdentifier,
        transactionType: transaction.transactionType,
        allocationStatus: transaction.allocationStatus,
        depositTransactionProcess: transaction.depositTransactionProcess,
        description: transaction.description
      };
  
      try {
        await api.depositTransaction.update(newDepositTransaction);
        completedCount++;
        const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
        setTransactionsUpdated(completedCount);
        setProgressPercentage(Number(progress));
      } catch (error) {
        console.error("Failed to update transaction:", error);
        // Optionally, handle error display to user
      }
    }
  
    setLoadingDelete(false);
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
              checked={selectedTransactions.length === transactionQueue.length}
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
      flex: 1,
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
      field: "bankReference",
      headerName: "Bank Reference",
      flex: 1,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.bankReference || "-"}
          </div>
        )
      },
    },
    {
      field: "accountNumber",
      headerName: "Client Account",
      flex: 0,
      headerClassName: "grid",
      valueGetter: (params) => params.row.accountNumber || "-",
    },
    {
      field: "accountName",
      headerName: "Client Name",
      flex: 1,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.accountName || "-"}
          </div>
        )
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      headerClassName: "grid",
      editable: true,
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'right', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {numberFormat(params.row.amount) || "-"}
          </div>
        )
      },
    },
    {
      field: "product",
      headerName: "Product",
      flex: 0,
      headerClassName: "grid",
      valueGetter: (params) => params.row.productCode || "-",
    },
    {
      field: "creationMethod",
      headerName: "Creation Method",
      flex: 0,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>

            {params.row.sourceBank}
          </div>
        )
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
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
      field: "options",
      headerName: "Options",
      flex: 0,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <>
            <IconButton data-uk-tooltip="Edit Transaction" onClick={() => onAmendDepositTransaction(params.row, store, setShowOnAmendModal)}>
              <BorderColor />
            </IconButton>
            <TransactionType type={params.row.depositTransactionProcess} />
          </>

        )
      },
    },
  ];

  return (
    <div className="grid">
      <DataGrid
     sx={{
      height: 'auto',
      width: '100%',
      maxHeight: 500,
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
        loading={loading}
        slots={{
          toolbar: CustomToolbar
        }}
        rows={transactionQueue}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={70}
      />
      <h4 className='main-title-sm uk-text-right uk-margin-small'> Total: {currencyFormat(totalValue)}</h4>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL}>
        {showOnAmendModal && <DepositAmendModal isVisible={setShowOnAmendModal} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_TRANSACTION_MODAL}>
        {showOnAmendModal && <AmendSplitDepositModal isVisible={setShowOnAmendModal} />}
      </Modal>
    </div>
  )
})

export default UnallocatedTransactionsGrid;
