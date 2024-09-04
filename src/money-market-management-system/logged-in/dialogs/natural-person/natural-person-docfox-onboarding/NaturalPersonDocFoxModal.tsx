import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import swal from "sweetalert";
import { ClientInformationForm } from "./forms/ClientInformationForm";
import { FICA } from "./forms/FICAForm";
import { ContactDetailsForm } from "./forms/ContactDetailsForm";
import { BankAccountDetailsForm } from "./forms/BankAccountDetailsForm";
import { TaxDetailsForm } from "./forms/TaxDetailsForm";
import { RelatedPartyDetailsForm } from "./forms/RelatedPartyDetailsForm";
import React from "react";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";
import { toTitleCase } from "../../../../../shared/functions/Directives";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IDocFoxNaturalPerson, defaultDocFoxNaturalPerson } from "../../../../../shared/models/clients/DocFoxNaturalPersonModel";
import { IDocFoxProfile, defaultKYCProfileNames } from "../../../../../shared/models/clients/DocFoxProfileNamesModel";
import { IEntityId } from "../../../../../shared/models/clients/EntityIdModel";
import { IDocFoxProfileAdditionalDetails, defaultKYCProfileAdditionalDetails } from "../../../../../shared/models/clients/docfox-profile/DocFoxProfileAdditionalDetailsModel";
import { IDocFoxProfileAddresses, defaultKYCProfileAddresses } from "../../../../../shared/models/clients/docfox-profile/DocFoxProfileAddressesModel";
import { IDocFoxProfileContacts, defaultKYCProfileContacts } from "../../../../../shared/models/clients/docfox-profile/DocFoxProfileContactsModel";
import { IDocFoxProfileNumbers, defaultKYCProfileNumbers } from "../../../../../shared/models/clients/docfox-profile/DocFoxProfileNumbersModel";
import { generateNextValue } from "../../../../../shared/utils/utils";
import MODAL_NAMES from "../../ModalName";


interface ITabsProps {
    tab: "Personal" | "Contact" | "Banking" | "FICA" | "Tax" | "Related";
    setTab: React.Dispatch<React.SetStateAction<"Personal" | "Contact" | "Banking" | "FICA" | "Tax" | "Related">>;
}

const Tabs = (props: ITabsProps) => {
    const activeClass = (tab: "Personal" | "Contact" | "Banking" | "FICA" | "Tax" | "Related") => {
        if (props.tab === tab) return "uk-active";
        return "";
    };

    return (
        <div className="uk-margin-small-bottom">
            <ul className="kit-tabs" data-uk-tab>
                <li
                    className={activeClass("Personal")}
                    onClick={() => props.setTab("Personal")}
                >
                    <a href="void(0)">Personal Details</a>
                </li>
                <li
                    className={activeClass("Contact")}
                    onClick={() => props.setTab("Contact")}
                >
                    <a href="void(0)">Contact Detail</a>
                </li>
                <li
                    className={activeClass("Banking")}
                    onClick={() => props.setTab("Banking")}
                >
                    <a href="void(0)">Banking Detail</a>
                </li>
                <li
                    className={activeClass("FICA")}
                    onClick={() => props.setTab("FICA")}
                >
                    <a href="void(0)">FICA</a>
                </li>
                <li
                    className={activeClass("Tax")}
                    onClick={() => props.setTab("Tax")}
                >
                    <a href="void(0)">Tax Detail</a>
                </li>
                <li
                    className={activeClass("Related")}
                    onClick={() => props.setTab("Related")}
                >
                    <a href="void(0)">Related Party</a>
                </li>
            </ul>
        </div>
    );
};


