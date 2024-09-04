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
import { BorderColor, Visibility } from '@mui/icons-material';
import swal from "sweetalert";
import { observer } from 'mobx-react-lite';
import { padNumberStringWithZero } from '../../../../../../shared/functions/StringFunctions';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';
import Toolbar from '../../../../shared/components/toolbar/Toolbar';
import { ACTIVE_ENV } from '../../../../CloudEnv';
import { getEntityId, getMMAProduct, onAmendDepositTransaction, onViewTransaction } from '../../../../../../shared/functions/MyFunctions';
import DepositTransactionQueueView from '../../../../dialogs/transactions/client-deposit-allocation/view-transaction-modal/DepositTransactionQueueView';
import { TransactionType } from '../../../../shared/components/transaction-process-flag/TransactionProcess';
import { AmendSplitDepositModal } from '../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/AmendSplitDepositModal';
import { ViewSplitDepositModal } from '../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/ViewSplitDepositModal';
import ProgressBar from '../../../../../../shared/components/progress/Progress';
import DataGridToolbar from '../../../../shared/components/toolbar/DataGridToolbar';
import { SplitDepositDuplicates } from '../../../../dialogs/transactions/client-deposit-allocation/duplicate-flag-outs/DuplicateTransactionsFlag';

interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const DepositTransactionsQueueGrid = observer((props: IProps) => {
  const { store, api } = useAppContext();
  const { data, loading } = props;
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const [splitTransactions, setSplitTransactions] = useState<IDepositTransaction[]>([]);

  const currentUser = store.auth.meUID || "";
  const [updateLoading, setUpdateLoading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [transactionsUpdated, setTransactionsUpdated] = useState(0);
  const [loadingNonDeposit, setLoadingNonDeposit] = useState(false);
  const [loadingUnallocated, setLoadingUnallocated] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const deposits = store.depositTransaction.all.map((t) => { return t.asJson });
  interface ITransactionQueueData {
    index: string,
    id: string;
    bankTransactionDateView?: string;
    bankTransactionDate?: number;
    bankValueDateView?: string;
    emailAddress?: string;
    bankValueDate?: number;
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
    note?: string

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
      emailAddress: transaction.emailAddress ?? "",
      bankValueDate: transaction.bankValueDate,
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
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      depositTransactionProcess: transaction.depositTransactionProcess,
      description: transaction.description,
      note: transaction.note || "",
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      proofOfPaymentAttachment: {
        url: transaction.proofOfPaymentAttachment.url,
        reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
      },
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
              <button className="btn btn-danger" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated|| selectedTransactions.length === 0} onClick={moveToNonDeposit}>
                {loadingNonDeposit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit(${selectedTransactions.length})  to Non Deposit`}
              </button>
              <button className="btn btn-danger" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated|| selectedTransactions.length === 0} onClick={moveToUnAllocated}>
                {loadingUnallocated ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit (${selectedTransactions.length})  to Unallocated`}
              </button>
              <button className="btn btn-primary" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated|| selectedTransactions.length === 0} onClick={submitForFirstLevelApproval}>
                {loadingSubmit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit (${selectedTransactions.length})  for Approval`}
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


  const markSelectedAsNonDeposit = async (selectedTransactions: ITransactionQueueData[]) => {

    const transactions: IDepositTransaction[] = selectedTransactions.map((transaction, index: number) => ({
      id: transaction.id,
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDate: transaction.bankValueDate,
      valueDate: transaction.valueDate,
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: {
        transactionQueue: transaction.createdAtTime || 0
      },
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
      }
    }));

    let completedCount = 0;
    const url = `${ACTIVE_ENV.url}onMarkAsClieNonDepositHandler`;

    const processTransaction = async (transaction: IDepositTransaction) => {

      const oldTransaction = store.depositTransaction.getItemById(
        transaction.id
      );

      if (oldTransaction) {

        const _transactionToUpdate: IDepositTransaction = {
          ...oldTransaction.asJson,
          transactionStatus: "Non-Deposit",
          createdAtTime: {
            transactionQueue: oldTransaction.asJson.createdAtTime.transactionQueue,
            nonDepositsQueue: Date.now()
          },
        };

        const payload = {
          oldTransaction: oldTransaction.asJson,
          user: store.user.me?.asJson.uid
        }

        try {
          setUpdateLoading(true);
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const progress = ((completedCount / selectedTransactions.length) * 100).toFixed(2); // Calculate progress percentage
            setTransactionsUpdated(completedCount);
            setProgressPercentage(Number(progress));
            completedCount++;
          } else {
            console.log("Failed", response.statusText);
          }
          setUpdateLoading(false);
        } catch (error) {
          return false;
        }
      }
    };

    transactions.forEach(transaction => {
      processTransaction(transaction);
    });
  }

  // client side bulk operation

  const moveToNonDeposit = async () => {
    setLoadingNonDeposit(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;

    for (const transaction of selectedTransactions) {
      const newDepositTransaction: IDepositTransaction = {
        id: transaction.id,
        transactionStatus: "Non-Deposit",
        createdAtTime: {
          nonDepositsQueue: Date.now(),
        },
        transactionAction: "Marked as a Non Deposit",
        bankValueDate: transaction.bankValueDate || 0,
        bankTransactionDate: transaction.bankTransactionDate || 0,
        parentTransaction: transaction.parentTransaction || "",
        transactionDate: transaction.transactionDate,
        valueDate: transaction.valueDate,
        amount: transaction.amount,
        accountNumber: transaction.accountNumber,
        productCode: transaction.productCode,
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
    }

    setLoadingNonDeposit(false);
  };

  const moveToUnAllocated = async () => {
    setLoadingUnallocated(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;

    for (const transaction of selectedTransactions) {
      const newDepositTransaction: IDepositTransaction = {
        id: transaction.id,
        transactionStatus: "Unallocated",
        transactionAction: "Marked as Un Allocated",
        createdAtTime: {
          nonDepositsQueue: Date.now(),
        },
        bankValueDate: transaction.bankValueDate || 0,
        bankTransactionDate: transaction.bankTransactionDate || 0,
        parentTransaction: transaction.parentTransaction || "",
        transactionDate: transaction.transactionDate,
        valueDate: transaction.valueDate,
        amount: transaction.amount,
        accountNumber: transaction.accountNumber,
        productCode: transaction.productCode,
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
    }

    setLoadingUnallocated(false);
  };


  const canSubmitTransaction = (transaction: ITransactionQueueData) => {
    if (
      !transaction.amount ||
      (!transaction.sourceOfFundsAttachment.url && !transaction.sourceOfFundsAttachment.reasonForNotAttaching) ||
      (!transaction.proofOfPaymentAttachment.url && !transaction.proofOfPaymentAttachment.reasonForNotAttaching) ||
      !transaction.accountNumber ||
      !transaction.sourceBank ||
      !transaction.sourceOfFunds
    ) {
      return false;
    }
    return true;
  };

  // const submitForFirstLevelApproval = async () => {
  //   setLoadingSubmit(true);
  //   let completedCount = 0;
  //   let totalTransactions = selectedTransactions.length;

  //   for (const transaction of selectedTransactions) {
  //     if (transaction.accountNumber !== "") {
  //       const newDepositTransaction: IDepositTransaction = {
  //         id: transaction.id,
  //         transactionStatus: "First Level",
  //         createdAtTime: {
  //           firstLevelQueue: Date.now(),
  //         },
  //         bankValueDate: transaction.bankValueDate || 0,
  //         bankTransactionDate: transaction.bankTransactionDate || 0,
  //         parentTransaction: transaction.parentTransaction || "",
  //         transactionAction: "Submitted for First Level Approval",
  //         productCode: getMMAProduct(transaction.accountNumber, store),
  //         capturedBy: store.auth.meUID || "",
  //         transactionDate: transaction.transactionDate,
  //         valueDate: transaction.valueDate,
  //         amount: transaction.amount,
  //         accountNumber: transaction.accountNumber,
  //         entityNumber: transaction.entityNumber,
  //         sourceBank: transaction.sourceBank,
  //         bankReference: transaction.bankReference,
  //         sourceOfFundsAttachment: {
  //           url: transaction.sourceOfFundsAttachment.url,
  //           reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
  //         },
  //         proofOfPaymentAttachment: {
  //           url: transaction.proofOfPaymentAttachment.url,
  //           reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
  //         },
  //         sourceOfFunds: transaction.sourceOfFunds,
  //         depositNodeType: transaction.depositNodeType,
  //         statementIdentifier: transaction.statementIdentifier,
  //         transactionType: transaction.transactionType,
  //         allocationStatus: transaction.allocationStatus,
  //         depositTransactionProcess: transaction.depositTransactionProcess,
  //         description: transaction.description,
  //       };

  //       try {
  //         await api.depositTransaction.update(newDepositTransaction);
  //         completedCount++;
  //         const progress = (completedCount / totalTransactions) * 100; // Calculate progress percentage
  //         setTransactionsUpdated(completedCount);
  //         setProgressPercentage(progress);
  //       } catch (error) {
  //         // Handle error if needed
  //       }
  //     } 
  //     if (transaction.transactionType==="Split") {



  //       const newDepositTransaction: IDepositTransaction = {
  //         id: transaction.id,
  //         transactionStatus: "First Level",
  //         createdAtTime: {
  //           firstLevelQueue: Date.now(),
  //         },
  //         bankValueDate: transaction.bankValueDate || 0,
  //         bankTransactionDate: transaction.bankTransactionDate || 0,
  //         parentTransaction: transaction.parentTransaction || "",
  //         transactionAction: "Submitted for First Level Approval",
  //         productCode: getMMAProduct(transaction.accountNumber, store),
  //         capturedBy: store.auth.meUID || "",
  //         transactionDate: transaction.transactionDate,
  //         valueDate: transaction.valueDate,
  //         amount: transaction.amount,
  //         accountNumber: transaction.accountNumber,
  //         entityNumber: transaction.entityNumber,
  //         sourceBank: transaction.sourceBank,
  //         bankReference: transaction.bankReference,
  //         sourceOfFundsAttachment: {
  //           url: transaction.sourceOfFundsAttachment.url,
  //           reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
  //         },
  //         proofOfPaymentAttachment: {
  //           url: transaction.proofOfPaymentAttachment.url,
  //           reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
  //         },
  //         sourceOfFunds: transaction.sourceOfFunds,
  //         depositNodeType: transaction.depositNodeType,
  //         statementIdentifier: transaction.statementIdentifier,
  //         transactionType: transaction.transactionType,
  //         allocationStatus: transaction.allocationStatus,
  //         depositTransactionProcess: transaction.depositTransactionProcess,
  //         description: transaction.description,
  //       };

  //       try {
  //         await api.depositTransaction.update(newDepositTransaction);
  //         completedCount++;
  //         const progress = (completedCount / totalTransactions) * 100; // Calculate progress percentage
  //         setTransactionsUpdated(completedCount);
  //         setProgressPercentage(progress);
  //       } catch (error) {
  //         // Handle error if needed
  //       }
  //     }else {
  //       swal({
  //         icon: "error",
  //         text: "Transaction is not allocated"
  //       });
  //     }
  //   }

  //   setLoadingSubmit(false);
  // };

  // client side bulk operations
  const submitForFirstLevelApproval = async () => {
    setLoadingSubmit(true);
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;
  console.log("slected transaction",selectedTransactions);
  
    for (const transaction of selectedTransactions) {
      if (transaction.id !== "") {
        if (transaction.transactionType === "Split") {
          console.log("its in split ");
          
          // Handle Split Transaction Type
          const mainTransaction: IDepositTransaction = {
            ...transaction,
            amount: transaction.amount,
            depositNodeType: "Parent",
            bankTransactionDate: 0,
            bankValueDate: 0,
            allocationStatus: "Manually Allocated",
            transactionDate: Date.now(),
            capturedBy: store.auth.meUID || "",
            sourceBank: transaction.sourceBank,
            bankReference: "Deposit",
            valueDate: transaction.valueDate || Date.now(),
            productCode: getMMAProduct(transaction.accountNumber, store),
            sourceOfFunds: transaction.sourceOfFunds,
            sourceOfFundsAttachment: transaction.sourceOfFundsAttachment,
            proofOfPaymentAttachment: transaction.proofOfPaymentAttachment,
            transactionType: "Split",
            transactionStatus: "First Level",
            createdAtTime: {
              firstLevelQueue: Date.now(),
            },
            transactionAction: "Split",
            depositTransactionProcess: transaction.depositTransactionProcess,
          };
  
          try {
            await api.depositTransaction.update(mainTransaction);
            const savedMainTransactionId = mainTransaction.id;
            if (!savedMainTransactionId) {
              throw new Error("Failed to save main transaction or retrieve its ID");
            }
  
            const parentTransactionId = savedMainTransactionId;
            if (SplitDepositDuplicates(deposits, parentTransactionId, splitTransactions)) {
              setLoadingSubmit(false);
              swal({
                icon: "warning",
                text: "Duplicate transactions found. Please check your transactions and try again.",
              });
              return;
            }
  
            for (const splitTransaction of splitTransactions) {
              const _transaction: IDepositTransaction = {
                ...mainTransaction,
                id: "",
                entityNumber: getEntityId(store, splitTransaction.accountNumber),
                accountNumber: splitTransaction.accountNumber,
                amount: splitTransaction.amount,
                parentTransaction: parentTransactionId,
                sourceBank: mainTransaction.sourceBank,
                bankReference: splitTransaction.bankReference ?? "Deposit",
                productCode: getMMAProduct(splitTransaction.accountNumber, store),
                depositNodeType: "Child",
                emailAddress: splitTransaction.emailAddress,
              };
  
              await api.depositTransaction.create(_transaction);
              completedCount++;
              const progress = ((completedCount / totalTransactions) * 100).toFixed(2);
              setTransactionsUpdated(completedCount);
              // setProgressPercentage(progress);
            }
  
            await api.depositTransaction.update(mainTransaction);
            swal({
              icon: "success",
              text: "Transaction submitted for First Level Approval",
            });
          } catch (error) {
            // Handle error if needed
            swal({
              icon: "error",
              text: "An error occurred while processing split transactions.",
            });
          }
        } else {
          // Handle Standard Transaction Type
          const newDepositTransaction: IDepositTransaction = {
            id: transaction.id,
            transactionStatus: "First Level",
            createdAtTime: {
              firstLevelQueue: Date.now(),
            },
            bankValueDate: transaction.bankValueDate || 0,
            bankTransactionDate: transaction.bankTransactionDate || 0,
            parentTransaction: transaction.parentTransaction || "",
            transactionAction: "Submitted for First Level Approval",
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
          };
  
          try {
            await api.depositTransaction.update(newDepositTransaction);
            completedCount++;
            const progress = (completedCount / totalTransactions) * 100;
            setTransactionsUpdated(completedCount);
            setProgressPercentage(progress);
          } catch (error) {
            // Handle error if needed
            swal({
              icon: "error",
              text: "An error occurred while processing standard transactions.",
            });
          }
        }
      } else {
        swal({
          icon: "error",
          text: "Transaction is not allocated",
        });
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
      valueGetter: (params) => params.row.index,
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
        );
      }
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
                <button className="btn btn-danger" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={moveToNonDeposit}>
                  {loadingNonDeposit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit selected ${selectedTransactions.length}  to Non Deposit`}
                </button>
                <button className="btn btn-danger" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={moveToUnAllocated}>
                  {loadingUnallocated ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit selected ${selectedTransactions.length}  to Unallocated`}
                </button>
                <button className="btn btn-primary" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={submitForFirstLevelApproval}>
                  {loadingSubmit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit selected ${selectedTransactions.length}  for Approval`}
                </button>
              </>
            }
           </>
        }
      />
       {
        selectedTransactions.length > 0 &&
        <ProgressBar progress={progressPercentage} />
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
        loading={loading || updateLoading || loadingNonDeposit || loadingUnallocated || loadingSubmit}
        slots={{
          toolbar: CustomToolbar
        }}
        rows={transactionQueue}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={70}
      />
      <h4 className='main-title-sm uk-text-right uk-margin-small'> Total: {currencyFormat(totalValue)}</h4>

      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL
        }>
        {showOnAmendModal &&
          <DepositAmendModal isVisible={setShowOnAmendModal} />
        }
      </Modal>
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_TRANSACTION_MODAL
        }>
        {showOnAmendModal &&
          <AmendSplitDepositModal isVisible={setShowOnAmendModal} />
        }
      </Modal>
      <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL}
      >
        {showOnSubmitModal && <DepositTransactionQueueView setShowOnAmendModal={setShowOnAmendModal} />}
      </Modal>

      <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}
      >
        {showOnSubmitModal && <ViewSplitDepositModal setShowReturnModal={setShowReturnModal} />}
      </Modal>

    </div>
  )
})

export default DepositTransactionsQueueGrid;
