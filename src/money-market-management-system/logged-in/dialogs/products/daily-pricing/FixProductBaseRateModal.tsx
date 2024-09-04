import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IProduct, defaultProduct } from "../../../../../shared/models/ProductModel";
import NumberInput from "../../../shared/components/number-input/NumberInput";
import { ACTIVE_ENV } from "../../../CloudEnv";
import swal from "sweetalert";

const FixProductBaseRateModal = observer(() => {

    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [product, setProduct] = useState<IProduct>({ ...defaultProduct });
    const [newBaseRate, setNewBaseRate] = useState<number | null>(0);

    const accounts = store.product.getAllProductAccounts(product.id);
    const totalBalance = accounts.reduce((sum, balance) => sum + balance.asJson.balance, 0);
    const totalAccounts = accounts.length;

    const [progressPercentage, setProgressPercentage] = useState("");
    const [productsUpdated, setProductsUpdated] = useState(0);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newBaseRate) {
            const _product: IProduct = {
                ...product,
                baseRate: newBaseRate,
                backUpBaseRate: product.baseRate || newBaseRate
            }
            try {
                await api.product.update(_product);

                if (accounts) {
                    setLoading(true);

                    let completedCount = 0;
                    const maxConcurrentRequests = 500;

                    const updateAccount = async (accountToUpdate: any) => {
                        const fee = newBaseRate - accountToUpdate.clientRate;

                        const _accountToUpdate = {
                            accountId: accountToUpdate.id,
                            baseRate: newBaseRate,
                            fee: fee
                        }

                        console.log("Data", _accountToUpdate);
                        
                        const url = `${ACTIVE_ENV.url}fixClientFeeAndBaseRate`;

                        try {
                            const response = await fetch(url, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(_accountToUpdate),
                            });

                            if (response.ok) {
                                return true; // Indicate success
                            } else {
                                console.log("error: ", response.status);
                                return false; // Indicate failure
                            }
                        } catch (error) {
                            console.log("error", error);
                            return false;
                        } finally {
                            completedCount++;
                            const progress = ((completedCount / accounts.length) * 100).toFixed(2);
                            setProgressPercentage(progress);
                            setProductsUpdated(completedCount);
                        }
                    };

                    const runUpdatesWithConcurrencyLimit = async () => {
                        const executing: any = [];
                        for (const account of accounts) {
                            const p = updateAccount(account.asJson).then(() => {
                                executing.splice(executing.indexOf(p), 1);
                            });
                            executing.push(p);
                            if (executing.length >= maxConcurrentRequests) {
                                await Promise.race(executing);
                            }
                        }
                        await Promise.all(executing);
                    };

                    try {
                        await runUpdatesWithConcurrencyLimit();
                        swal({
                            icon: "success",
                            text: "Accounts updated successfully",
                        });
                    } catch (error) {
                        console.error("Error updating accounts:", error);
                    } finally {
                        setLoading(false);
                        onCancel();
                    }
                }
            } catch (error) {
            }
        }
    }

    // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();

    //     let completedCount = 0;

    //     try {

    //         if (newBaseRate) {
    //             const _product: IProduct = {
    //                 ...product,
    //                 baseRate: newBaseRate
    //             }
    //             try {
    //                 await api.product.update(_product);
    //                 if (accounts) {
    //                     setLoading(true);
    //                     for (const account of accounts) {

    //                         if (newBaseRate && account.asJson.clientRate) {
    //                             const fee = newBaseRate - account.asJson.clientRate;

    //                             const _productAccount: IMoneyMarketAccount = {
    //                                 ...account.asJson,
    //                                 baseRate: newBaseRate,
    //                                 feeRate: fee
    //                             }
    //                             try {
    //                                 await api.mma.updateBaseRate(_productAccount);
    //                                 completedCount++;
    //                                 const progress = ((completedCount / totalAccounts) * 100).toFixed(2); // Calculate progress percentage
    //                                 setProductsUpdated(completedCount);
    //                                 setProgressPercentage(progress);
    //                             } catch (error) {
    //                             }
    //                         }
    //                         onCancel();
    //                         setLoading(false);
    //                     }
    //                 }
    //             } catch (error) {
    //             }
    //         }
    //     } catch (error) {
    //         setLoading(false);
    //     }
    // }

    const onCancel = () => {
        store.mma.clearSelected();
        setNewBaseRate(null);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.FIX_PRODUCT_BASE_RATE_MODAL);
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
                {product.productName} : Rate Fix
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
                        <label className="uk-form-label" htmlFor="current-product-base-rate">
                            Current Base Rate
                        </label>
                        <div className="uk-form-controls">
                            <NumberInput
                                className="uk-input uk-form-small"
                                id="current-product-base-rate"
                                value={product.baseRate}
                                onChange={
                                    (value) =>
                                        setNewBaseRate(Number(value))
                                }
                                disabled
                            />
                        </div>
                    </div>
                    <div className="uk-width-1-2">
                        <label className="uk-form-label required" htmlFor="new-product-base-rate">
                            New Base Rate
                        </label>
                        <div className="uk-form-controls">
                            <NumberInput
                                className="uk-input uk-form-small"
                                id="new-product-base-rate"
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
                            Save {loading && <div data-uk-spinner="ratio: .5"></div>}
                        </button>
                    </div>
                </form>
            </div>
            <div className="uk-width-1-1 uk-margin">
                {
                    loading &&
                    <>
                        <progress className="uk-progress" value={progressPercentage} max={100}></progress>
                        <label className="uk-form-label required" >{`Progress: ${progressPercentage}% (${productsUpdated} / ${totalAccounts} accounts corrected)`} </label>
                    </>
                }

            </div>
        </div>
    );
});

export default FixProductBaseRateModal;