const NaturalPersonDocFoxModal = observer(() => {

    const { api, store } = useAppContext();

    const [tab, setTab] = useState<"Personal" | "Contact" | "Banking" | "FICA" | "Tax" | "Related">("Personal");
    const [loading, setLoading] = useState(false);

    const [clientProfile, setClientProfile] = useState<IDocFoxProfile>({ ...defaultKYCProfileNames });
    const [clientContacts, setClientContacts] = useState<IDocFoxProfileContacts>({ ...defaultKYCProfileContacts });
    const [clientNumbers, setClientNumbers] = useState<IDocFoxProfileNumbers>({ ...defaultKYCProfileNumbers });
    const [clientAddresses, setClientAddresses] = useState<IDocFoxProfileAddresses>({ ...defaultKYCProfileAddresses });
    const [clientAdditionalDetails, setClientAdditionalDetails] = useState<IDocFoxProfileAdditionalDetails>({ ...defaultKYCProfileAdditionalDetails });

    const clientRiskRating = store.docFoxApplicationRiskRating.all.filter(clientRiskRating => clientRiskRating.asJson.status === "complete")

    // const clientRiskRating = store.docFoxApplicationRiskRating.all

    const clientDocfoxData: IDocFoxNaturalPerson = {
        id: "",
        entityId: "",
        entityDisplayName: "",
        oldCPNumber: null,
        clientName: clientProfile.firstName,
        clientSurname: clientProfile.lastName,
        clientTitle: "",
        clientClassification: "",
        idType: clientNumbers.idType,
        idNumber: clientNumbers.idNumber,
        idCountry: clientNumbers.idCountry,
        idExpiry: clientNumbers.idExpiry || "",
        dateCreated: "",
        dateDeactivated: "",
        riskRating: toTitleCase(clientRiskRating[0]?.asJson.rating || ""),
        dateOfLastFIA: null,
        dateOfNextFIA: null,
        dateOfBirth: clientAdditionalDetails.dateOfBirth,
        deceased: false,
        dateOfDeath: "",
        annualIncome: 0,
        clientStatus: "",
        annualInvestmentLimit: 0,
        singleTransactionLimit: 0,
        countryNationality: clientAdditionalDetails.nationality,
        restricted: false,
        reasonForRestriction: "",
        entityType: clientProfile.entityType,
        contactDetail: {
            address1: clientAddresses.physical.address_line_one,
            address2: clientAddresses.physical.address_line_two,
            suburb: clientAddresses.physical.suburb,
            city: clientAddresses.physical.city,
            state: clientAddresses.physical.state,
            country: clientAddresses.physical.country,
            phoneNumber: "",
            cellphoneNumber: clientContacts.cellphoneNumber,
            cellphoneNumberSecondary: clientContacts.cellphoneNumberSecondary,
            fax: "",
            emailAddress: clientContacts.emailAddress,
            emailAddressSecondary: clientContacts.emailAddressSecondary
        },
        taxDetail: {
            tin: "",
            tinCountryOfIssue: "",
            vatNumber: "",
            reasonForNoTIN: ""
        },
        bankingDetail: [
            {
                bankName: clientAdditionalDetails.bankName,
                branch: clientAdditionalDetails.bankBranchName,
                branchNumber: clientAdditionalDetails.bankBranchCode,
                accountNumber: clientAdditionalDetails.bankAccountNumber,
                accountType: clientAdditionalDetails.bankAccountType,
                accountHolder: "",
                accountVerificationStatus: "",
            }
        ],
        relatedParty: []
    }

    const [client, setClient] = useState<IDocFoxNaturalPerson>({ ...defaultDocFoxNaturalPerson });

    const [entityId, setEntityId] = useState("");
    const [currentId, setCurrentId] = useState("");

    const onSubmitRelatedParty = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const createItem: IDocFoxNaturalPerson = {
            ...client,
            entityId: currentId,
            clientName: clientDocfoxData.clientName ? clientDocfoxData.clientName : client.clientName,
            clientSurname: clientDocfoxData.clientSurname ? clientDocfoxData.clientSurname : client.clientSurname,
            idType: clientDocfoxData.idType ? clientDocfoxData.idType : client.idType,
            idNumber: clientDocfoxData.idNumber ? clientDocfoxData.idNumber : client.idNumber,
            idCountry: clientDocfoxData.idCountry ? clientDocfoxData.idCountry : client.idCountry,
            idExpiry: clientDocfoxData.idExpiry ? clientDocfoxData.idExpiry : client.idExpiry,
            dateOfBirth: clientDocfoxData.dateOfBirth ? clientDocfoxData.dateOfBirth : client.dateOfBirth,
            countryNationality: clientDocfoxData.countryNationality ? clientDocfoxData.countryNationality : client.countryNationality,
            entityType: clientDocfoxData.entityType ? clientDocfoxData.entityType : client.entityType,
            contactDetail: {
                address1: clientDocfoxData.contactDetail.address1 ? clientDocfoxData.contactDetail.address1 : client.contactDetail.address1,
                address2: clientDocfoxData.contactDetail.address2 ? clientDocfoxData.contactDetail.address2 : client.contactDetail.address2,
                suburb: clientDocfoxData.contactDetail.suburb ? clientDocfoxData.contactDetail.suburb : client.contactDetail.suburb,
                city: clientDocfoxData.contactDetail.city ? clientDocfoxData.contactDetail.city : client.contactDetail.city,
                state: clientDocfoxData.contactDetail.state ? clientDocfoxData.contactDetail.state : client.contactDetail.state,
                country: clientDocfoxData.contactDetail.country ? clientDocfoxData.contactDetail.country : client.contactDetail.country,
                phoneNumber: clientDocfoxData.contactDetail.phoneNumber ? clientDocfoxData.contactDetail.phoneNumber : client.contactDetail.phoneNumber,
                cellphoneNumber: clientDocfoxData.contactDetail.cellphoneNumber ? clientDocfoxData.contactDetail.cellphoneNumber : client.contactDetail.cellphoneNumber,
                cellphoneNumberSecondary: clientDocfoxData.contactDetail.cellphoneNumberSecondary ? clientDocfoxData.contactDetail.cellphoneNumberSecondary : client.contactDetail.cellphoneNumberSecondary,
                fax: clientDocfoxData.contactDetail.fax ? clientDocfoxData.contactDetail.fax : client.contactDetail.fax,
                emailAddress: clientDocfoxData.contactDetail.emailAddress ? clientDocfoxData.contactDetail.emailAddress : client.contactDetail.emailAddress,
                emailAddressSecondary: clientDocfoxData.contactDetail.emailAddressSecondary ? clientDocfoxData.contactDetail.emailAddressSecondary : client.contactDetail.emailAddressSecondary
            },
            bankingDetail: [
                {
                    bankName: clientDocfoxData.bankingDetail[0].bankName ? clientDocfoxData.bankingDetail[0].bankName : client.bankingDetail[0].bankName,
                    branch: clientDocfoxData.bankingDetail[0].branch ? clientDocfoxData.bankingDetail[0].branch : client.bankingDetail[0].branch,
                    branchNumber: clientDocfoxData.bankingDetail[0].branchNumber ? clientDocfoxData.bankingDetail[0].branchNumber : client.bankingDetail[0].branchNumber,
                    accountNumber: clientDocfoxData.bankingDetail[0].accountNumber ? clientDocfoxData.bankingDetail[0].accountNumber : client.bankingDetail[0].accountNumber,
                    accountHolder: clientDocfoxData.bankingDetail[0].accountHolder ? clientDocfoxData.bankingDetail[0].accountHolder : client.bankingDetail[0].accountHolder,
                    accountType: clientDocfoxData.bankingDetail[0].accountType ? clientDocfoxData.bankingDetail[0].accountType : client.bankingDetail[0].accountType,
                    accountVerificationStatus: clientDocfoxData.bankingDetail[0].accountVerificationStatus ? clientDocfoxData.bankingDetail[0].accountVerificationStatus : client.bankingDetail[0].accountVerificationStatus,
                }
            ],

            relatedParty: [
                ...client.relatedParty
            ]

        };

        const saveId: IEntityId = {
            id: "TURwHEkCzkSRVcbjdtTk",
            entityId: currentId,
            createdOn: Date.now()
        }

        await create(createItem, saveId);
        store.client.naturalPerson.select(createItem);
        // showModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_NATURAL_PERSON_MODAL);

        setLoading(false);
        onCancel();
    };

    // const update = async (item: IDocFoxNaturalPerson) => {
    //     try {
    //         await api.client.naturalPerson.update(item);
    //         swal({
    //             icon: "Success",
    //             text: "Entity details updated!"
    //         })
    //     } catch (error) {
    //     }
    // };

    const create = async (item: IDocFoxNaturalPerson, saveId: IEntityId) => {
        item.entityDisplayName = `${item.clientSurname} ${item.clientName}`
        const kycProfiles: IDocFoxProfile = {
            ...clientProfile,
            systemOnBoardingStatus: "on-boarded"
        }
        try {
            await api.client.naturalPerson.create(item);
            await api.docfox.kycProfiles.updateKYCProfile(kycProfiles);
            await api.client.entityId.update(saveId);

            //send the request to verify the account
            swal({
                icon: "success",
                text: "Successful entity on-boarding!"
            })
        } catch (error) {
            console.log(error);
        }
    };

    const onCancel = () => {
        store.client.naturalPerson.clearSelected();
        setTab("Personal")
        setClient({ ...defaultDocFoxNaturalPerson });
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_NATURAL_PERSON_MODAL);
    };

    const onSubmitClientInformation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Contact");
    };

    const onBackToClientInformation = () => {
        setTab("Personal");
    };

    const onSubmitClientFinancialProfile = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Banking");
    };

    const onBackToClientFinancialProfile = () => {
        setTab("Contact");
    };

    const onSubmitBankAccountInformation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("FICA");
    };

    const onBackToBankAccountInformation = () => {
        setTab("Banking");
    };

    const onSubmitFICA = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Tax");
    };

    const onBackToFICA = () => {
        setTab("FICA");
    };

    const onSubmitTaxDetail = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTab("Related");
    };

    const onBackToTaxDetail = () => {
        setTab("Tax");
    };

    useEffect(() => {
        if (store.docFoxProfile.selected) {
            const loadRiskRating = async () => {
                const profile = store.docFoxProfile.selected;
                await api.docfox.kycApplications.getKYCApplicationRiskRatings(profile?.kycApplicationId || "");
            }
            loadRiskRating();
            setClientProfile(store.docFoxProfile.selected);
        }

        if (store.docFoxProfileContacts.selected) {
            setClientContacts(store.docFoxProfileContacts.selected);
        } 
        // else {
        //     swal({
        //         icon: "error",
        //         text: "Check client contact numbers"
        //     })
        // }

        if (store.docFoxProfileNumbers.selected) {
            setClientNumbers(store.docFoxProfileNumbers.selected);
        } 
        // else {
        //     swal({
        //         icon: "error",
        //         text: "Check client numbers"
        //     })
        // }

        if (store.docFoxProfileAddresses.selected) {
            setClientAddresses(store.docFoxProfileAddresses.selected);
        } 
        // else {
        //     swal({
        //         icon: "error",
        //         text: "Check client addresses"
        //     })
        // }

        if (store.docFoxProfileAdditionalDetails.selected) {
            setClientAdditionalDetails(store.docFoxProfileAdditionalDetails.selected);
        } 
        // else {
        //     swal({
        //         icon: "error",
        //         text: "Check client additional details"
        //     })
        // }

    }, [api.docfox.kycApplications, store.docFoxProfile.selected, store.docFoxProfileAdditionalDetails.selected, store.docFoxProfileAddresses.selected, store.docFoxProfileContacts.selected, store.docFoxProfileNumbers.selected]);

    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                await api.client.entityId.getId();
                setLoading(true);
                setEntityId(store.entityId.id);
                const nextEntityId = generateNextValue(entityId);
                setCurrentId(nextEntityId);
                setLoading(false);
                setLoading(false);

            } catch (error) {
                console.log(error);
            }
        };

        loadAll();
    }, [api.client.entityId, entityId, store.entityId.id]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-padding-medium uk-margin-auto-vertical uk-width-1-2">
            {
                loading && <LoadingEllipsis />
            }
            {
                !loading &&
                <>
                    <button className="uk-modal-close-default" type="button" data-uk-close onClick={onCancel} />
                    <h4 className="main-title-sm">NEW ENTITY (NATURAL PERSON) - DocFox ONBOARDING</h4>
                    <h3 className="uk-modal-title uk-margin-remove">New Entity ID {currentId}</h3>
                    <div className="dialog-content uk-position-relative">
                        <Tabs tab={tab} setTab={setTab} />
                        {tab === "Personal" && (
                            <ClientInformationForm
                                clientDocfoxData={clientDocfoxData}
                                client={client}
                                setClient={setClient}
                                onSubmitClientInformation={onSubmitClientInformation}
                                onCancel={onCancel}
                            />
                        )}

                        {tab === "Contact" && (
                            <ContactDetailsForm
                                clientDocfoxData={clientDocfoxData}
                                client={client}
                                setClient={setClient}
                                onSubmitClientFinancialProfile={onSubmitClientFinancialProfile}
                                onBackToClientInformation={onBackToClientInformation} />
                        )}
                        {tab === "Banking" && (
                            <BankAccountDetailsForm
                                clientDocfoxData={clientDocfoxData}
                                client={client}
                                setClient={setClient}
                                onSubmitBankAccountInformation={onSubmitBankAccountInformation}
                                onBackToClientFinancialProfile={onBackToClientFinancialProfile}
                            />
                        )}

                        {tab === "FICA" && (
                            <FICA
                                clientDocfoxData={clientDocfoxData}
                                client={client}
                                setClient={setClient}
                                onSubmitFICA={onSubmitFICA}
                                onBackToBankDetail={onBackToBankAccountInformation} />
                        )}

                        {tab === "Tax" && (
                            <TaxDetailsForm
                                client={client}
                                setClient={setClient}
                                onSubmitTaxDetail={onSubmitTaxDetail}
                                onBackToBankAccountInformation={onBackToFICA}
                            />
                        )}
                        {tab === "Related" && (
                            <RelatedPartyDetailsForm
                                client={client}
                                setClient={setClient}
                                onSubmitRelatedParty={onSubmitRelatedParty}
                                onBackToTaxDetail={onBackToTaxDetail}
                                loading={loading}
                            />
                        )}
                    </div>
                </>
            }
        </div>
    );
});

export default NaturalPersonDocFoxModal;