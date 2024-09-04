import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IProduct, defaultProduct } from "../../../../../shared/models/ProductModel";
import NumberInput from "../../../shared/components/number-input/NumberInput";
import { IProductUpdate } from "../../../../../shared/interfaces/CloudFunctionInterfaces";
import { updateProductRateCloudFunction } from "../../../../../shared/functions/cloud-functions/SystemCloudFunctions";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IStatementTransaction } from "../../../../../shared/models/StatementTransactionModel";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";

const HikeProductRateModal = observer(() => {

    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [product, setProduct] = useState<IProduct>({ ...defaultProduct });
    const [newBaseRate, setNewBaseRate] = useState<number>(0);

    const accounts = store.product.getAllProductAccounts(product.id);
    const totalBalance = accounts.reduce((sum, balance) => sum + balance.asJson.balance, 0);
    const totalAccounts = accounts.length;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {

            const _product: IProduct = {
                ...product,
                baseRate: newBaseRate
            }
            await api.product.update(_product);
            if (accounts) {

                const data: IProductUpdate = {
                    newBaseRate: newBaseRate,
                    accounts: accounts,
                };

                for (const account of accounts) {
                    const newClientRate = account.asJson.clientRate ? account.asJson.clientRate - 0.10 : 0;

                    const _productAccount: IMoneyMarketAccount = {
                        ...account.asJson,
                        clientRate: newClientRate,
                    }
                    try {

                        await api.mma.updateBaseRate(_productAccount);

                        // const statementTransaction: IStatementTransaction = {
                        //     id: `rateChange${account.asJson.accountNumber}${Date.now()}`,
                        //     date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
                        //     transaction: "rateChange",
                        //     balance: account.asJson.balance,
                        //     previousBalance: account.asJson.balance,
                        //     rate: newClientRate,
                        //     remark: `Rate change from ${account.asJson.clientRate || 0} to ${newClientRate}`,
                        //     amount: 0,
                        //     createdAt: Date.now()
                        // }

                        // try {
                        //     await api.mma.createStatementTransaction(account.asJson.id, statementTransaction);
                        // } catch (error) {
                        // }
                    } catch (error) {

                    }

                };
            }

        } catch (error) {
            setLoading(false);
        }

        setLoading(false);
        onCancel();

    }

    const onCancel = () => {
        store.mma.clearSelected();
        setNewBaseRate(0);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_PRODUCT_BASE_RATE_MODAL);
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
                onClick={onCancel}
            ></button>
            <h3 className="main-title-lg text-to-break">
                {product.productName} : Rate Hike
            </h3>
            <hr />
            <div className="dialog-content uk-position-relative">
                <form className="uk-form-stacked uk-grid-small" data-uk-grid onSubmit={handleSubmit}>

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
                        <label className="uk-form-label required" htmlFor="basis-point">
                         Basis Points
                        </label>
                        <div className="uk-form-controls">
                            <NumberInput
                                className="uk-input uk-form-small"
                                id="basis-point"
                                value={newBaseRate}
                                onChange={
                                    (value) =>
                                        setNewBaseRate(Number(value))
                                }
                                required
                            />
                        </div>
                    </div>
                    <hr className="uk-width-1-1 uk-margin-top" />
                    <div className="uk-width-1-1 uk-text-right">
                        <button className="btn btn-danger" type="button" onClick={onCancel} >
                            Cancel
                        </button>
                        <button className="btn btn-primary" type="submit" disabled={loading} >
                            Update {loading && <div data-uk-spinner="ratio: .5"></div>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default HikeProductRateModal;