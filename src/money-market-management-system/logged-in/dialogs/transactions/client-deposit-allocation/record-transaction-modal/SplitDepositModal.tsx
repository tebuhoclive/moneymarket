import { observer } from "mobx-react-lite";
import { useEffect, useState} from "react";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import "./Split.scss";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { IconButton } from "@mui/material";
import SearchableSelect from "../../../../shared/components/client-account-select-component/LotsSingleSelect";
import FormattedNumberInput from "../../../../../../shared/functions/FormattedNumberInput";
import { getEntityId } from "../../../../../../shared/functions/MyFunctions";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";

interface ISplit {
    account: string;
    amount: number;
}

interface ObjectType {
    label: string;
    value: string;
}

const defaultObjectType: ObjectType = {
    label: "",
    value: ""
};

export const SplitDepositModal = observer(() => {
    const { store, api } = useAppContext();
    const [deposit, setDeposit] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const [splits, setSplits] = useState<ISplit[]>([{ account: "", amount: 0 }]);
    const [selectedClientAccounts, setSelectedClientAccounts] = useState<ObjectType[]>([{ ...defaultObjectType }]);
    const [progressPercentage, setProgressPercentage] = useState("");
    const [transactionUpdated, setTransactionUpdated] = useState(0);
    const [splitting, setSplitting] = useState(false);
    const [selectedClientAccount, setSelectedClientAccount] = useState<ObjectType>(defaultObjectType);

    const totalAmount = splits.reduce((acc, item) => acc + item.amount, 0);


    useEffect(() => {
        if (store.depositTransaction.selected) {
            setDeposit(store.depositTransaction.selected);
        }
    }, [store.depositTransaction.selected]);

    const handleSplitChange = (index: number, field: keyof ISplit, value: string | number) => {
        const newSplits = splits.slice();
        newSplits[index][field] = value as never;
        setSplits(newSplits);
    };

    const handleAddSplit = () => {
        setSplits([...splits, { account: "", amount: 0 }]);
        setSelectedClientAccounts([...selectedClientAccounts, { ...defaultObjectType }]);
    };

    const handleRemoveSplit = (index: number) => {
        const newSplits = splits.filter((_, i) => i !== index);
        const newSelectedAccounts = selectedClientAccounts.filter((_, i) => i !== index);
        setSplits(newSplits);
        setSelectedClientAccounts(newSelectedAccounts);
    };

    const handleSubmit = async () => {
        let count = 0;
        setSplitting(true);


        const mainTransaction: IDepositTransaction = {
            ...deposit,
            depositNodeType: "Parent",
            transactionStatus: "Non-Deposit",
            createdAtTime: { nonDepositsQueue: Date.now() },
            // transactionAction: "Split"
        }

        try {
            for (const transaction of splits) {
                const _transaction: IDepositTransaction = {
                    ...deposit,
                    // entity: getEntityId(store, transaction.account), // Make sure to get the entity number
                    // allocation: transaction.account,
                    // amount: transaction.amount,
                    // bank: deposit.bank,
                    // reference: "Deposit",
                    // description: "Split Deposit",
                    // valueDate: deposit.valueDate || Date.now(), // Set valueDate to current date if not set
                    // transactionDate: Date.now(),
                    // allocationStatus: "Awaiting First Level Approval",
                    // transactionStatus: "Pending",
                    // productCode: getMMAProduct(deposit.allocation, store),
                    // sourceOfFunds: deposit.sourceOfFunds,
                    // proofOfPayment: popFileURL,
                    // reasonForNoProofOfPayment: reasonForNoPoPAttachment,
                    // sourceOfFundsFile: sourceOfFundsFileURL,
                    // reasonForNoSourceOfFunds: reasonForNoSourceOfFundsAttachment,
                    // checkTimeCreate: Date.now(),
                    // createdAt: Date.now(),
                    // timeFirstLevel: Date.now(),
                    // splitDescription: "child",
                    // splitParentId: deposit.id
                };

                await api.depositTransaction.create(_transaction);
                count++;
                const progress = ((count / splits.length) * 100).toFixed(2); // Calculate progress percentage
                setTransactionUpdated(count);
                setProgressPercentage(progress);
            }
            await api.depositTransaction.update(mainTransaction);
        } catch (error) {
            console.error("Error during transaction split:", error);
        } finally {
            setSplitting(false);
            onCancel();
        }
    };


    const clientAccountOptions = store.mma.all
        .filter((mma) => mma.asJson.status === "Active")
        .map((cli) => ({ label: cli.asJson.accountNumber, value: cli.asJson.accountNumber }));

    const handleAccountNumberChange = (index: number, selectedOption: { value: string; label: string } | null) => {
        const selectedAccount = store.mma.all.find(
            (mma) => mma.asJson.accountNumber === selectedOption?.value
        );
        if (selectedAccount) {
            store.mma.select(selectedAccount.asJson);
            const account = store.mma.selected;
            if (account) {
                handleSplitChange(index, "account", selectedOption?.value || "");
                const newSelectedClientAccounts = selectedClientAccounts.slice();
                newSelectedClientAccounts[index] = { label: account.accountNumber, value: account.accountNumber };
                setSelectedClientAccounts(newSelectedClientAccounts);
            }
        }
    };

    const handleAmountChange = (index: number, newAmount: number) => {
        handleSplitChange(index, "amount", newAmount)
    };


    const onCancel = () => {
        setSelectedClientAccounts([]);
        setSplits([{ account: "", amount: 0 }]);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.SPLIT_DEPOSIT_MODAL)
    }
    const onClear = () => {
        setSelectedClientAccounts([]);
        setSplits([{ account: "", amount: 0 }]);
        // hideModalFromId(MODAL_NAMES.BACK_OFFICE.SPLIT_DEPOSIT_MODAL)
    }

    //file codes
    const [popFileURL, setPoPFileURL] = useState("");
    const [reasonForNoPoPAttachment, setReasonForNoPoPAttachment] = useState("");
    const [sourceOfFundsFileURL, setInstructionSourceOfFundsFileURL] = useState("");
    const [reasonForNoSourceOfFundsAttachment, setReasonForNoSourceOfFundsAttachment] = useState("");


    const handlePoPFileUpload = (url: string) => {
        setPoPFileURL(url);
    };

    const handleReasonForPoPNoAttachment = (reason: string) => {
        setReasonForNoPoPAttachment(reason);
    };

    const handleSourceOfFundsFileUpload = (url: string) => {
        setInstructionSourceOfFundsFileURL(url);
    };

    const handleReasonForNoSourceOfFundsAttachment = (reason: string) => {
        setReasonForNoSourceOfFundsAttachment(reason);
    };




    return (
        <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-1 split">
            <button className="uk-modal-close-default"
                type="button"
                data-uk-close
                onClick={onCancel}
            ></button>
            {splitting ?
                <>
                    <LoadingEllipsis />
                    <div className="uk-width-1-1 uk-margin">
                        <progress
                            className="uk-progress"
                            value={progressPercentage}
                            max={100}></progress>
                        <label className="uk-form-label required">
                            {`Progress: ${progressPercentage}% (${transactionUpdated} / ${splits.length} transactions completed)`}{" "}
                        </label>
                    </div>
                </>
                :
                <div>
                    {/* 
                    <div>
                        <h5 className="main-title-md text-to-break">Reference: {deposit.reference} (Split Deposit)</h5>
                    </div> 
                    */}
                    <label className="uk-form-label">Total Amount to split: {(deposit.amount)}</label>
                    <br />
                    <label className="uk-form-label">Total Amount: {(totalAmount)}</label>
                    <br />
                    <label className="uk-form-label">Remaining Amount: {(deposit.amount - totalAmount)}</label>
                    <div>
                        <div
                            className="uk-child-width-1-2@s uk-grid-match"
                            data-uk-grid
                        >
                            <div className="scroll-container">
                                <div className="scrollable">
                                    <div >
                                        {splits.map((split, index) => (
                                            <div key={index} className="split-row">
                                                <label className="uk-form-label" htmlFor={`account-${index}`}>Account {index + 1}</label>
                                                <div className="uk-child-width-1-3@m uk-grid-small uk-grid-match" data-uk-grid>
                                                    <div className="">
                                                        <div className="uk-form-controls uk-width-1-1">
                                                            <label className="uk-form-label required" htmlFor="clientSelect">Select Account</label>
                                                            <SearchableSelect
                                                                value={selectedClientAccount}
                                                                options={clientAccountOptions}
                                                                onChange={(value: ObjectType | null) => handleAccountNumberChange(index, value)}
                                                                placeholder="Select account number"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="">
                                                        <label className="uk-form-label" htmlFor={`amount-${index}`}>Amount</label>
                                                        <FormattedNumberInput
                                                            amount={split.amount}
                                                            onAmountChange={(value: number) => handleAmountChange(index, value)}
                                                            showFormat={true}
                                                        />
                                                    </div>
                                                    <div>
                                                        {splits.length > 1 && (
                                                            <div className="uk-flex uk-flex-middle">
                                                                <IconButton
                                                                    data-uk-tooltip="Remove"
                                                                    type="button"
                                                                    className="uk-button uk-button-danger"
                                                                    onClick={() => handleRemoveSplit(index)}
                                                                >
                                                                    <RemoveCircleOutlineIcon style={{ fontSize: "20px", color: "red" }} />
                                                                </IconButton>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="uk-margin">

                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="scroll-container">
                                <div className="scrollable">
                                    <label className="uk-form-label">Split deposit Instructions</label>
                                    <div
                                        className="uk-child-width-1-2@s uk-grid-match"
                                        data-uk-grid
                                    >
                                        <div className="uk-form-controls">
                                            {/* <InstructionFileUploader
                                                onFileUpload={handlePoPFileUpload}
                                                onProvideReason={handleReasonForPoPNoAttachment}
                                                fileUrl={popFileURL}
                                                reasonForNotProvingFile={
                                                    deposit.reasonForNoProofOfPayment
                                                }
                                                label="Proof of Payment"
                                                allocation={deposit.allocation}
                                                value={reasonForNoPoPAttachment}
                                                fileValue={popFileURL}
                                            /> */}
                                        </div>
                                        <div className="uk-form-controls">
                                            {/* <InstructionFileUploader
                                                onFileUpload={handleSourceOfFundsFileUpload}
                                                onProvideReason={
                                                    handleReasonForNoSourceOfFundsAttachment
                                                }
                                                fileUrl={sourceOfFundsFileURL}
                                                reasonForNotProvingFile={
                                                    deposit.reasonForNoSourceOfFunds
                                                }
                                                label="Source of Funds"
                                                allocation={deposit.allocation}
                                                value={reasonForNoSourceOfFundsAttachment}
                                                fileValue={sourceOfFundsFileURL}
                                            /> */}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="uk-form-label">Split deposit transactions</label>
                                    <table className="uk-table uk-table-small  kit-table">
                                        <thead>
                                            <tr>
                                                <th>Account Number</th>
                                                <th>Client Name</th>
                                                <th>Reference</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {splits.map((t, index: number) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>

                                                            {/*  */}
                                                            <p>here</p>
                                                            <div className="uk-form-controls uk-width-1-1">
                                                                <label className="uk-form-label required" htmlFor="clientSelect">Select Account</label>
                                                                <SearchableSelect
                                                                    value={selectedClientAccount}
                                                                    options={clientAccountOptions}
                                                                    onChange={(value: ObjectType | null) => handleAccountNumberChange(index, value)}
                                                                    placeholder="Select account number"
                                                                />
                                                            </div>

                                                        </td>
                                                        <td>{getEntityId(store, t.account)}</td>
                                                        <td>{deposit.bankReference}</td>
                                                        <td>{(t.amount)}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="uk-margin uk-form-controls">

                            <button
                                type="button"
                                disabled={splitting}
                                className="btn btn-danger"
                                onClick={onCancel}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={splitting}
                                className="btn btn-danger"
                                onClick={onClear}>
                                Clear
                            </button>
                            <button
                                data-uk-tooltip="Add"
                                type="button"
                                disabled={splitting}
                                className="btn btn-primary"
                                onClick={handleAddSplit}
                            >
                                Add
                            </button>
                            <button
                                disabled={totalAmount !== deposit.amount || splitting}
                                onClick={handleSubmit}
                                className="btn btn-primary"
                            >
                                Allocate{" "}
                                {splitting && <span data-uk-spinner={"ratio:.5"}></span>}
                            </button>

                        </div>
                    </div>
                </div>
            }

        </div>
    );
});
