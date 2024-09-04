import { observer } from "mobx-react-lite";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Box, IconButton } from "@mui/material";
import { ISwitchTransaction, SwitchTransactionActions, SwitchTransactionStatus } from "../../../../../../shared/models/SwitchTransactionModel";

import { useAppContext } from "../../../../../../shared/functions/Context";
import { getClientNameSwitch, getEntityId } from "../../../../../../shared/functions/MyFunctions";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import { useState } from "react";
import swal from "sweetalert";
import { OpenInNew } from "@mui/icons-material";

interface IProps {
  data: ISwitchTransaction[];
}

const BackDatedDataGrid = observer(({ data }: IProps) => {
  const { api, store } = useAppContext();
  const totals = data.reduce((sum, deposit) => sum + deposit.amount, 0);

  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const addToSelected = (transactionId: string) => {
    if (transactionId) {
      setSelectedTransactions(prevTransactions => {
        if (prevTransactions.includes(transactionId)) {
          return prevTransactions.filter(id => id !== transactionId);
        }
        return [...prevTransactions, transactionId];
      });
    }
  }

  const selectAllTransactions = () => {
    setSelectedTransactions(data.map(transaction => transaction.id));
  }

  const deselectAllTransactions = () => {
    setSelectedTransactions([]);
  }

  const markSelectedDeposits = (switchStatus: SwitchTransactionStatus, switchAction: SwitchTransactionActions, text: string) => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", text],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        selectedTransactions.forEach(async (transaction: string) => {
          const selectedTransaction = store.switch.getItemById(transaction);

          if (selectedTransaction) {
            store.switch.select(selectedTransaction.asJson);
            const _transaction = store.switch.selected;
            if (_transaction) {
              const _newTransaction: ISwitchTransaction = {
                ..._transaction,
                switchStatus: switchStatus,
                switchAction: switchAction
              }
              try {
                await api.switch.updateAndCreateAuditTrail(_transaction, _newTransaction);
              } catch (error) {

              }
            }
          }
        });
        swal({
          icon: "success",
          text: `Selected transaction(s) have been ${text}ed`
        });
        setSelectedTransactions([]);
      } else {
        swal({
          icon: "error",
          text: "Operation cancelled!",
        });
      }
    });
  }
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }
  const columns: GridColDef[] = [
    {
      field: "switchDate",
      headerName: "Switch Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return dateFormat_YY_MM_DD_NEW(params.row.switchDate);
      },
    },
    {
      field: "EntityID",
      headerName: "Entity ID",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const entityId = getEntityId(store, params.row.fromAccount);
        return entityId;
      },
    },
    {
      field: "entityName",
      headerName: "Entity Name",
      flex: 2,
      headerClassName: "grid",
      valueGetter: (params) => {
        const clientName = getClientNameSwitch(params.row, store);
        return clientName;
      },
    },
    {
      field: "fromAccount",
      headerName: "From Account",
      width: 200,
      headerClassName: "grid",
    },

    {
      field: "toAccount",
      headerName: "To Account",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return (params.row.amount);
      },
    }, {
      field: "Options",
      headerName: "Options",
      width: 200,
      renderCell: (params) => (
        <div>
          <IconButton
            data-uk-tooltip="View Transaction Details"
          >
            <OpenInNew />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="grid">
      <Toolbar
        leftControls={
          <>
            <h4 className="main-title-sm">Back Dated Withdrawal Transaction Queue</h4>
          </>
        }
      />
      < hr />
      <Toolbar
        leftControls={
          <div className="uk-margin-bottom">
            {selectedTransactions.length > 0 && (
              <>
                <button
                  className="btn btn-danger"
                >
                  Approve Transaction Back Dating({selectedTransactions.length})
                </button>
              </>
            )}
          </div>
        }
      />
      <Toolbar
        rightControls={
          <h4 className="main-title-sm">Total Amount: {(totals)}</h4>
        }
        leftControls={
          <>
            <div className="uk-margin-bottom">
              {
                selectedTransactions.length !== data.length &&
                <button className="btn btn-primary" onClick={selectAllTransactions}>Select All</button>
              }
              {
                selectedTransactions.length > 0 &&
                <button className="btn btn-primary" onClick={deselectAllTransactions}>Deselect {selectedTransactions.length === 1 ? 'Selected' : "All"} ({selectedTransactions.length})</button>
              }
            </div>

          </>
        }
      />

      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={50}
        />
      </Box>
    </div>
  );
});

export default BackDatedDataGrid;
