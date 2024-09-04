import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import MODAL_NAMES from "../ModalName";
import { useAppContext } from "../../../../shared/functions/Context";
import { IProduct, defaultProduct } from "../../../../shared/models/ProductModel";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import NumberInput from "../../shared/components/number-input/NumberInput";
const VerifyProductModal = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState<IProduct>({ ...defaultProduct });
  const [newBaseRate, setNewBaseRate] = useState<number>(0);

  const accounts = store.product.getAllProductAccounts(product.id);
  const totalBalance = accounts.reduce(
    (sum, balance) => sum + balance.asJson.balance,
    0
  );
  const totalAccounts = accounts.length;
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const _product: IProduct = {
        ...product,
        status: "active",
        baseRate: newBaseRate,
      };
      await api.product.update(_product);
   
    } catch (error) {}
    setLoading(false);
    onCancel();
  };

  const onCancel = () => {
    store.mma.clearSelected();
    setNewBaseRate(0);
    hideModalFromId(MODAL_NAMES.ADMIN.VERIFY_PRODUCT_MODAL);
  };

  useEffect(() => {
    if (store.product.selected) {
      setProduct(store.product.selected);
    }
  }, [store.product.selected]);

  return (
    <div className="view-modal custom-modal-style uk-width-1-2 uk-modal-dialog uk-modal-body uk-margin-small-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
        onClick={onCancel}></button>
      <h3 className="main-title-sm text-to-break">Verify Product</h3>
      <hr />
      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-width-1-2">
            <label className="uk-form-label" htmlFor="product-code">
              Product Code
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="product-code"
                type="text"
                placeholder="Product Code"
                value={product.productCode}
                onChange={(e) =>
                  setProduct({ ...product, productCode: e.target.value })
                }
                required
                disabled
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label" htmlFor="product-name">
              Product Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="product-name"
                type="text"
                placeholder="Product Name"
                value={product.productName}
                onChange={(e) =>
                  setProduct({ ...product, productName: e.target.value })
                }
                required
                disabled
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label" htmlFor="product-balance">
              Balance (N$)
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="product-balance"
                type="text"
                placeholder="Product Balance"
                value={(totalBalance)}
                required
                disabled
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label" htmlFor="total-product-accounts">
              Total Accounts
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="total-product-accounts"
                type="text"
                placeholder="Total Product Accounts"
                value={totalAccounts}
                required
                disabled
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label
              className="uk-form-label"
              htmlFor="current-product-base-rate">
              Current Base Rate
            </label>
            <div className="uk-form-controls">
              <NumberInput
                className="uk-input uk-form-small"
                id="current-product-base-rate"
                value={product.baseRate}
                onChange={(value) => setNewBaseRate(Number(value))}
                disabled
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label" htmlFor="new-product-base-rate">
              New Base Rate
            </label>
            <div className="uk-form-controls">
              <NumberInput
                className="uk-input uk-form-small"
                id="new-product-base-rate"
                value={newBaseRate}
                onChange={(value) => setNewBaseRate(Number(value))}
              />
            </div>
          </div>
          <hr className="uk-width-1-1 uk-margin-top" />
          <div className="uk-width-1-1 uk-text-right">
            <button className="btn btn-danger" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}>
              Verify {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default VerifyProductModal;
