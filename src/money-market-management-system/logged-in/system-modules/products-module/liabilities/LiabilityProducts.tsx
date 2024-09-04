import Toolbar from "../../../shared/components/toolbar/Toolbar";
import MODAL_NAMES from "../../../dialogs/ModalName";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ActiveLiabilityProductsGrid } from "./ActiveLiabilityProductsGrid";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import { NewLiabilityProductsGrid } from "./NewLiabilityProductsGrid";
import LiabilityProductTabs from "./LiabilityProductTabs";

const LiabilityProducts = observer(() => {
  const { store } = useAppContext();
  const user = store.auth.meJson;


  // const [showAmendSwitchModal, setShowAmendSwitchModal] = useState(true);
  // const [showAmendSwitchModal, setShowAmendSwitchModal] = useState(true);

  const [selectedTab, setSelectedTab] = useState("active-products-tab");

  const products = store.product.all;

  const activeLiabilities = products.filter(
    (product) => product.asJson.assetLiability === "Liability" && (!product.asJson.status || product.asJson.status === "active")
  ).sort((a, b) => {
    const createdAtA = a.asJson.createdAt ? new Date(a.asJson.createdAt) : new Date(0);
    const createdAtB = b.asJson.createdAt ? new Date(b.asJson.createdAt) : new Date(0);

    return createdAtB.getTime() - createdAtA.getTime(); // Sort by createdAt
  }).map((product) => product.asJson);

  const newLiabilities = products
    .sort((a, b) => {
      const dateA = new Date(a.asJson.productCode);
      const dateB = new Date(b.asJson.productCode);

      return dateB.getTime() - dateA.getTime();
    })
    .filter((product) => product.asJson.assetLiability === "Liability" && product.asJson.status === "pending") // Filter products with status "pending"
    .map((product) => product.asJson);


  const hasCreatePermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Product Management" && feature.create === true
  );

  const onAddNewProduct = () => {
    store.product.clearSelected();
    showModalFromId(MODAL_NAMES.ADMIN.LIABILITY_PRODUCT_MODAL);
  };



  const onImportLiabilityProducts = () => {
    showModalFromId(MODAL_NAMES.ADMIN.IMPORT_PRODUCTS_MODAL);
  };

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Liabilities"
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
                      onClick={onImportLiabilityProducts}
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

        <div className="page-main-card uk-card uk-card-default uk-card-body uk-padding-small">
          <Toolbar
            leftControls={
              <h4 className="main-title-lg">
                {selectedTab === "active-products-tab"
                  ? "Active IJG Liability Products"
                  : "New IJG Liability Products"}
              </h4>
            }
            rightControls={
              <LiabilityProductTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
            }
          />
          {
            selectedTab === "active-products-tab" &&
            <ActiveLiabilityProductsGrid data={activeLiabilities} />
          }
          {
            selectedTab === "new-products-tab" &&
            <NewLiabilityProductsGrid data={newLiabilities} />
          }
        </div>
      </div>
      {/* <Modal modalId={MODAL_NAMES.ADMIN.LIABILITY_PRODUCT_RATE_DROP_MODAL}>
        <DropProductRateModal />
      </Modal> */}




      {/* <Modal modalId={MODAL_NAMES.ADMIN.LIABILITY_PRODUCT_MODAL}>
        <LiabilityProductModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.VERIFY_PRODUCT_MODAL}>
        <VerifyProductModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.IMPORT_PRODUCTS_MODAL}>
        <ImportProductModal />
      </Modal> */}
    </div>
  );
});

export default LiabilityProducts;
