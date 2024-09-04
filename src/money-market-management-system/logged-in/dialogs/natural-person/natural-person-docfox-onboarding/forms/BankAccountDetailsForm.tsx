import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { FormEvent, ChangeEvent } from "react";

import { BankingDetailsItem } from "./BankingDetailsItem";
import React from "react";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IClientBankingDetails } from "../../../../../../shared/models/clients/ClientShared";
import { IDocFoxNaturalPerson } from "../../../../../../shared/models/clients/DocFoxNaturalPersonModel";

interface IBankAccountDetailProps {
    client: IDocFoxNaturalPerson;
    clientDocfoxData: IDocFoxNaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<IDocFoxNaturalPerson>>;
    onSubmitBankAccountInformation: (e: FormEvent<HTMLFormElement>) => void;
    onBackToClientFinancialProfile: () => void;
}

export const BankAccountDetailsForm = observer((props: IBankAccountDetailProps) => {
    const { client, clientDocfoxData, setClient, onSubmitBankAccountInformation, onBackToClientFinancialProfile } = props;

    const { store } = useAppContext();

    const user = store.auth.meJson;

    const hasCreatePermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.create === true);

    const onAddItem = () => {
        const newItem: IClientBankingDetails = {
            bankName: "",
            branch: "",
            branchNumber: "",
            accountHolder: "",
            accountType: "",
            accountNumber: "",
            accountVerificationStatus: "Pending",
        };
        const bankAccount = client.bankingDetail;
        bankAccount.push(newItem);
        setClient({ ...client, bankingDetail: bankAccount });

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

    const onItemRemove = (index: number) => {
        const bankAccount = client.bankingDetail;
        bankAccount.splice(index, 1);
        setClient({ ...client, bankingDetail: bankAccount });
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitBankAccountInformation}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Banking Details"} rightControls={
                        <>
                            {hasCreatePermission && client.bankingDetail.length !== 3 &&
                                <button className="btn btn-primary uk-margin" type="button"
                                    onClick={onAddItem}>
                                    <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                                    Bank account
                                </button>
                            }

                        </>
                    }
                    />
                    <hr className="uk-width-1-1" />
                </div>
                {client.bankingDetail.map((item, index) => (
                    <BankingDetailsItem
                        key={index}
                        index={index}
                        onItemChange={onItemChange}
                        onItemRemove={onItemRemove}
                        accountNumber={item.accountNumber}
                        accountHolder={item.accountHolder}
                        accountType={item.accountType}
                        bankName={item.bankName}
                        branch={item.branch}
                        branchNumber={item.branchNumber}
                        clientDocfoxData={clientDocfoxData.bankingDetail[0]}
                    />
                ))}

                <div className="uk-width-1-1 uk-margin uk-text-center">
                    {
                        client.bankingDetail.length !== 3 &&
                        <button className="btn btn-primary uk-margin" type="button"
                            onClick={onAddItem}>
                            <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                            Bank account
                        </button>
                    }
                </div>

                <div className="uk-width-1-1 uk-text-right">
                    <button
                        className="btn-text uk-margin-right"
                        type="button"
                        onClick={onBackToClientFinancialProfile}
                    >
                        Back
                    </button>
                    <button
                        className="btn btn-primary"
                        type="submit"
                    >
                        Next
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
});