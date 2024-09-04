import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { useState, useRef, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { currencyFormat } from "../../../../../../shared/functions/Directives";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import ProgressBar from "../../../../../../shared/components/progress/Progress";
import { IWithdrawalPaymentBatch } from "../../../../../../shared/models/batches/BatchesModel";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { IconButton } from "@mui/material";
import FileOpenIcon from '@mui/icons-material/FileOpen';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MODAL_NAMES from "../../../../dialogs/ModalName";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getTimeFromTimestamp } from "../../../../../../shared/functions/DateToTimestamp";
import Modal from "../../../../../../shared/components/Modal";
import { BatchDetailsModal } from "../batches/modal/BatchDetailsModal";
import { getUser } from "../../../../../../shared/functions/MyFunctions";

interface IProp {
  loading: boolean;
  data: IWithdrawalPaymentBatch[];
  transactionFilter: string;
}

const WithdrawalBatchedPaymentsGrid = observer((props: IProp) => {
  const { api, store } = useAppContext();
  const { data, loading, transactionFilter } = props;
  const [isVisibleProgressbar, setIsVisibleProgressbar] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [selectedBatchStatus, setSelectedBatchStatus] = useState("Pending");

  const [loadingDeleteBatch, setLoadingDeleteBatch] = useState(false);

  const onView = (batch: IWithdrawalPaymentBatch) => {
    store.batches.select(batch);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_BATCHED_TRANSACTIONS_MODAL);
  };

  const pendingBatches = data.filter(batches => batches.batchFileStatus === "Pending");
  const failedBatches = data.filter(batches => batches.batchFileStatus === "Failed");
  const processedBatches = data.filter(batches => batches.batchFileStatus === "Processed");

  const removeBatch = async (batch: IWithdrawalPaymentBatch) => {
    setLoadingDeleteBatch(true);
    try {
      await api.batches.delete(batch);
    } catch (error) {
    } finally {
      setLoadingDeleteBatch(false);
    }
  };

  const archiveCompletedBatches = () => {

  }

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          // <button
          //   className="btn btn-primary"
          //   disabled={selectedTransactions.length === 0 || loading}
          //   onClick={archiveCompletedBatches}
          // >
          //   {loading ? (
          //     <span data-uk-spinner={"ratio: .5"}></span>
          //   ) : (
          //     `Archive Completed (${selectedTransactions.length})`
          //   )}
          // </button>
          <>
            <button className={`btn ${selectedBatchStatus === "Pending" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedBatchStatus("Pending")}>
              Pending
            </button>

            <button className={`btn ${selectedBatchStatus === "Partial" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedBatchStatus("Partial")}>
              Partial
            </button>

            <button className={`btn ${selectedBatchStatus === "Processed" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedBatchStatus("Processed")}>
              Processed
            </button>

            <button className={`btn ${selectedBatchStatus === "Failed" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedBatchStatus("Failed")}>
              Failed
            </button>
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
            {selectedTransactions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />}
          </>
        }
      />
    );
  };

  const [selectedTransactions, setSelectedTransactions] = useState<IWithdrawalPaymentBatch[]>([]);

  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);

  const handleTransactionCheckboxChange = (batch: IWithdrawalPaymentBatch) => {
    const isSelected = selectedTransactions.some(t => t.id === batch.id);
    const newSelectedTransactions = isSelected
      ? selectedTransactions.filter(t => t.id !== batch.id)
      : [...selectedTransactions, batch];
    setSelectedTransactions(newSelectedTransactions);
  };

  const handleSelectAllTransactionChange = () => {
    const newSelectedTransactions = selectedTransactions.length === data.length
      ? []
      : data;
    setSelectedTransactions(newSelectedTransactions);
  };

  const totalValue = data.reduce(
    (sum, batch) => sum + batch.batchFileValue,
    0
  );


  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < data.length;
    }
  }, [selectedTransactions, data.length]);


  const columnsPending: GridColDef[] = [
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
              checked={selectedTransactions.length === data.length}
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
      field: "batchDate",
      headerName: "Batch Date",
      width: 200,
      valueGetter: (params) => `${dateFormat_YY_MM_DD(params.row.batchedDateTime)} ${getTimeFromTimestamp(params.row.batchedDateTime)}`,
    },
    {
      field: "lastModifiedDate",
      headerName: "Last Modified Date",
      width: 200,
      valueGetter: (params) => `${dateFormat_YY_MM_DD(params.row.lastModifiedDateTime)} ${getTimeFromTimestamp(params.row.lastModifiedDateTime)}`,
    },
    {
      field: "batchNumber",
      headerName: "Batch Number",
      width: 200,
      headerClassName: "grid",

    },
    {
      field: "paymentBatchFileType",
      headerName: "Batch Type",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.paymentBatchFileType
    },
    {
      field: "numberOfTransactions",
      headerName: "Number of Transactions",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.paymentBatchFileTransactions.length;
      },
    },
    {
      field: "totalValue",
      headerName: "Total Value",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => {
        return currencyFormat(params.row.batchFileValue);
      },
    },
    {
      field: "batchedBy",
      headerName: "Batched By",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => params.row.batchedBy,
      renderCell: (params) => {
        const user = getUser(params.row.batchedBy, store);
        return (
          <>
            {user}
          </>
        )
      }
    },
    {
      field: "Option",
      headerName: "Options",
      width: 200,

      headerClassName: "grid",
      renderCell: (params) => (
        <>
          {loading ? (
            <LoadingEllipsis />
          ) : (
            <>
              <IconButton
                data-uk-tooltip="Open File"
                onClick={() => onView(params.row)}
              >
                <FileOpenIcon />
              </IconButton>
              {params.row.paymentBatchFileTransactions.length === 0 && (
                <IconButton onClick={() => removeBatch(params.row)}>
                  <DeleteForeverIcon style={{ color: "red" }} />
                </IconButton>
              )}
            </>
          )}
        </>
      ),
    },
  ]

  const columnsProcessed: GridColDef[] = [
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
              checked={selectedTransactions.length === data.length}
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
      field: "batchDate",
      headerName: "Batch Date",
      width: 200,
      valueGetter: (params) => `${dateFormat_YY_MM_DD(params.row.batchedDateTime)} ${getTimeFromTimestamp(params.row.batchedDateTime)}`,
    },
    {
      field: "lastModifiedDate",
      headerName: "Last Modified Date",
      width: 200,
      valueGetter: (params) => `${dateFormat_YY_MM_DD(params.row.lastModifiedDateTime)} ${getTimeFromTimestamp(params.row.lastModifiedDateTime)}`,
    },
    {
      field: "batchNumber",
      headerName: "Batch Number",
      width: 200,
      headerClassName: "grid",

    },
    {
      field: "paymentBatchFileType",
      headerName: "Batch Type",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.paymentBatchFileType
    },
    {
      field: "numberOfTransactions",
      headerName: "Number of Transactions",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.paymentBatchFileTransactions.length;
      },
    },
    {
      field: "totalValue",
      headerName: "Total Value",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => {
        return currencyFormat(params.row.batchFileValue);
      },
    },
    {
      field: "batchedBy",
      headerName: "Batched By",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => params.row.batchedBy,
      renderCell: (params) => {
        const user = getUser(params.row.batchedBy, store);
        return (
          <>
            {user}
          </>
        )
      }
    },
    {
      field: "processedBy",
      headerName: "Batched By",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => params.row.processedBy,
      renderCell: (params) => {
        const user = getUser(params.row.processedBy, store);
        return (
          <>
            {user}
          </>
        )
      }
    },
    {
      field: "Option",
      headerName: "Options",
      width: 200,

      headerClassName: "grid",
      renderCell: (params) => (
        <>
          {loading ? (
            <LoadingEllipsis />
          ) : (
            <>
              <IconButton
                data-uk-tooltip="Open File"
                onClick={() => onView(params.row)}
              >
                <FileOpenIcon />
              </IconButton>
              {params.row.paymentBatchFileTransactions.length === 0 && (
                <IconButton onClick={() => removeBatch(params.row)}>
                  <DeleteForeverIcon style={{ color: "red" }} />
                </IconButton>
              )}
            </>
          )}
        </>
      ),
    },
  ]

  const columnsFailed: GridColDef[] = [
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
              checked={selectedTransactions.length === data.length}
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
      field: "batchDate",
      headerName: "Batch Date",
      width: 200,
      valueGetter: (params) => `${dateFormat_YY_MM_DD(params.row.batchedDateTime)} ${getTimeFromTimestamp(params.row.batchedDateTime)}`,
    },
    {
      field: "lastModifiedDate",
      headerName: "Last Modified Date",
      width: 200,
      valueGetter: (params) => `${dateFormat_YY_MM_DD(params.row.lastModifiedDateTime)} ${getTimeFromTimestamp(params.row.lastModifiedDateTime)}`,
    },
    {
      field: "batchNumber",
      headerName: "Batch Number",
      width: 200,
      headerClassName: "grid",

    },
    {
      field: "paymentBatchFileType",
      headerName: "Batch Type",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.paymentBatchFileType
    },
    {
      field: "numberOfTransactions",
      headerName: "Number of Transactions",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.paymentBatchFileTransactions.length;
      },
    },
    {
      field: "totalValue",
      headerName: "Total Value",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => {
        return currencyFormat(params.row.batchFileValue);
      },
    },
    {
      field: "batchedBy",
      headerName: "Batched By",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => params.row.batchedBy,
      renderCell: (params) => {
        const user = getUser(params.row.batchedBy, store);
        return (
          <>
            {user}
          </>
        )
      }
    },
    {
      field: "processedBy",
      headerName: "Batched By",
      width: 200,

      headerClassName: "grid",
      valueGetter: (params) => params.row.processedBy,
      renderCell: (params) => {
        const user = getUser(params.row.processedBy, store);
        return (
          <>
            {user}
          </>
        )
      }
    },
    {
      field: "Option",
      headerName: "Options",
      width: 200,

      headerClassName: "grid",
      renderCell: (params) => (
        <>
          {loading ? (
            <LoadingEllipsis />
          ) : (
            <>
              <IconButton
                data-uk-tooltip="Open File"
                onClick={() => onView(params.row)}
              >
                <FileOpenIcon />
              </IconButton>
              {params.row.paymentBatchFileTransactions.length === 0 && (
                <IconButton onClick={() => removeBatch(params.row)}>
                  <DeleteForeverIcon style={{ color: "red" }} />
                </IconButton>
              )}
            </>
          )}
        </>
      ),
    },
  ]

  return (
    <div className="grid">

      {
        selectedBatchStatus === "Pending" &&
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
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter,
          }}
          rows={pendingBatches}
          columns={columnsPending}
          getRowId={(row) => row.id}
          rowHeight={50}
        />
      }

      {
        selectedBatchStatus === "Failed" &&
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
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter,
          }}
          rows={failedBatches}
          columns={columnsFailed}
          getRowId={(row) => row.id}
          rowHeight={50}
        />
      }

      {
        selectedBatchStatus === "Processed" &&
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
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter,
          }}
          rows={processedBatches}
          columns={columnsProcessed}
          getRowId={(row) => row.id}
          rowHeight={50}
        />
      }

      {
        selectedBatchStatus === "Partial" &&
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
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter,
          }}
          rows={processedBatches}
          columns={columnsProcessed}
          getRowId={(row) => row.id}
          rowHeight={50}
        />
      }


      <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_BATCHED_TRANSACTIONS_MODAL}>
        <BatchDetailsModal />
      </Modal>
    </div>
  )
});

export default WithdrawalBatchedPaymentsGrid
