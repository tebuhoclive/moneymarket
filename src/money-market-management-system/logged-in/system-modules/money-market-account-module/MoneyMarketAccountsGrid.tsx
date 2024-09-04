import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid, GridToolbarContainer, GridToolbarQuickFilter, GridCsvExportMenuItem } from "@mui/x-data-grid";

import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { IMoneyMarketAccount } from "../../../../shared/models/money-market-account/MoneyMarketAccount";
import { useAppContext } from "../../../../shared/functions/Context";
import { OpenInNew, PriceChange } from "@mui/icons-material";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import { onEdit } from "./smallFunctions";
import ActiveAccountTabs from "./ActiveAccountTabs";
import { useState } from "react";
import { currencyFormat } from "../../../../shared/functions/Directives";



interface IProps {
  data: IMoneyMarketAccount[];
}

export const MoneyMarketAccountsGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const onNavigate = useNavigate();
  const user = store.auth.meJson;

  const onView = (accountId: string) => {
    onNavigate(`/c/accounts/${accountId}`);
  };

  const [selectedTab, setSelectedTab] = useState("all-accounts-tab");

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
        <GridCsvExportMenuItem />
      </GridToolbarContainer>
    );
  };

  const hasMoneyMarketAccountManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Money Market Account Management" &&
      feature.update === true
  );


  const columns: GridColDef[] = [
    {
      field: "accountNumber",
      headerName: "Account #",
      width: 200,
    },
    // {
    //   field: "clientName",
    //   headerName: "Client Name",
    //   flex: 2,
    //   renderCell: (params) => {
    //     return params.row.parentEntity !== "" ? getClientName(clients, params.row.parentEntity) : <span
    //       style={{
    //         padding: "4px",
    //         border: "2px solid red",
    //         borderRadius: "4px",
    //         color: 'red'
    //       }}
    //     >
    //       Not Linked
    //     </span>
    //   },
    // },
    {
      field: "clientName",
      headerName: "Client Name",
      width: 200,
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.accountName}
          </div>
        )
      },
    },
    {
      field: "accountType",
      headerName: "Product Type",
      width: 200,
      valueGetter: (params) => {
        // return getProductName(products, params.row.accountType);
        return params.row.accountType;
      },
    },
    {
      field: "baseRate",
      headerName: "Base Rate",
      width: 200,
    },
    // {
    //   field: "feeRate",
    //   headerName: "Fee",
    //   width: 200,
    // },
    {
      field: "clientRate",
      headerName: "Client Rate",
      width: 200,
      valueGetter: (params) => {
        return params.row.clientRate.toFixed(2);
      },
    },
    {
      field: "clientFee",
      headerName: "Client Fee",
      width: 200,
      valueGetter: (params) => {
        return (params.row.baseRate > 0 && (params.row.baseRate - params.row.clientRate).toFixed(2)) || "-";
      },
    },
    {
      field: "balance",
      headerName: "Balance (N$)",
      width: 200,
      valueGetter: (params) => {
        return currencyFormat(params.row.balance);
      },
    },
    {
      field: "cession",
      headerName: "Cession Balance (N$)",
      width: 200,
      valueGetter: (params) => {
        return currencyFormat(params.row.cession);
      },
    },
    {
      field: "availableBalance",
      headerName: "Available Balance (N$)",
      width: 200,
      valueGetter: (params) => {
        return currencyFormat(params.row.balance - params.row.cession);
      },
    },
    {
      field: "clientFia",
      headerName: "Client FIA Status",
      width: 200,
      valueGetter: (params) => {
        return params.row.clientComplianceStatus;
      },
      renderCell: (params) => (
        <div>
          {params.row.clientComplianceStatus === "Non-compliant" ? (
            <span
              style={{
                padding: "4px",
                border: "2px solid red",
                borderRadius: "4px",
              }}
            >
              Non-Compliant
            </span>
          ) : (
            <span
              style={{
                padding: "4px",
                border: "2px solid green",
                borderRadius: "4px",
                color: "white",
              }}
            >
              Compliant
            </span>
          )}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Account Status",
      width: 200,
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
              Active Account
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
              Closed Account
            </span>
          )}
        </div>
      ),
    },
    hasMoneyMarketAccountManagementPermission
      ? {
        field: "Options",
        headerName: "Options",
        width: 200,

        renderCell: (params) => (
          <div>
            <IconButton
              data-uk-tooltip="Update Rate"
              onClick={() => onEdit(params.row.id, store)}
            >
              <PriceChange />
            </IconButton>

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
    <div className="">
      <Toolbar
        rightControls={
          <>
            {
              selectedTab === "all-accounts-tabs" &&
              <button className="btn btn-primary">Export Report</button>
            }
          </>
        }
      />
      <div className="uk-margin-bottom">
        <ActiveAccountTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </div>
      <div className="grid">
        <Box sx={{ height: 500 }}>
          <DataGrid
            loading={!data.length}
            rows={data}
            slots={{
              toolbar: CustomToolbar,
            }}
            columns={columns}
            getRowId={(row) => row.id} // Use the appropriate identifier property
            rowHeight={50}
          />
        </Box>
      </div>
    </div>
  );
});
