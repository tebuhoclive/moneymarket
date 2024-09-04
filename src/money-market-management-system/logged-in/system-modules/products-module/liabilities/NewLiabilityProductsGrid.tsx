import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import { OpenInNew } from "@mui/icons-material";
import UpdateProductBaseRateModal from "../../../dialogs/products/daily-pricing/HikeProductRateModal";
import AllProductMoneyMarketAccountsModal from "../../../dialogs/products/product-money-market-accounts/AllProductMoneyMarketAccountsModal";
import Modal from "../../../../../shared/components/Modal";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import { IProduct } from "../../../../../shared/models/ProductModel";
import MODAL_NAMES from "../../../dialogs/ModalName";
import VerifyProductModal from "../../../dialogs/products/VerifyProductModal";

interface IProps {
  data: IProduct[];
}

export const NewLiabilityProductsGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();

  const user = store.auth.meJson;

  const onViewInstruments = async (productId: string) => {
    const selectedProduct = store.product.getItemById(productId);
    if (selectedProduct) {
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.ALL_PRODUCT_ACCOUNTS_MODAL);
    }
  };

  const onUpdateRate = async (productId: string) => {
    const selectedProduct = store.product.getItemById(productId);
    if (selectedProduct) {
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_PRODUCT_BASE_RATE_MODAL);
    }
  };
    const onVerifyProduct = async (productId: string) => {
      const selectedProduct = store.product.getItemById(productId);
      if (selectedProduct) {
        store.product.select(selectedProduct.asJson);
        showModalFromId(MODAL_NAMES.ADMIN.VERIFY_PRODUCT_MODAL);
      }
    };

  const hasMoneyMarketAccountManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Money Market Account Management" &&
      feature.update === true
  );

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
        return (
          store.product
            .getAllProductAccounts(params.row.id)
            .reduce((sum, balance) => sum + balance.asJson.balance, 0)
        );
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
                data-uk-tooltip="Verify"
                onClick={() => onVerifyProduct(params.row.id)}>
                <OpenInNew />
              </IconButton>

              {/* <IconButton
                data-uk-tooltip="Update Rate"
                onClick={() => onUpdateRate(params.row.id)}>
                <PriceChange />
              </IconButton> */}
            </div>
          ),
        }
      : ({} as GridColDef),
  ];

  return (
    <>
      <div className="grid">
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id} // Use the appropriate identifier property
            rowHeight={50}
          />
        </Box>
      </div>
      <div>
        <Modal modalId={MODAL_NAMES.ADMIN.VERIFY_PRODUCT_MODAL}>
          <VerifyProductModal />
        </Modal>
        <Modal modalId={MODAL_NAMES.BACK_OFFICE.ALL_PRODUCT_ACCOUNTS_MODAL}>
          <AllProductMoneyMarketAccountsModal />
        </Modal>

        <Modal modalId={MODAL_NAMES.BACK_OFFICE.UPDATE_PRODUCT_BASE_RATE_MODAL}>
          <UpdateProductBaseRateModal />
        </Modal>
      </div>
    </>
  );
});
