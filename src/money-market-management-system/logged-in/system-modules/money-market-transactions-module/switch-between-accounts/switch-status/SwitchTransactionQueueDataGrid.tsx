import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import {
  ISwitchTransaction,
  ISwitchTransactionQueueData,
} from "../../../../../../shared/models/SwitchTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { BorderColor, Visibility } from '@mui/icons-material';
import { getTimeFromTimestamp } from "../../../../../../shared/functions/DateToTimestamp";
import { currencyFormat, numberCurrencyFormat } from "../../../../../../shared/functions/Directives";
import { padNumberStringWithZero } from "../../../../../../shared/functions/StringFunctions";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import ProgressBar from "../../../../../../shared/components/progress/Progress";
import { getClientFromName, getClientToName, onAmendSwitchTransaction, onViewSwitchTransaction } from "../../../../../../shared/functions/MyFunctions";
import { TransactionType } from "../../../../shared/components/transaction-process-flag/TransactionProcess";
import Modal from "../../../../../../shared/components/Modal";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import ViewSwitchModal from "../../../../dialogs/transactions/switch/ViewSwitchModal";
import AmendEntitySwitchModal from "../../../../dialogs/transactions/switch/AmendEntitySwitchModal";
import AmendEntitySwitchModalCloseOut from "../../../../dialogs/transactions/switch/AmendEntitySwitchModalCloseOut";
import ViewEntitySwitchModal from "../../../../dialogs/transactions/switch/ViewSwitchModal";
import ViewEntitySwitchCloseOutModal from "../../../../dialogs/transactions/switch/ViewSwitchCloseOut";
import swal from "sweetalert";

interface IProps {
  data: ISwitchTransaction[];
  transactionFilter: string;
}

