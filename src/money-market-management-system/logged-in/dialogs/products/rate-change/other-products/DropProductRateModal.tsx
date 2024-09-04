import { observer } from "mobx-react-lite";
import swal from "sweetalert";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../../ModalName";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import { IProduct, defaultProduct } from "../../../../../../shared/models/ProductModel";
import NumberInput from "../../../../shared/components/number-input/NumberInput";
import MoneyMarketAccountModel, { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import ProductRateChangeHistoryModel from "../../../../../../shared/models/ProductRateChangeHistoryModel";
import { IProductRateChangeHistory } from '../../../../../../shared/models/ProductRateChangeHistoryModel';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonthBackDating = new Date(currentYear, currentMonth, 2);

const HikeProductRateModal = observer(() => {

    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);

    const [product, setProduct] = useState<IProduct>({ ...defaultProduct });

    const [basisPoints, setBasisPoints] = useState<number>(0);
    const [rateChangeDate, setRateChangeDate] = useState<number>(0);

    const accounts = store.product.getAllProductAccounts(product.id);

    const totalBalance = accounts.reduce((sum, balance) => sum + balance.asJson.balance, 0);
    const totalAccounts = accounts.length;

    const [progressPercentage, setProgressPercentage] = useState("");
    const [productsUpdated, setProductsUpdated] = useState(0);

    const reverseRateChange = async (account: MoneyMarketAccountModel, rateChangeDate: number, rateChangeHistory: ProductRateChangeHistoryModel) => {
        if (account && account.asJson.clientRate) {
            try {
                await api.statementTransaction.getAll(account.asJson.id);
                const allStatementTransactions = store.statementTransaction.all.map(st => st.asJson);

                // Find the rate change transaction
                const rateChangeTransaction = allStatementTransactions.find(st => st.transaction === "rateChange" && st.date === Date.parse(dateFormat_YY_MM_DD(rateChangeDate)));
                if (!rateChangeTransaction) {
                    console.log('Rate change transaction not found.');
                    return;
                }

                // Remove the rate change transaction
                const remainingTransactions = allStatementTransactions.filter(st => st.id !== rateChangeTransaction.id);

                // Restore the original client rate
                const originalClientRate = rateChangeTransaction.rate + (basisPoints / 100);
                account.asJson.clientRate = originalClientRate;
                
                // Sort remaining transactions
                const sortedTransactions = remainingTransactions.sort((a, b) => {
                    const dateA = new Date(a.date || 0);
                    const dateB = new Date(b.date || 0);

                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateA.getTime() - dateB.getTime();
                    } else if (a.transaction === "rateChange" && b.transaction !== "rateChange") {
                        return -1;
                    } else if (a.transaction !== "rateChange" && b.transaction === "rateChange") {
                        return 1;
                    } else {
                        const createdAtA = new Date(a.createdAt || 0);
                        const createdAtB = new Date(b.createdAt || 0);

                        return createdAtA.getTime() - createdAtB.getTime();
                    }
                });

                // Recompute balances and rates
                const modifiedTransactions = [];
                let currentRate = originalClientRate; // Start with the restored rate

                for (let i = 0; i < sortedTransactions.length; i++) {
                    const previousTransaction = i > 0 ? sortedTransactions[i - 1] : null;
                    const currentTransaction = sortedTransactions[i];

                    currentTransaction.previousBalance = previousTransaction ? previousTransaction.balance : currentTransaction.previousBalance;

                    if (currentTransaction.transaction === "deposit") {
                        currentTransaction.balance = previousTransaction ? previousTransaction.balance + currentTransaction.amount : currentTransaction.amount;
                    } else if (currentTransaction.transaction === "withdrawal") {
                        currentTransaction.balance = previousTransaction ? previousTransaction.balance - currentTransaction.amount : -currentTransaction.amount;
                    } else {
                        currentTransaction.balance = previousTransaction ? previousTransaction.balance : currentTransaction.balance;
                    }

                    if (currentTransaction.transaction === "rateChange") {
                        currentRate = currentTransaction.rate;
                    } else {
                        currentTransaction.rate = currentRate;
                    }

                    try {
                        await api.statementTransaction.update(account.asJson.id, currentTransaction);
                    } catch (error) {
                        console.error('Error updating transaction:', error);
                    }
                    modifiedTransactions.push(currentTransaction);
                }

                try {
                    const _account: IMoneyMarketAccount = {
                        ...account.asJson,
                        clientRate: originalClientRate
                    }

                    const _rateChangeHistory: IProductRateChangeHistory = {
                        ...rateChangeHistory.asJson,
                        status: "reversed"
                    }

                    await api.mma.update(_account);
                    try {
                        await api.statementTransaction.delete(account.asJson.id, rateChangeTransaction)
                    } catch (error) {

                    }

                    await api.productRateChangeHistory.update(product.id, _rateChangeHistory);
                } catch (error) {
                    console.log(error);
                }
                store.statementTransaction.removeAll();
            } catch (error) {
                console.log('Rate change transaction not found.');
            }
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {

        } catch (error) {
        }
    }

    const handleRateDropReverse = async (rateChangeHistory: ProductRateChangeHistoryModel) => {

        if (accounts) {
            setLoading(true);
            for (const account of accounts) {
                try {
                    try {
                        reverseRateChange(account, rateChangeHistory.asJson.effectiveDate, rateChangeHistory);
                        swal({
                            icon: "success",
                            title: `Rate Drop reversed`
                        });
                    } catch (error) {
                    }
                } catch (error) {
                }
            };
            setLoading(false);
        }
    }

    const onCancel = () => {
        store.product.clearSelected();
        setBasisPoints(0);
        hideModalFromId(MODAL_NAMES.ADMIN.LIABILITY_PRODUCT_RATE_DROP_MODAL);
    };

    useEffect(() => {
        const getHistory = async () => {
            try {
                setLoading(true);
                await api.productRateChangeHistory.getAll(product.id);
                setLoading(false);
            } catch (error) {
            }
        }

        if (store.product.selected) {
            setProduct(store.product.selected);
            if (product && product.id) {
                getHistory();
            }
        }
    }, [api.productRateChangeHistory, product, store.product.selected]);

    return (
        <div className="view-modal custom-modal-style uk-width-4-5 uk-modal-dialog uk-modal-body uk-margin-small-auto-vertical">
            <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel}></button>
            <h3 className="main-title-lg text-to-break">
                {product.productName} : Rate Drop
            </h3>
            <hr />
            <div className="dialog-content uk-position-relative">
                <div className="uk-grid uk-grid-small" data-uk-grid>
                    <form className="uk-form-stacked uk-grid-small uk-width-1-3" data-uk-grid onSubmit={handleSubmit}>
                        <div className="uk-width-1-1 uk-form-controls">
                            <label className="uk-form-label" htmlFor="product-code">
                                Product Code
                            </label>
                            <input className="uk-input uk-form-small" id="product-code" type="text" placeholder="Product Code" value={product.productCode}
                                onChange={(e) => setProduct({ ...product, productCode: e.target.value })}
                                required
                                disabled
                            />
                        </div>
                        <div className="uk-width-1-1 uk-form-controls">
                            <label className="uk-form-label" htmlFor="product-name">
                                Product Name
                            </label>
                            <input className="uk-input uk-form-small" id="product-name" type="text" placeholder="Product Name" value={product.productName}
                                onChange={(e) => setProduct({ ...product, productName: e.target.value })}
                                required
                                disabled
                            />
                        </div>
                        <div className="uk-width-1-1 uk-form-controls">
                            <label className="uk-form-label" htmlFor="product-balance">
                                Balance (N$)
                            </label>
                            <input className="uk-input uk-form-small" id="product-balance" type="text" placeholder="Product Balance" value={(totalBalance)}
                                required
                                disabled
                            />
                        </div>
                        <div className="uk-width-1-1 uk-form-controls">
                            <label className="uk-form-label" htmlFor="total-product-accounts">
                                Total Number of Accounts
                            </label>
                            <input className="uk-input uk-form-small" id="total-product-accounts" type="text" placeholder="Total Product Accounts" value={totalAccounts}
                                required
                                disabled
                            />
                        </div>
                        <div className="uk-width-1-1 uk-form-controls">
                            <label className="uk-form-label required" htmlFor="basis-points">
                                Basis Points {basisPoints ? `(${basisPoints / 100})` : ""}
                            </label>
                            <NumberInput className="uk-input uk-form-small" id="basis-points" value={basisPoints}
                                onChange={(value) => setBasisPoints(Number(value))}
                                required
                            />
                        </div>
                        <div className="uk-width-1-1 uk-form-controls">
                            <label className="uk-form-label required" htmlFor="valueDate">
                                Rate Change Effective Date
                            </label>
                            <input className="uk-input uk-form-small" id="valueDate" type="date" name="valueDate"
                                min={startOfMonthBackDating.toISOString().split('T')[0]}
                                value={dateFormat_YY_MM_DD(rateChangeDate)}
                                onChange={(e) => setRateChangeDate(e.target.valueAsNumber)}
                                required
                            />
                        </div>
                        <hr className="uk-width-1-1" />
                        <div className="uk-width-1-1 uk-text-right">
                            <button className="btn btn-primary" type="submit" disabled={loading} >
                                Drop {loading && <div data-uk-spinner="ratio: .5"></div>}
                            </button>
                            <button className="btn btn-danger" type="button" onClick={onCancel} >
                                Cancel
                            </button>
                        </div>
                    </form>
                    <div className="uk-width-expand">
                        <h4 className="main-title-sm">Rate Change History</h4>
                        <hr />
                        {/* <ProductRateDropHistoryGrid /> */}
                        <table className="uk-table uk-table-small kit-table">
                            <thead>
                                <tr>
                                    <th>Date/Time</th>
                                    <th>Basis Points</th>
                                    <th>Rate Change Effective Date</th>
                                    <th>Updated By</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    store.productRateChangeHistory.all.map(history => (
                                        <tr key={history.asJson.id}>
                                            <td>{dateFormat_YY_MM_DD(history.asJson.changedAt)}</td>
                                            <td>{dateFormat_YY_MM_DD(history.asJson.effectiveDate)}</td>
                                            <td>{history.asJson.basisPoints}</td>
                                            <td>{history.asJson.changedBy}</td>
                                            <td>
                                                <button className="btn btn-danger" onClick={() => handleRateDropReverse(history)}>Reverse</button>
                                            </td>
                                        </tr>
                                    ))
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="uk-width-1-1 uk-margin">

                </div>
            </div>
        </div>
    );
});

export default HikeProductRateModal;