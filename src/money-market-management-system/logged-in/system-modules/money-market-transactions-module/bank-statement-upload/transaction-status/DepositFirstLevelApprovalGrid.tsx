import { IconButton } from '@mui/material';
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
import FirstLevelTransactionQueueView from '../../../../dialogs/transactions/client-deposit-allocation/view-transaction-modal/FirstLevelTransactionQueueView';
import { TransactionType } from '../../../../shared/components/transaction-process-flag/TransactionProcess';
import { ViewSplitDepositModal } from '../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/ViewSplitDepositModal';
import ProgressBar from '../../../../../../shared/components/progress/Progress';
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const DepositFirstLevelApprovalGrid = observer((props: IProps) => {
  const { api, store } = useAppContext();
  const { data, loading, transactionFilter } = props;

  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);

  const currentUser = store.auth.meUID || "";
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [transactionsUpdated, setTransactionsUpdated] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  interface ITransactionQueueData {
    index: string,
    id: string;
    bankTransactionDateView?: string;
    bankTransactionDate?: number;
    bankValueDateView?: string;
    bankValueDate?: number;
    emailAddress?: string;
    valueDateView: string,
    valueDate: number,
    transactionDateView: string;
    transactionDate: number;
    amount: number;
    accountNumber: string;
    productCode: string;
    entityNumber: string;
    sourceBank: string;
    bankReference: string;
    sourceOfFunds: string;
    parentTransaction?: string;
    depositNodeType: "Parent" | "Child";
    statementIdentifier: string;
    createdAtTime: number;
    transactionType: string;
    allocationStatus: string;
    transactionStatus: string;
    depositTransactionProcess: string;
    description: string;
    sourceOfFundsAttachment: {
      url?: string, // if a source of fund description is provided ensure that an attachment is required
      reasonForNotAttaching: string
    }
    proofOfPaymentAttachment: {
      url?: string,
      reasonForNotAttaching: string
    }
    note?: string,
    capturedBy?: string,
  }

  const nonDepositQueue: ITransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.firstLevelQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.firstLevelQueue || 0).getTime();
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
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: transaction.createdAtTime.firstLevelQueue || 0,
      lastModifiedAtTime: transaction.createdAtTime.nonDepositsQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      depositTransactionProcess: transaction.depositTransactionProcess,
      description: transaction.description,
      emailAddress: transaction.emailAddress,
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      proofOfPaymentAttachment: {
        url: transaction.proofOfPaymentAttachment.url,
        reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
      },
      capturedBy: transaction.capturedBy,
      firstLevelApproval: store.auth.meUID || "",
      note:transaction.note ??""
    }));

  const totalValue = nonDepositQueue.reduce(
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
    const newSelectedTransactions = selectedTransactions.length === nonDepositQueue.length
      ? []
      : nonDepositQueue;
    setSelectedTransactions(newSelectedTransactions);
  };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
      rightControls={
         <button disabled={loadingSubmit|| selectedTransactions.length === 0} className="btn btn-primary"
          onClick={approveSelectedToTransactionQueue}>
                {/* Submit For Second Level Approval({selectedTransactions.length}) */}
                {loadingSubmit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit (${selectedTransactions.length}) For Second Level Approval  `}
              </button>
          }
        />

    );
  };

  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < nonDepositQueue.length;
    }
  }, [selectedTransactions, nonDepositQueue.length]);
  
  // const approveSelectedToTransactionQueue = (selectedTransactions: ITransactionQueueData[]) => {
  //   const transactions: IDepositTransaction[] = selectedTransactions.map((transaction, index: number) => ({
  //     id: transaction.id,
  //     bankTransactionDate: transaction.bankTransactionDate,
  //     bankValueDate: transaction.bankValueDate,
  //     valueDate: transaction.valueDate,
  //     transactionDate: transaction.transactionDate,
  //     amount: transaction.amount,
  //     accountNumber: transaction.accountNumber,
  //     accountName: transaction.accountNumber ? getAccount(transaction.accountNumber, store)?.accountName : "",
  //     productCode: transaction.productCode,
  //     entityNumber: transaction.entityNumber,
  //     sourceBank: transaction.sourceBank,
  //     bankReference: transaction.bankReference,
  //     sourceOfFunds: transaction.sourceOfFunds,
  //     parentTransaction: transaction.parentTransaction,
  //     depositNodeType: transaction.depositNodeType,
  //     statementIdentifier: transaction.statementIdentifier,
  //     createdAtTime: {
  //       firstLevelQueue: transaction.createdAtTime,
  //     },
  //     emailAddress: transaction.emailAddress,
  //     transactionType: transaction.transactionType,
  //     allocationStatus: transaction.allocationStatus,
  //     transactionStatus: transaction.transactionStatus,
  //     depositTransactionProcess: transaction.depositTransactionProcess,
  //     description: transaction.description,
  //     //files
  //     sourceOfFundsAttachment: {
  //       url: "",
  //       reasonForNotAttaching: ""
  //     },
  //     proofOfPaymentAttachment: {
  //       url: "",
  //       reasonForNotAttaching: ""
  //     },
  //     capturedBy: transaction.capturedBy

  //   }));
  //   onApproveDepositFirstLevel(transactions, api, store);
  // }
  const approveSelectedToTransactionQueue = async () => {
    setLoadingSubmit(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;

    for (const transaction of selectedTransactions) {
      if (transaction.accountNumber !== "") {
        const newDepositTransaction: IDepositTransaction = {
          id: transaction.id,
          transactionStatus: "Second Level",
          createdAtTime: {
            secondLevelQueue: Date.now(),
          },
          bankValueDate: transaction.bankValueDate || 0,
          bankTransactionDate: transaction.bankTransactionDate || 0,
          parentTransaction: transaction.parentTransaction || "",
          transactionAction: "Approved First Level",
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
            reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching,
          },
          proofOfPaymentAttachment: {
            url: transaction.proofOfPaymentAttachment.url,
            reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching,
          },
          sourceOfFunds: transaction.sourceOfFunds,
          depositNodeType: transaction.depositNodeType,
          statementIdentifier: transaction.statementIdentifier,
          transactionType: transaction.transactionType,
          allocationStatus: transaction.allocationStatus,
          depositTransactionProcess: transaction.depositTransactionProcess,
          description: transaction.description,
          firstLevelApprover: store.auth.meUID || "",
        };

        try {
          await api.depositTransaction.update(newDepositTransaction);
          completedCount++;
          const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
          setTransactionsUpdated(completedCount);
          setProgressPercentage(Number(progress));
        } catch (error) {
          // Handle error if needed
        }
      } else {
        // Handle case where transaction.accountNumber is empty if needed
      }
    }

    setLoadingSubmit(false);
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
              checked={selectedTransactions.length === nonDepositQueue.length}
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
            <span>
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
      field: "capturedBy",
      headerName: "Captured By",
      flex: 0,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.capturedBy, store)
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
            {/* <IconButton data-uk-tooltip="Return For Amendment" onClick={() => onReturn(params.row)}>
              <AssignmentReturnIcon />
            </IconButton> */}
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
        rightControls={
          <>
            {
              selectedTransactions.length > 0 &&
              <>
                <button disabled={loadingSubmit} className="btn btn-primary" onClick={approveSelectedToTransactionQueue}>
                  {/* Submit For Second Level Approval({selectedTransactions.length}) */}
                  {/* {loadingSubmit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit For Second Level Approval${selectedTransactions.length} `}
                </button>
              </>
            }
          </>
        } */}
      
      {/* {
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
        loading={loading || loadingSubmit}
        slots={{
          toolbar: CustomToolbar
        }}
        rows={nonDepositQueue}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={70}
      />
      {
        selectedTransactions.length > 0 &&
        <ProgressBar progress={progressPercentage} />
      }

      <h4 className='main-title-sm uk-text-right uk-margin-small'>Total: {currencyFormat(totalValue)}</h4>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL}>
        {
          showOnAmendModal && <DepositAmendModal isVisible={setShowOnAmendModal} />
        }
      </Modal>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL}>
        {showOnSubmitModal && <FirstLevelTransactionQueueView />}
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

export default DepositFirstLevelApprovalGrid;



