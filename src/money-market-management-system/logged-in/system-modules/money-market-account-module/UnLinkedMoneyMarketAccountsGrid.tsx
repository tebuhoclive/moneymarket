import { IconButton, Box } from "@mui/material";
// import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { IMoneyMarketAccount } from "../../../../shared/models/money-market-account/MoneyMarketAccount";
import { useAppContext } from "../../../../shared/functions/Context";
import { Link, OpenInNew } from "@mui/icons-material";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import { getClientName, getProductName } from "./smallFunctions";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import swal from "sweetalert";


interface IProps {
  data: IMoneyMarketAccount[];
}

export const UnLinkedMoneyMarketAccountsGrid = observer(({ data }: IProps) => {
  const { api, store } = useAppContext();
  const onNavigate = useNavigate();
  const user = store.auth.meJson;

  const onView = (accountId: string) => {
    onNavigate(`/c/accounts/${accountId}`);
  };

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];
  const products = store.product.all.map((p) => {
    return p.asJson;
  });
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  };

  const hasMoneyMarketAccountManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Money Market Account Management" &&
      feature.update === true
  );

  const onLinkAccountToParent = async (accountId: string, oldCPNumber: string) => {
    const account = store.mma.all.find(account => account.asJson.id === accountId);
    const entityId = getParentEntity(oldCPNumber);
    const entityName = getClientName(clients, entityId);
    if (account && entityId) {
      swal({
        title: "Are you sure?",
        icon: "warning",
        text: `You are about to link account: ${account.asJson.accountNumber} ( ${account.asJson.accountName} ) to ${entityId} (${entityName})`,
        buttons: ["Cancel", "Link"],
        dangerMode: true,
      }).then(async (edit) => {
        if (edit) {

          const _account: IMoneyMarketAccount = {
            ...account.asJson,
            parentEntity: entityId
          }
          try {
            await api.mma.update(_account);
            swal({
              icon: "success",
              title: "Account Linked"
            })
          } catch (error) {
            
          }
          
        }
      });
    }
  }

  const getParentEntity = (entityOldCPNumber: string) => {
    const client = clients.find(
      (client) => client.asJson.oldCPNumber === entityOldCPNumber
    );
    if (client) {
      return client.asJson.entityId;
    }
    return "";
  };

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
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "clientName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        if (params.row.parentEntity !== "") {
          return getClientName(clients, params.row.parentEntity)
        } else {
          return (
            <>
              {
                getParentEntity(params.row.oldCPNumber) !== "" ? (
                  <span
                    style={{
                      padding: "4px",
                      border: "2px solid green",
                      borderRadius: "4px",
                    }}

                  >
                    Link to {getParentEntity(params.row.oldCPNumber)} - {getClientName(clients, getParentEntity(params.row.oldCPNumber))}
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
                    No Profile
                  </span>
                )
              }
            </>
          )
        }
      },
    },
    {
      field: "accountType",
      headerName: "Account Type",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return getProductName(products, params.row.accountType);
      },
    },
    {
      field: "balance",
      headerName: "Balance (N$)",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return (params.row.balance);
      },
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
            {
              getParentEntity(params.row.oldCPNumber) !== "" &&
              <IconButton
                data-uk-tooltip="Link"
                onClick={() => onLinkAccountToParent(params.row.id, params.row.oldCPNumber)}
              >
                <Link />
              </IconButton>
            }
          </div>
        ),
      }
      : ({} as GridColDef),
  ];

  return (
    <div className="grid">
      <Toolbar
        leftControls={
          <h4 className="main-title-sm">Active Money Market Accounts</h4>
        }
      />
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
  );
});
