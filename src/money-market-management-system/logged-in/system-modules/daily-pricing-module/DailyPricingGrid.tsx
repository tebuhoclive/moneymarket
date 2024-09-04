import {Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import { useNavigate } from "react-router-dom";

import { useState } from "react";

import AllProductMoneyMarketAccountsModal from "../../dialogs/products/product-money-market-accounts/AllProductMoneyMarketAccountsModal";
import UpdateProductBaseRateModal from "../../dialogs/products/daily-pricing/HikeProductRateModal";
import Modal from "../../../../shared/components/Modal";
import MODAL_NAMES from "../../dialogs/ModalName";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import MoneyMarketAccount from "../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IProductDailyPricing } from "../../../../shared/models/ProductDailyPricingModel";
import AppStore from "../../../../shared/stores/AppStore";


interface IProps {
  data: IProductDailyPricing[];
}

export const DailyPricingGrid = observer(({ data }: IProps) => {
  const { api ,store } = useAppContext();
  const onNavigate = useNavigate();
  const user = store.auth.meJson;
  const [productAccounts, setProductAccounts] = useState<MoneyMarketAccount[]>();
  

  const onViewInstruments = async (productId: string,store:AppStore) => {


    setProductAccounts(store.mma.allProductAccounts(productId));
    showModalFromId(MODAL_NAMES.BACK_OFFICE.ALL_PRODUCT_ACCOUNTS_MODAL);
  }

  const onUpdateRate = async (productId: string,store:AppStore) => {


    setProductAccounts(store.mma.allProductAccounts(productId));
    const selectedProduct = store.product.getItemById(productId);

    if (selectedProduct) {
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_PRODUCT_BASE_RATE_MODAL);
    }
  }

  const onEdit = (product: string,store:AppStore) => {
    const selectedProduct = store.product.getItemById(product);

    if (selectedProduct) {
      store.product.select(selectedProduct.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.PRODUCT_MODAL);
    }
  }

  const onDelete = async (product: string) => {
    const selectedProduct = store.product.getItemById(product);

    if (selectedProduct) {
      await api.product.delete(selectedProduct.asJson)
    }
  }



  const hasMoneyMarketAccountManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Money Market Account Management" &&
      feature.update === true
  );

  const columns: GridColDef[] = [
    {
      field: "updateDate",
      headerName: "Date",
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
      field: "productCode",
      headerName: "Product Code",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "oldRate",
      headerName: "Old Rate",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "newRate",
      headerName: "New Rate",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
  ];

  return (
    <>
     <div className="grid">
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.key} // Use the appropriate identifier property
          rowHeight={50}
        />
      </Box>
    </div>
    <div>
    <Modal modalId={MODAL_NAMES.BACK_OFFICE.ALL_PRODUCT_ACCOUNTS_MODAL}>
        {
          productAccounts &&
          <AllProductMoneyMarketAccountsModal />
        }
      </Modal>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.UPDATE_PRODUCT_BASE_RATE_MODAL}>
        {
          <UpdateProductBaseRateModal />
        }
      </Modal>
    </div>
    </>
   
  );
});