const SwitchTransactionQueueDataGrid = observer(({ data, transactionFilter }: IProps) => {
  const { api, store } = useAppContext();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const transactionQueue: ISwitchTransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.transactionQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.transactionQueue || 0).getTime();
      return timeB - timeA; // Sorts in descending order
    }).map((transaction, index: number) => ({
      index: padNumberStringWithZero(`${index + 1}`, 2),
      id: transaction.id,
      transactionDate: transaction.transactionDate,
      valueDate: transaction.valueDate,
      amount: transaction.amount,
      fromAccount: transaction.fromAccount,
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      toAccount: transaction.toAccount,
      fromProductCode: transaction.fromProductCode,
      toProductCode: transaction.toProductCode,
      fromEntityNumber: transaction.fromEntityNumber,
      toEntityNumber: transaction.toEntityNumber,
      reference: transaction.reference,
      createdAtTime: transaction.createdAtTime.transactionQueue || 0,
      transactionType: transaction.transactionType,
      switchStatus: transaction.switchStatus,
      switchAction: transaction.switchAction,
      switchTransactionProcess: transaction.switchTransactionProcess,
      description: transaction.description,
      returnNote: transaction.returnNote ?? "",
      reasonForDeleting: transaction.reasonForDeleting ?? ""
    }));
  const filteredData = transactionQueue.filter((d) => {
    const trimmedFilter = transactionFilter.trim();
    if (trimmedFilter === "All") {
      return true;
    } else if (trimmedFilter === "Manual Switch") {
      return d.transactionType === "Manual Switch";
    } else if (trimmedFilter === "Manual Switch Close Out") {
      return d.transactionType === "Manual Switch Close Out";
    }
    return false; // Return false for any filter that doesn't match the conditions above
  });
  const totalValue = filteredData.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const [selectedTransactions, setSelectedTransactions] = useState<ISwitchTransactionQueueData[]>([]);
  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);
  const handleTransactionCheckboxChange = (transaction: ISwitchTransactionQueueData) => {
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
  const submitForFirstLevelApproval = async () => {
    let completedCount = 0;
    let totalTransactions = selectedTransactions.length;
    let showDeletionMessage = false;

    setLoadingSubmit(true);

    for (const transaction of selectedTransactions) {
      if (transaction.reasonForDeleting !== "" && transaction.transactionType === "Manual Switch") {
        showDeletionMessage = true;
      } else if (transaction.reasonForDeleting !== "" && transaction.transactionType === "Manual Switch Close Out") {
        showDeletionMessage = true;
      } else if (transaction.transactionType === "Manual Switch") {
        const newTransaction: ISwitchTransaction = {
          ...transaction,
          id: transaction.id,
          transactionDate: transaction.transactionDate,
          valueDate: transaction.valueDate,
          fromAccount: transaction.fromAccount,
          toAccount: transaction.toAccount,
          toEntityNumber: transaction.toEntityNumber,
          fromEntityNumber: transaction.fromEntityNumber,
          amount: transaction.amount,
          switchStatus: "First Level",
          switchAction: "Submitted for 1st Approval",
          switchTransactionProcess: transaction.switchTransactionProcess,
          description: transaction.description,
          reference: transaction.reference,
          createdAt: transaction.transactionDate,
          fromProductCode: transaction.fromProductCode,
          toProductCode: transaction.toProductCode,
          switchedBy: store.auth.meUID || "",
          transactionType: transaction.transactionType,
          createdAtTime: {
            firstLevelQueue: Date.now()
          },
          clientInstruction: {
            url: transaction.clientInstruction.url,
            reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
          },
        };
        try {
          await api.switch.update(newTransaction);
          completedCount++;
          const progress = (completedCount / totalTransactions) * 100; // Calculate progress percentage
          setProgressPercentage(progress);
        } catch (error) {
          console.log("Error bulk submitting for approval");
        }
      } else if (transaction.transactionType === "Manual Switch Close Out") {
        const newTransaction: ISwitchTransaction = {
          ...transaction,
          id: transaction.id,
          transactionDate: transaction.transactionDate,
          valueDate: transaction.valueDate,
          fromAccount: transaction.fromAccount,
          toAccount: transaction.toAccount,
          toEntityNumber: transaction.toEntityNumber,
          fromEntityNumber: transaction.fromEntityNumber,
          amount: transaction.amount,
          switchStatus: "First Level",
          switchAction: "Submitted for 1st Approval",
          switchTransactionProcess: transaction.switchTransactionProcess,
          description: transaction.description,
          reference: transaction.reference,
          createdAt: transaction.transactionDate,
          fromProductCode: transaction.fromProductCode,
          toProductCode: transaction.toProductCode,
          switchedBy: store.auth.meUID || "",
          transactionType: "Manual Switch Close Out",
          createdAtTime: {
            firstLevelQueue: Date.now()
          },
          clientInstruction: {
            url: transaction.clientInstruction.url,
            reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
          },
        };
        try {
          await api.switch.update(newTransaction);
          completedCount++;
          const progress = (completedCount / totalTransactions) * 100; // Calculate progress percentage
          setProgressPercentage(progress);
        } catch (error) {
          console.log("Error bulk submitting for approval");
        }
      }
    }

    setLoadingSubmit(false);

    if (showDeletionMessage) {
      swal({
        icon: "warning",
        text: "Reason for deleted transactions needed",
      });
    }
  };
  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <button
            className="btn btn-primary"
            disabled={selectedTransactions.length === 0 || loadingSubmit}
            onClick={submitForFirstLevelApproval}
          >
            {loadingSubmit ? (
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
            {selectedTransactions.length > 0 && <ProgressBar progress={progressPercentage} />}
          </>
        }
      />
    );
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
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <span className='uk-width-4-5'>
              {`${dateFormat_YY_MM_DD(params.row.createdAtTime)} ${getTimeFromTimestamp(params.row.createdAtTime)}`}
            </span>
          </div>
        )
      },
    },
    //from client name, from account (accounnunmber and product concatenated), to clientName to client account (accountnumber and product concatenated)
    {
      field: "clientFrom",
      headerName: "From Client",
      width: 200,
      headerClassName: "grid", // Apply the same class for consistency
      valueGetter: (params) => {
        return getClientFromName(params.row, store);
      },
    },
    {
      field: "clientTo",
      headerName: "To Client",
      width: 200,
      headerClassName: "grid", // Apply the same class for consistency
      valueGetter: (params) => {
        return getClientToName(params.row, store);
      },
    },
    {
      field: "fromAccount",
      headerName: "From Account",
      flex: 0,
      headerClassName: "grid", // Apply the same class for consistency
      renderCell: (params) => {
        return (<div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {params.row.fromAccount}  ({params.row.fromProductCode})
        </div>)
      },

    },
    {
      field: "toAccount",
      headerName: "To Account",
      flex: 0,
      headerClassName: "grid", // Apply the same class for consistency
      renderCell: (params) => {
        return (<div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {params.row.toAccount}  ({params.row.toProductCode})
        </div>)
      },

    },
    {
      field: "reference",
      headerName: "Reference",
      width: 200,
      headerClassName: "grid", // Apply the same class for consistency
      valueGetter: (params) => {
        return params.row.reference;
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      headerClassName: "grid", // Apply the same class for consistency
      renderCell: (params) => {
        return (<div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {params.row.transactionType} ({params.row.switchStatus})
        </div>)
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const formattedAmount = numberCurrencyFormat(params.row.amount);
        return formattedAmount;
      },
    },
    {
      field: "Options",
      headerName: "Options",
      width: 200,
      renderCell: (params) => {
        return (
          <div>
            <>
              <IconButton data-uk-tooltip="Edit Transaction" onClick={() => onAmendSwitchTransaction(params.row, store, setShowOnAmendModal)}>
                <BorderColor />
              </IconButton>
              <IconButton data-uk-tooltip="View" onClick={() => onViewSwitchTransaction(params.row, store, setShowOnSubmitModal)}>
                <Visibility />
              </IconButton>
              <TransactionType type={params.row.switchTransactionProcess} />
            </>
          </div>
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
          maxHeight: 480,
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
        // loading={loading || updateLoading || loadingNonDeposit || loadingUnallocated || loadingSubmit}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter,
        }}
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={50}
      />
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_AMEND_MODAL}>
        {showOnAmendModal && <AmendEntitySwitchModal setVisible={setShowOnAmendModal} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_AMEND_MODAL_CLOSE_OUT}>
        {showOnAmendModal && <AmendEntitySwitchModalCloseOut setVisible={setShowOnAmendModal} />}
      </Modal>
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL
        }>
        {showOnSubmitModal &&
          <ViewEntitySwitchModal setVisible={setShowOnSubmitModal} />
        }
      </Modal>
      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_CLOSE_OUT_TRANSACTION_MODAL
        }>
        {showOnSubmitModal &&
          <ViewEntitySwitchCloseOutModal setVisible={setShowOnSubmitModal} />
        }
      </Modal>
    </div>
  );
});

export default SwitchTransactionQueueDataGrid;
