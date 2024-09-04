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
import { getAccount } from '../../../../../../shared/functions/transactions/BankStatementUpload';
import { Visibility } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import GetArchivedTransactionsButton from '../../../../shared/components/archive-button-component/ArchiveButton';
import Toolbar from '../../../../shared/components/toolbar/Toolbar';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';
import { padNumberStringWithZero } from '../../../../../../shared/functions/StringFunctions';
import {  getMMAProduct, getUser, onViewTransaction } from '../../../../../../shared/functions/MyFunctions';
import CompletedTransactionQueueView from '../../../../dialogs/transactions/client-deposit-allocation/view-transaction-modal/CompletedTransactionQueueView';
import { TransactionType } from '../../../../shared/components/transaction-process-flag/TransactionProcess';
import { ViewSplitDepositModal } from '../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/ViewSplitDepositModal';
import { ExportAsExcel } from 'react-export-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import DataGridToolbar from '../../../../shared/components/toolbar/DataGridToolbar';
import { ACTIVE_ENV } from '../../../../CloudEnv';
interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const CompletedDepositsGrid = observer((props: IProps) => {
  const { api, store } = useAppContext();
  const { data, loading, transactionFilter } = props;

  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const completedDepositQueueData: ITransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.completedQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.completedQueue || 0).getTime();
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
      createdAtTime: transaction.createdAtTime.completedQueue || 0,
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
      secondLevelApprover: transaction.secondLevelApprover,
      note:transaction.note ??""
    }));

  const totalValue = completedDepositQueueData.reduce(
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
    const newSelectedTransactions = selectedTransactions.length === completedDepositQueueData.length
      ? []
      : completedDepositQueueData;
    setSelectedTransactions(newSelectedTransactions);
  };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
      rightControls={
        <> 

        {<>
          {/* <ExportAsExcel
            fileName="Completed Deposits"
            name="Completed Deposits"
            data={formattedData}
            headers={[
              "Transaction Date",
              "Value Date",
              "Account Number",
              "Bank Reference",
              "Product Code",
              "Amount",
              "Description",
              "Captured By",
              "First Level Approver",
              "Second Level Approver"
            ]}
          >
              {renderExcel}
            </ExportAsExcel> */}
       <button disabled={updateLoading || selectedTransactions.length === 0} className="btn btn-danger" onClick={archiveCompletedTransactions}>
            Archive Selected({selectedTransactions.length}) transactions
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
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < completedDepositQueueData.length;
    }
  }, [selectedTransactions, completedDepositQueueData.length]);

  // async function archiveCompletedTransactions() {
  //   const data = {
  //     transactions: selectedTransactions
  //   };
    

  //   const url = `${ACTIVE_ENV.url}archiveDepositTransactions`;

  //   try {
  //     setUpdateLoading(true);
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (response.ok) {
  //       console.log("success:", response);
  //       await api.depositTransaction.getAll();
  //       store.depositTransaction.load();
  //       setUpdateLoading(false);
  //     } else {
  //       const errorText = await response.text();
  //       console.error("Error updating account:", errorText);
  //       throw new Error(errorText);
  //     }
  //   } catch (error) {
  //     console.error("Error in archiveDeletedTransaction:", error);
  //     throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
  //   }
  // }
  const archiveCompletedTransactions = async () => {
    console.log("Clicked");
    
    // setLoadingSubmit(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;
    console.log("Clicked",selectedTransactions);
    for (const transaction of selectedTransactions) {
      if (transaction.allocationStatus === "Manually Allocated") {
        const newDepositTransaction: IDepositTransaction = {...transaction,

          transactionStatus:"Archived",
          createdAtTime: {
            archivedQueue: Date.now(),
          },
          transactionAction:"Archived",
          archivedBy: store.auth.meUID || "",
       
        };
console.log("Manual Archived transaction",newDepositTransaction);

        try {
          await api.depositTransaction.update(newDepositTransaction);
          completedCount++;
          const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
          setTransactionsUpdated(completedCount);
          setProgressPercentage(Number(progress));
        } catch (error) {
          // Handle error if needed
        }
      } 
      if (transaction.allocationStatus==="Auto-Allocated") {
        const newDepositTransaction: IDepositTransaction = {...transaction,

          transactionStatus:"Archived",
          createdAtTime: {
            archivedQueue: Date.now(),
          },emailAddress:"",
          parentTransaction:"",
          transactionAction:"Archived",
          archivedBy: store.auth.meUID || "",
       
        };

        console.log("Manual Archived transaction",newDepositTransaction);
        try {
          await api.depositTransaction.update(newDepositTransaction);
          completedCount++;
          const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
          setTransactionsUpdated(completedCount);
          setProgressPercentage(Number(progress));
        } catch (error) {
          // Handle error if needed
        }
      }else {
        // Handle case where transaction.accountNumber is empty if needed
      }
    }

    // setLoadingSubmit(false);
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
              checked={selectedTransactions.length === completedDepositQueueData.length}
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
      field: "firstLevelApprover",
      headerName: "First-Level Approved By",
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
      field: "secondLevelApprover",
      headerName: "Second-Level Approved By",
      flex: 0,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.secondLevelApprover, store)
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

  const renderExcel = ({ onClick }: { onClick: () => void }) => {
    return (
      <button className="btn btn-primary uk-margin" onClick={onClick}>
        <FontAwesomeIcon
          icon={faFileExcel}
          size="lg"
          className="icon uk-margin-small-right"
        />
        Export Excel
      </button>
    )
  }

  // needs the transaction date filter
  const formattedData = completedDepositQueueData.map((d) => {

    const $transactionDate = dateFormat_YY_MM_DD(d.transactionDate); // Assuming there's a date field in the original object
    const $date = dateFormat_YY_MM_DD(d.valueDate); // Assuming there's a date field in the original object

    const $accountNumber = d.accountNumber;
    const $bankReference = d.bankReference;
    const $productCode = d.productCode;
    const $amount = d.amount;
    const $description = d.description;
    const $capturedBy = getUser(d.capturedBy || "", store);
    const $firstLevelApprover = getUser(d.firstLevelApprover || "", store);
    const $secondLevelApprover = getUser(d.secondLevelApprover || "", store);

    return {

      transactionDate: $transactionDate,
      date: $date,

      accountNumber: $accountNumber,
      bankReference: $bankReference,
      productCode: $productCode,
      amount: $amount,
      description: $description,
      capturedBy: $capturedBy,
      firstLevelApprover: $firstLevelApprover,
      secondLevelApprover: $secondLevelApprover
    };
  });


  return (
    <div className="grid">
       <Toolbar
        rightControls={
          <ExportAsExcel
            fileName="Completed Deposits"
            name="Completed Deposits"
            data={formattedData}
            headers={[
              "Transaction Date",
              "Value Date",
              "Account Number",
              "Bank Reference",
              "Product Code",
              "Amount",
              "Description",
              "Captured By",
              "First Level Approver",
              "Second Level Approver"
            ]}
          >
            {renderExcel}
          </ExportAsExcel>

        }
      />
      {
        selectedTransactions.length > 0 && <hr className='uk-margin-small' />
      } 
      <DataGrid
        sx={{
          height: 'auto',
          width: 'auto',
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
        rows={completedDepositQueueData}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={70}
      />
      {
        selectedTransactions.length > 0 &&
        <div className="uk-width-1-2 uk-margin uk-text-left">
          <progress className="uk-progress" value={progressPercentage} max={100}></progress>
          <label className="uk-form-label">
            {`Progress: ${progressPercentage}% (${transactionsUpdated} / ${selectedTransactions.length} transactions processed)`}{" "}
          </label>
        </div>
      }
      <h4 className='main-title-sm uk-text-right uk-margin-small'>Total: {currencyFormat(totalValue)}</h4>
      
      <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL}
      >

        {showOnSubmitModal && <CompletedTransactionQueueView />}
      </Modal>
      <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}
      >
        {showOnSubmitModal && <ViewSplitDepositModal setShowReturnModal={setShowOnSubmitModal} />}
      </Modal>
    </div>
  )
})

export default CompletedDepositsGrid;






