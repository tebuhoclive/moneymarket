import { useEffect } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";

const AccountDepositModal = () => {

    const { store } = useAppContext();

    useEffect(() => {
        if (store.mma.selected) {

        } else {

        }
    }, [store.mma.selected])
    return (
        <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-1">
            <button
                className="uk-modal-close-default"
                type="button"
                data-uk-close></button>
            <h3 className="main-title-sm text-to-break">Deposit</h3>
            <hr />

            <div className="uk-grid" data-uk-grid>
                <div className="uk-width-1-3">

                </div>
                <div className="dialog-content uk-position-relative uk-width-expand">
                    <h4>Deposit Form</h4>
                    <hr />

                    <form className="uk-grid" data-uk-grid >
                        <div className="uk-grid uk-child-width-1-2" data-uk-grid>
                            <div>
                                <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                                    <label
                                        className="uk-form-label required"
                                        htmlFor="valueDate">
                                        Value Date
                                    </label>
                                    <input
                                        className="uk-input uk-form-small"
                                        id="valueDate"
                                        type="date"
                                        name="valueDate"
                                        required
                                    />
                                </div>
                                {/* {
                                    futureDatingTransaction &&
                                    <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                                        <label className="uk-form-label required" htmlFor="">Reason for Future Dating</label>
                                        <textarea className="uk-form-small uk-textarea" name="reasonForFutureDating" id="reasonForFutureDating" cols={20} rows={5}
                                            onChange={(e) => setNewDepositTransaction({
                                                ...newdepositTransaction,
                                                transactionNotes: e.target.value,
                                            })
                                            }
                                            required
                                        >
                                        </textarea>
                                    </div>
                                } */}

                                {/* {
                                    backDatingTransaction &&
                                    <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                                        <label className="uk-form-label required" htmlFor="">Reason for Back Dating</label>
                                        <textarea className="uk-form-small uk-textarea" name="reasonForBackDating" id="reasonForBackDating" cols={20} rows={5}
                                            onChange={(e) => setNewDepositTransaction({
                                                ...newdepositTransaction,
                                                transactionNotes: e.target.value,
                                            })
                                            }
                                            required
                                        >
                                        </textarea>
                                    </div>
                                } */}

                                <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                                    <label className="uk-form-label required" htmlFor="">
                                        Amount
                                    </label>
                                    {/* <NumberInput
                                        id="amount"
                                        className="auto-save uk-input purchase-input uk-form-small"
                                        placeholder="-"
                                        required
                                    /> */}
                                </div>

                                <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                                    <label
                                        className="uk-form-label required"
                                        htmlFor="clientAccount">
                                        Used IJG Bank Account
                                    </label>

                                    <select
                                        className="uk-select uk-form-small"
                                        id="bankAccount"
                                        name={"bankAccount"}
                                        required>
                                        <option value="" selected>Select the IJG Bank Account used for deposit</option>
                                        <option value="SBN" selected>
                                            SBN
                                        </option>
                                        <option value="NBN" selected>
                                            NBN
                                        </option>
                                    </select>

                                </div>
                            </div>

                            <div>

                                <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
                                    <label className="uk-form-label required" htmlFor="">
                                        Reference
                                    </label>
                                    <input
                                        className="uk-input uk-form-small"
                                        type="text"
                                        id="reference"
                                        name={"reference"}
                                        required
                                    />
                                </div>

                                <div className="uk-width-1-1">
                                    <label
                                        className="uk-form-label"
                                        htmlFor="clientStatus">
                                        Source Of Funds
                                    </label>
                                    <div className="uk-form-controls">
                                        <select className="uk-select uk-form-small"
                                            id="clientStatus"
                                        >
                                            <option value="">Select Source of Funds</option>
                                            <option value="No Source of Funds">No Source of Funds</option>
                                            <option value="Salary">Salary</option>
                                            <option value="Investments">Investments</option>
                                            <option value="Business Profits">Business Profits</option>
                                            <option value="Inheritance">Inheritance</option>
                                            <option value="Gift">Gift</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        <input
                                            type="text"
                                            className="uk-input uk-form-small uk-margin-small-top"
                                            placeholder="Enter other source of funds"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="uk-grid uk-grid-small uk-grid-match uk-child-width-1-3 uk-width-1-1">
                                    <div className="uk-form-controls uk-width-1-1">
                                        {/* <InstructionFileUploader
                                            onFileUpload={handlePoPFileUpload}
                                            onProvideReason={handleReasonForPoPNoAttachment}
                                            fileUrl={popFileURL}
                                            reasonForNotProvingFile={
                                                newdepositTransaction.reasonForNoProofOfPayment
                                            }
                                            label="Proof of Payment"
                                            allocation={newdepositTransaction.allocation}
                                            value={reasonForNoPoPAttachment}
                                            fileValue={popFileURL}
                                        /> */}
                                    </div>
                                    <div className="uk-form-controls uk-width-1-1">
                                        {/* <InstructionFileUploader
                                            onFileUpload={handleSourceOfFundsFileUpload}
                                            onProvideReason={
                                                handleReasonForNoSourceOfFundsAttachment
                                            }
                                            fileUrl={sourceOfFundsFileURL}
                                            reasonForNotProvingFile={
                                                newdepositTransaction.reasonForNoSourceOfFunds
                                            }
                                            label="Source of Funds"
                                            allocation={newdepositTransaction.allocation}
                                            value={reasonForNoSourceOfFundsAttachment}
                                            fileValue={sourceOfFundsFileURL}
                                        /> */}
                                    </div>
                                </div>

                            </div>

                        </div>

                        <hr className="uk-width-1-1" />
                        <div className="uk-form-controls">
                            <button type="button" className="btn btn-danger">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary">
                                Save as Draft
                                {/* {loadingSave && <div data-uk-spinner={"ratio:.5"}></div>} */}
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Submit for Approval
                                {/* {loading && <div data-uk-spinner={"ratio:.5"}></div>} */}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AccountDepositModal
