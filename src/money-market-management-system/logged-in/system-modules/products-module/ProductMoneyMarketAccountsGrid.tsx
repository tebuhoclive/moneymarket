import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import { useNavigate } from "react-router-dom";

import MODAL_NAMES from "../../dialogs/ModalName";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import { IMoneyMarketAccount } from "../../../../shared/models/money-market-account/MoneyMarketAccount";
import AppStore from "../../../../shared/stores/AppStore";
import { OpenInNew } from "@mui/icons-material";
import { roundOff, currencyFormat } from '../../../../shared/functions/Directives';

interface IProps {
  data: IMoneyMarketAccount[];
}

export const ProductMoneyMarketAccountsGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const onNavigate = useNavigate();
  const user = store.auth.meJson;

  const onView = (accountId: string) => {
    onNavigate(`/c/accounts/${accountId}`);
  };

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const getClientName = (parentEntityId: string) => {
    const client = clients.find(
      (client) => client.asJson.entityId === parentEntityId
    );
    if (client) {
      return client.asJson.entityDisplayName;
    }

    return "";
  };

  const onEdit = (accountId: string, store: AppStore) => {
    const selectedAccount = store.mma.getItemById(accountId);

    if (selectedAccount) {
      store.mma.select(selectedAccount.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.MONEY_MARKET_ACCOUNT_MODAL);
    }
  };

  const hasMoneyMarketAccountManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Money Market Account Management" &&
      feature.update === true
  );

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "accountNumber",
      headerName: "Account #",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "accountName",
      headerName: "Account Name",
      flex: 2,
      headerClassName: "grid",
    },
    {
      field: "parentEntity",
      headerName: "Entity ID",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "clientName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return getClientName(params.row.parentEntity);
      },
    },
    {
      field: "baseRate",
      headerName: "Base Rate",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "feeRate",
      headerName: "Fee",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "clientRate",
      headerName: "Client Rate",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "monthTotalInterest",
      headerName: "Total Distribution",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return roundOff(params.row.monthTotalInterest || 0);
      },
    },
    {
      field: "balance",
      headerName: "Balance (N$)",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return (currencyFormat(roundOff(params.row.balance)));
      },
    },
    {
      field: "status",
      headerName: "Account Status",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <div>
          {params.row.status === "Active" ? (
            <span
              style={{
                padding: "4px",
                border: "2px solid green",
                borderRadius: "4px",
              }}
            >
              Account Active
            </span>
          ) : (
            <span
              style={{
                padding: "4px",
                border: "2px solid red",
                borderRadius: "4px",
                color: "white",
              }}
            >
              Account Closed
            </span>
          )}
        </div>
      ),
    },
    hasMoneyMarketAccountManagementPermission
      ? {
        field: "Options",
        headerName: "Options",
 width:200,
        headerClassName: "grid",
        renderCell: (params) => (
          <div>
            <IconButton
              data-uk-tooltip="View"
              onClick={() => onView(params.row.id)}
            >
              <OpenInNew />
            </IconButton>
          </div>
        ),
      }
      : ({} as GridColDef),
  ];

  return (
    <div className="grid">
      <Box sx={{ height: 500 }}>
        <DataGrid
          loading={!data}
          slots={{
            toolbar: CustomToolbar,
          }}
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={40}
        />
      </Box>
    </div>
  );
});
