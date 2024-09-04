import { IconButton } from '@mui/material';
import swal from "sweetalert";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

import { IDepositTransaction } from '../../../../../../shared/models/deposit-transaction/DepositTransactionModel';
import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../../shared/utils/utils';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { currencyFormat, numberFormat } from '../../../../../../shared/functions/Directives';
import MODAL_NAMES from '../../../../dialogs/ModalName';
import Modal from '../../../../../../shared/components/Modal';
import { useEffect, useRef, useState } from 'react';

import { DepositAmendModal } from '../../../../dialogs/transactions/client-deposit-allocation/new-modals/Deposits/amend-modal/DepositAmendModal';
import { getAccount } from '../../../../../../shared/functions/transactions/BankStatementUpload';
import { Visibility } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import Toolbar from '../../../../shared/components/toolbar/Toolbar';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';
import { padNumberStringWithZero } from '../../../../../../shared/functions/StringFunctions';
import { getMMAProduct, getUser, onViewTransaction } from '../../../../../../shared/functions/MyFunctions';
import ReturnForAmendmentModal from '../../../../dialogs/transactions/client-deposit-allocation/new-modals/Deposits/return-for-amendment/ReturnDepositForAmendmentModal';
import SecondLevelTransactionQueueView from '../../../../dialogs/transactions/client-deposit-allocation/view-transaction-modal/SecondLevelTransactionQueueView';
import { TransactionType } from '../../../../shared/components/transaction-process-flag/TransactionProcess';
import { completeTransaction } from '../../../../dialogs/transactions/client-deposit-allocation/view-transaction-modal/complete-transaction-process/ProcessTransactions';
import { ViewSplitDepositModal } from '../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/ViewSplitDepositModal';
import ProgressBar from '../../../../../../shared/components/progress/Progress';
import DataGridToolbar from '../../../../shared/components/toolbar/DataGridToolbar';
interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const DepositSecondLevelApprovalGrid = observer((props: IProps) => {
  const { api, store } = useAppContext();
  const { data, loading, transactionFilter } = props;
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [transactionsUpdated, setTransactionsUpdated] = useState(0);

  interface ITransactionQueueData {
    index: string,
    id: string;
    bankTransactionDateView?: string;
    bankTransactionDate?: number;
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
    allocationStatus: string;
    transactionStatus: string;
    depositTransactionProcess: string;
    description: string
    emailAddress?: string;
    capturedBy?: string;
    firstLevelApprover?: string;
    secondLevelApprover?: string;
    sourceOfFundsAttachment: {
      url?: string, // if a source of fund description is provided ensure that an attachment is required
      reasonForNotAttaching: string
    }
    proofOfPaymentAttachment: {
      url?: string,
      reasonForNotAttaching: string
    }
  }

  const secondLevelQueue: ITransactionQueueData[] = data
    .filter(transaction => dateFormat_YY_MM_DD(transaction.valueDate) <= dateFormat_YY_MM_DD(Date.now()))
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.secondLevelQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.secondLevelQueue || 0).getTime();
      return timeB - timeA; // Sorts in descending order
    })
    .map((transaction, index: number) => ({
      index: padNumberStringWithZero(`${index + 1}`, 2),
      id: transaction.id,
      bankTransactionDateView: transaction.bankTransactionDate ? dateFormat_YY_MM_DD_NEW(transaction.bankTransactionDate) : "",
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDateView: transaction.bankValueDate ? dateFormat_YY_MM_DD_NEW(transaction.bankValueDate) : "",
      bankValueDate: transaction.bankValueDate,
      valueDateView: dateFormat_YY_MM_DD(transaction.valueDate),
      valueDate: transaction.valueDate,
      transactionDateView: dateFormat_YY_MM_DD(transaction.transactionDate),
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountNumber ? getAccount(transaction.accountNumber, store)?.accountName : "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      emailAddress: transaction.emailAddress,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: transaction.createdAtTime.secondLevelQueue || 0,
      lastModifiedAtTime: transaction.createdAtTime.nonDepositsQueue || 0,
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
      firstLevelApprover: transaction.firstLevelApprover,
      capturedBy: transaction.capturedBy,
      secondLevelApprover: store.auth.meUID || "",
      note:transaction.note ??""
    }));

  const totalValue = secondLevelQueue.reduce(
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
    const newSelectedTransactions = selectedTransactions.length === secondLevelQueue.length
      ? []
      : secondLevelQueue;
    setSelectedTransactions(newSelectedTransactions);
  };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
      rightControls={
            <button className="btn btn-primary" disabled={loadingComplete || selectedTransactions.length === 0} onClick={completeSelectedToTransactionQueue}>
              {loadingComplete ? <span data-uk-spinner={"ratio:.5"}></span> : `Complete Selected(${selectedTransactions.length})`}
            </button>
          }


          
        />
    );
  };

  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < secondLevelQueue.length;
    }
  }, [selectedTransactions, secondLevelQueue.length]);

  const completeSelectedToTransactionQueue = async () => {
    setLoadingComplete(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;

    for (const transaction of selectedTransactions) {
      if (transaction.accountNumber !== "") {
        const newDepositTransaction: IDepositTransaction = {
          id: transaction.id,
          transactionStatus: "Completed",
          createdAtTime: {
            completedQueue: Date.now(),
          },
          bankValueDate: transaction.bankValueDate || 0,
          bankTransactionDate: transaction.bankTransactionDate || 0,
          parentTransaction: transaction.parentTransaction || "",
          transactionAction: "Approved Second Level",
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
          description: transaction.description,
          secondLevelApprover: store.auth.meUID || ""
        };

        try {
          await completeTransaction(newDepositTransaction, store, api, setLoadingComplete);

          completedCount++;
          const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
          setTransactionsUpdated(completedCount);
          setProgressPercentage(Number(progress));
        } catch (error) {

        }
      } else if (transaction.transactionType === "Split") {

        const splitMainTransaction: IDepositTransaction = {
          id: transaction.id,
          transactionStatus: "Completed",
          createdAtTime: {
            completedQueue: Date.now(),
          },
          bankValueDate: transaction.bankValueDate || 0,
          bankTransactionDate: transaction.bankTransactionDate || 0,
          parentTransaction: transaction.parentTransaction || "",
          transactionAction: "Approved Second Level",
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
          description: transaction.description,
          secondLevelApprover: store.auth.meUID || ""
        };

        const splitTransactions = store.depositTransaction.getChildTransactions(transaction.id);

        if (splitTransactions) {
          for (const splitTransaction of splitTransactions) {
            splitTransaction.capturedBy = transaction.capturedBy;
            splitTransaction.firstLevelApprover = transaction.firstLevelApprover;
            splitTransaction.secondLevelApprover = transaction.secondLevelApprover;
            splitTransaction.transactionStatus = "Completed";
            splitTransaction.createdAtTime = {
              completedQueue: Date.now()
            }
            try {
              await completeTransaction(splitTransaction, store, api, setLoadingComplete);
            } catch (error) {

            }
          }
          try {
            await api.depositTransaction.updateAndCreateAuditTrail(splitMainTransaction, splitMainTransaction);
          } catch (error) {
          }
        }
      } else {
        swal({
          icon: "error",
          title: "Missing Account Number",
          text: "Transaction does not have an account number."
        });
      }
    }

    setLoadingComplete(false);
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
              checked={selectedTransactions.length === secondLevelQueue.length}
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
      field: "lastUpdate",
      headerName: "Last Update",
      flex: 1,
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
      field: "bankReference",
      headerName: "Bank Reference",
      flex: 1,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>

            {params.row.bankReference}
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
      field: "email",
      headerName: "Client Email",
      flex: 1,
      headerClassName: "grid",
      valueGetter: (params) => params.row.emailAddress || "-"
    },
    {
      field: "product",
      headerName: "Product",
      flex: 0,
      headerClassName: "grid",
      valueGetter: (params) => params.row.productCode || "-",
    },
    {
      field: "firstLevelApprover",
      headerName: "Approved By",
      flex: 0,
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
      field: "amount",
      headerName: "Amount",
      flex: 1,
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
      field: "options",
      headerName: "Action",
      flex: 0,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <>
            <IconButton data-uk-tooltip="View" onClick={() => onViewTransaction(params.row, store, setShowOnSubmitModal)}>
              <Visibility />
            </IconButton>
            <TransactionType type={params.row.depositTransactionProcess} />
          </>
        )
      },
    },
  ];

  return (
    <div className="grid">
      {/* <Toolbar
      //   rightControls={
      //     <>
      //       {
      //         selectedTransactions.length > 0 &&
      //         <button className="btn btn-primary" disabled={loadingComplete} onClick={completeSelectedToTransactionQueue}>
      //           {loadingComplete ? <span data-uk-spinner={"ratio:.5"}></span> : `Complete Selected(${selectedTransactions.length})`}
      //         </button>
      //       }
      //     </>
      //   }
      />
      {
        selectedTransactions.length > 0 && <hr className='uk-margin-small' />
      } */}
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
        loading={loading || loadingComplete}
        slots={{
          toolbar: CustomToolbar
        }}
        rows={secondLevelQueue}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={70}
      />
      {selectedTransactions.length > 0 && <ProgressBar progress={progressPercentage} />}
      <h4 className='main-title-sm uk-text-right uk-margin-small'>Total: {currencyFormat(totalValue)}</h4>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL}>
        {showOnAmendModal && <DepositAmendModal isVisible={setShowOnAmendModal} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL}      >
        {showOnSubmitModal && <SecondLevelTransactionQueueView />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}>
        {showOnSubmitModal && <ViewSplitDepositModal setShowReturnModal={setShowOnSubmitModal} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL}>
        <ReturnForAmendmentModal />
      </Modal>
    </div>
  )
})

export default DepositSecondLevelApprovalGrid;
