import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IStatementTransaction, defaultStatementTransaction } from "../../../../../../shared/models/StatementTransactionModel";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import { FIREBASE_PROJECT } from "../../../../../../shared/config/ENV";
import { defaultDepositTransaction, IDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";

interface IProps {
    mmaId: string;
}

export const UpdateRemarkModal = observer(({ mmaId }: IProps) => {
    const { store, api } = useAppContext();
    const [transaction, setTransaction] = useState<IStatementTransaction>({ ...defaultStatementTransaction });
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const [loadingSave, setLoadingSave] = useState(false);

    const updateRemark = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Use the current state of the transaction
        const _transaction: IStatementTransaction = {
            ...transaction,
            remark: transaction.remark
        };
        try {
            setLoadingSave(true);
            await api.statementTransaction.update(mmaId, _transaction);
            await api.statementTransaction.getAll(mmaId);
            onCancel();
            setLoadingSave(false);
        } catch (error) {
            console.error("Error updating remark:", error);
            setLoadingSave(false); // Ensure loading state is reset in case of error
        }
    };

    const onCancel = () => {
        setTransaction({ ...defaultStatementTransaction });
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.EDIT_NORMAL_STATEMENT_MODAL);
    };

    useEffect(() => {
        if (store.statementTransaction.selected) {
            setTransaction(store.statementTransaction.selected);
            store.depositTransaction.getItemById(store.statementTransaction.selected.id);
        }

    }, [store.statementTransaction.selected]);



    const dev = FIREBASE_PROJECT.LIVE_ENV;

    return (
        <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
            <button
                className="uk-modal-close-default"
                onClick={onCancel}
                disabled={loadingSave}
                type="button"
                data-uk-close
            ></button>

            <div>
                <form className="uk-grid-small" onSubmit={updateRemark} data-uk-grid>
                    <div className="uk-width-1-2@s">
                        <label className="uk-form-label required" htmlFor="">
                            Rate
                        </label>
                        <input
                            className="uk-input"
                            type="number"
                            value={transaction.rate}
                            onChange={(e: any) =>
                                setTransaction({
                                    ...transaction,
                                    rate: e.target.value
                                })
                            }
                        />
                    </div>
                    <div className="uk-width-1-2@s">
                        <label className="uk-form-label required" htmlFor="">
                            Remark
                        </label>
                        <input
                            className="uk-input"
                            type="text"
                            value={transaction.remark}
                            onChange={(e: any) =>
                                setTransaction({
                                    ...transaction,
                                    remark: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <button type="submit" className="btn btn-primary" disabled={loadingSave}>
                            Save
                            {loadingSave && <span data-uk-spinner={"ratio:.5"}></span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});
