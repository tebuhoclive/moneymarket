
import { GridColDef, DataGrid, GridCsvExportMenuItem, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import { OpenInNew, Settings } from "@mui/icons-material";
import UpdateProductBaseRateModal from "../../../dialogs/products/daily-pricing/HikeProductRateModal";
import AllProductMoneyMarketAccountsModal from "../../../dialogs/products/product-money-market-accounts/AllProductMoneyMarketAccountsModal";
import Modal from "../../../../../shared/components/Modal";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import { IProduct } from "../../../../../shared/models/ProductModel";
import MODAL_NAMES from "../../../dialogs/ModalName";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FixProductBaseRateModal from "../../../dialogs/products/daily-pricing/FixProductBaseRateModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownLong } from "@fortawesome/free-solid-svg-icons";
import ProductRateChangeModal from "../../../dialogs/products/rate-change/other-products/ProductRateChangeModal";
import { useState } from "react";

interface IProps {
  data: IProduct[];
}

export const ActiveLiabilityProductsGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();

  const user = store.auth.meJson;

  //only show modals when toggled
  const [showRateChangeModal, setShowRateChangeModal] = useState(false);

  const onViewInstruments = async (productId: string) => {
    const selectedProduct = store.product.getItemById(productId);
    if (selectedProduct) {
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.ALL_PRODUCT_ACCOUNTS_MODAL);
    }
  };

  const onFixRate = async (productId: string) => {
    const selectedProduct = store.product.getItemById(productId);
    if (selectedProduct) {
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.FIX_PRODUCT_BASE_RATE_MODAL);
    }
  };

  const onChangeRate = (productId: string) => {
    const selectedProduct = store.product.getItemById(productId);
    if (selectedProduct) {
      setShowRateChangeModal(true);
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.PRODUCT_RATE_CHANGE_MODAL);
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
        <GridCsvExportMenuItem />
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef[] = [
    {
      field: "productCode",
      headerName: "Product Code",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "baseRate",
      headerName: "Base Rate",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "balance",
      headerName: "Balance (N$)",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return (store.product.getAllProductAccounts(params.row.id).reduce(
          (sum, balance) => sum + balance.asJson.balance,
          0));
      },
    },
    {
      field: "totalAccounts",
      headerName: "Total Active Accounts",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return store.product.getAllProductAccounts(params.row.id).length;
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
              data-uk-tooltip="Accounts"
              onClick={() => onViewInstruments(params.row.id)}
            >
              <OpenInNew />
            </IconButton>

            {/* <IconButton
              data-uk-tooltip="Hike Rate"
              onClick={() => onHikeRate(params.row.id)}
            >
              <FontAwesomeIcon icon={faUpLong} />
            </IconButton>
            <IconButton
              data-uk-tooltip="Drop Rate"
              onClick={() => onDropRate(params.row.id)}
            >
              <FontAwesomeIcon icon={faDownLong} />
            </IconButton> */}
            <IconButton
              data-uk-tooltip="ChangeRate"
              onClick={() => onChangeRate(params.row.id)}
            >
              <FontAwesomeIcon icon={faDownLong} />
            </IconButton>

            <IconButton
              data-uk-tooltip="Fix Rate"
              onClick={() => onFixRate(params.row.id)}
            >
              <Settings />
            </IconButton>
          </div>
        ),
      }
      : ({} as GridColDef),
  ];

  return (
    <>
      <div className="grid">
        <Box sx={{ height: 400 }}>
          <DataGrid
            loading={!data}
            slots={{
              toolbar: CustomToolbar,
            }}
            rows={data}
            columns={columns}
            getRowId={(row) => row.id} // Use the appropriate identifier property
            rowHeight={35}
          />
        </Box>
      </div>
      <div>

        <Modal modalId={MODAL_NAMES.BACK_OFFICE.ALL_PRODUCT_ACCOUNTS_MODAL}>
          <AllProductMoneyMarketAccountsModal />
        </Modal>

        <Modal modalId={MODAL_NAMES.BACK_OFFICE.UPDATE_PRODUCT_BASE_RATE_MODAL}>
          <UpdateProductBaseRateModal />
        </Modal>

        <Modal modalId={MODAL_NAMES.BACK_OFFICE.FIX_PRODUCT_BASE_RATE_MODAL}>
          <FixProductBaseRateModal />
        </Modal>

        {
          showRateChangeModal && store.product.selected &&
          <Modal modalId={MODAL_NAMES.ADMIN.PRODUCT_RATE_CHANGE_MODAL}>
            <ProductRateChangeModal product={store.product.selected} />
          </Modal>
        }
      </div>
    </>
  );
});
