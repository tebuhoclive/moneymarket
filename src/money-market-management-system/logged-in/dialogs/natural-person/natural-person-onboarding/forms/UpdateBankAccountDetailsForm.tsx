//import React, { useState } from "react";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { FormEvent, ChangeEvent } from "react";

import { BankingDetailsItem } from "./BankingDetailsItem";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IClientBankingDetails } from "../../../../../../shared/models/clients/ClientShared";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";

interface IBankAccountDetailProps {
    client: INaturalPerson;
    loading: Boolean;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onSubmitBankAccountInformation: (e: FormEvent<HTMLFormElement>) => void;
}

export const UpdateBankAccountDetailsForm = observer((props: IBankAccountDetailProps) => {
    const { client, loading, setClient, onSubmitBankAccountInformation } = props;

    const { store } = useAppContext();

    const user = store.auth.meJson;

    const hasCreatePermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.create === true);

    //const [selectedBankName, setSelectedBankName] = useState(""); // Added state for selected bank name

    let bankAccounts: IClientBankingDetails[] = [];

    if (client && client.bankingDetail) {
        if (Array.isArray(client.bankingDetail)) {
            // Test environment: bankDetails is an array of maps
            bankAccounts = client.bankingDetail.map((b) => { return b });
        } else if (typeof client.bankingDetail === "object") {

            const { bankName, accountHolder, accountNumber, branchNumber } = client.bankingDetail;

            bankAccounts.push({
                bankName: bankName,
                branch: "",
                branchNumber: branchNumber,
                accountNumber: accountNumber,
                accountHolder: accountHolder,
                accountType: "",
                accountVerificationStatus: ""
            });
        }
    }

    const onAddItem = () => {

        let bankAccounts: IClientBankingDetails[] = [];

        if (client && client.bankingDetail) {
            if (Array.isArray(client.bankingDetail)) {
                bankAccounts = client.bankingDetail.map((b) => { return b });
            } else if (typeof client.bankingDetail === "object") {

                const { bankName, accountHolder, accountNumber, branchNumber } = client.bankingDetail;

                bankAccounts.push({
                    bankName: bankName,
                    branch: "",
                    branchNumber: branchNumber,
                    accountNumber: accountNumber,
                    accountHolder: accountHolder,
                    accountType: "",
                    accountVerificationStatus: ""
                });
            }
        }

        const newItem: IClientBankingDetails = {
            bankName: "",
            branch: "",
            branchNumber: "",
            accountHolder: "",
            accountType: "",
            accountNumber: "",
            accountVerificationStatus: "Pending",
        };
        const _bankAccount: IClientBankingDetails[] = [];

        // _bankAccount.push(bankAccounts);
        // setClient({ ...client, bankingDetail: _bankAccount });

        // Push each item from bankAccounts into _bankAccount
        bankAccounts.forEach((account) => {
            _bankAccount.push(account);
        });
        
        _bankAccount.push(newItem);

        // Now _bankAccount contains all items from bankAccounts
        setClient({ ...client, bankingDetail: _bankAccount });
    };

    const onItemChange = (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        runInAction(() => {
            const bankAccount = client.bankingDetail;
            const name = e.target.name;
            const value = e.target.value;
            bankAccount[index] = { ...bankAccount[index], [name]: value };
            setClient({ ...client, bankingDetail: bankAccount });
        })
    };

    const onItemChangeBranchNumberAndBankName = (index: number, branchNumber: string, bankName: string) => {
        runInAction(() => {
            const bankAccount = client.bankingDetail.slice(); // Create a shallow copy of bankingDetail array
            bankAccount[index] = { ...bankAccount[index], branchNumber: branchNumber }; // Update the branchNumber of the item at the given index
            bankAccount[index] = { ...bankAccount[index], bankName: bankName };
            setClient({ ...client, bankingDetail: bankAccount }); // Update the client state
        });
    };


    const onItemRemove = (index: number) => {
        const bankAccount = client.bankingDetail;
        bankAccount.splice(index, 1);
        setClient({ ...client, bankingDetail: bankAccount });
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid onSubmit={onSubmitBankAccountInformation}>

                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Banking Details"} rightControls={
                        <>
                            {hasCreatePermission && client.bankingDetail.length !== 3 &&
                                <button className="btn btn-primary uk-margin" type="button" onClick={onAddItem}>
                                    <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                                    Bank account
                                </button>
                            }
                        </>
                    } />
                    <hr className="uk-width-1-1" />
                </div>

                {bankAccounts.map((item, index) => (
                    <BankingDetailsItem
                        key={index}
                        index={index}
                        onItemChange={onItemChange}
                        onItemRemove={onItemRemove}
                        onItemChangeBranchNumberAndBankName={onItemChangeBranchNumberAndBankName}
                        accountNumber={item.accountNumber}
                        accountHolder={item.accountHolder}
                        accountType={item.accountType}
                        bankName={item.bankName}
                        branch={item.branch}
                        branchNumber={item.branchNumber}
                    />
                ))}
                <div className="uk-width-1-1 uk-text-right">
                    <button className="btn btn-primary" type="submit" >
                        Add {loading && <span data-uk-spinner={"ratio:.5"}></span>}
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
});
