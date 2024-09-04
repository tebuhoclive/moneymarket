import Toolbar from "../../../shared/components/toolbar/Toolbar";
import MODAL_NAMES from "../../../dialogs/ModalName";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { ActiveAssetProductsGrid } from "./ActiveAssetProductsGrid";
import ProductTabs from "./ProductTabs";
import Modal from "../../../../../shared/components/Modal";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import ImportProductModal from "../../../dialogs/products/import-products/ImportProductModal";
import ProductModal from "../../../dialogs/products/ProductModal";
import { NewAssetProductsGrid } from "./NewAssetProductsGrid";
import VerifyProductModal from "../../../dialogs/products/VerifyProductModal";
import ProductTypeTabs from "../ProductTypeTabs";

const AssetProducts = observer(() => {
  const { api, store } = useAppContext();
  const user = store.auth.meJson;

  const [selectedTab, setSelectedTab] = useState("active-products-tab");
  const [loading, setLoading] = useState(false);

  const products = store.product.all;

  const activeAssets = products.filter((product) => product.asJson.assetLiability === "Asset" && product.asJson.status === "active").sort((a, b) => {
    const createdAtA = a.asJson.createdAt
      ? new Date(a.asJson.createdAt)
      : new Date(0);
    const createdAtB = b.asJson.createdAt
      ? new Date(b.asJson.createdAt)
      : new Date(0);

    return createdAtB.getTime() - createdAtA.getTime(); // Sort by createdAt
  }).map((product) => product.asJson);

  const newAssets = products.filter((product) => product.asJson.assetLiability === "Asset" && product.asJson.status === "pending").sort((a, b) => {
    const dateA = new Date(a.asJson.productCode);
    const dateB = new Date(b.asJson.productCode);

    return dateB.getTime() - dateA.getTime();
  }).map((product) => product.asJson);

  const hasCreatePermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Product Management" && feature.create === true
  );

  const onAddNewProduct = () => {
    store.product.clearSelected();
    showModalFromId(MODAL_NAMES.ADMIN.PRODUCT_MODAL);
  };

  const onImportAssetProducts = () => {
    showModalFromId(MODAL_NAMES.ADMIN.IMPORT_PRODUCTS_MODAL);
  };


  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Asset Products"
            rightControls={
              <>
                {hasCreatePermission && (
                  <>
                    {" "}
                    <button
                      className="btn btn-primary"
                      onClick={onAddNewProduct}>
                      Add New
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={onImportAssetProducts}
                    >
                      Import
                    </button>
                  </>
                )}
              </>
            }
          />
          <hr />
        </div>

        <div className="page-main-card uk-card uk-card-default uk-card-body">
          <Toolbar
            leftControls={
              <h4 className="main-title-lg">
                {selectedTab === "active-products-tab"
                  ? "Active IJG Asset Products"
                  : "New IJG Asset Products"}
              </h4>
            }
            rightControls={
              <ProductTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
            }
          />
          <hr />
          <hr />
          {selectedTab === "active-products-tab" && (
            <>
              <Toolbar
                leftControls={
                  <ProductTypeTabs
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                  />
                }
              />
              <hr />
              {!loading && <ActiveAssetProductsGrid data={activeAssets} />}
            </>
          )}
          {selectedTab === "new-products-tab" && (
            <>{!loading && <NewAssetProductsGrid data={newAssets} />}</>
          )}
        </div>
      </div>
      <Modal modalId={MODAL_NAMES.ADMIN.PRODUCT_MODAL}>
        <ProductModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.VERIFY_PRODUCT_MODAL}>
        <VerifyProductModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.IMPORT_PRODUCTS_MODAL}>
        <ImportProductModal />
      </Modal>
    </div>
  );
});

export default AssetProducts;
