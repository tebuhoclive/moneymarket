import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { IClientContactDetails, IClientTaxDetails, IClientBankingDetails, IClientRelatedPartyDetails, ISupportingDocuments, IClientRiskRating, ProfileStatus } from "./ClientShared";

export const defaultNaturalPerson: INaturalPerson = {
    id: "",
    entityId: "",
    oldCPNumber: null,
    entityDisplayName: "",
    clientName: "",
    clientSurname: "",
    clientTitle: "",
    clientClassification: "",
    idType: "",
    idNumber: "",
    idCountry: "",
    idExpiry: "",
    dateCreated: "",
    dateDeactivated: "",
    riskRating: "",
    dateOfLastFIA: null,
    dateOfNextFIA: null,
    dateOfBirth: "",
    deceased: false,
    dateOfDeath: "",
    annualIncome: 0,
    clientStatus: "Pending",
    annualInvestmentLimit: 0,
    singleTransactionLimit: 0,
    countryNationality: "",
    restricted: false,
    reasonForRestriction: "",
    entityType: "",
    contactDetail: {
        address1: "",
        address2: "",
        suburb: "",
        city: "",
        state: "",
        country: "",
        phoneNumber: "",
        cellphoneNumber: "",
        cellphoneNumberSecondary: "",
        fax: "",
        emailAddress: "",
        emailAddressSecondary: "",
    },
    taxDetail: {
        tin: "",
        tinCountryOfIssue: "",
        vatNumber: "",
        reasonForNoTIN: ""
    },
    bankingDetail: [],
    relatedParty: []
}
export interface INaturalPerson {
    id: string;
    entityId: string;
    entityDisplayName: string;
    oldCPNumber: string | null;
    counterPartyName?: string,
    clientName: string;
    clientSurname: string;
    clientTitle: string; //Mr/Ms/Mrs/ Dr
    clientClassification: string;
    idType: string; //ID / Passport
    idNumber: string;
    idCountry: string;
    idExpiry: string;

    dateCreated: string;
    dateDeactivated: string;

    riskRatingId?: string;
    riskRating: string; //low medium high

    clientRiskRating?: IClientRiskRating

    dateOfLastFIA: number | null;
    dateOfNextFIA: number | null;

    dateOfBirth: string;
    deceased: boolean;
    dateOfDeath: string;

    annualIncome: number;
    clientStatus: string; //Pending / Active / Closed / Suspended
    checkClientAccount?: string;

    sourceOfWealth?: string;
    annualInvestmentLimit: number;
    singleTransactionLimit: number;
    countryNationality: string;
    restricted: boolean;
    reasonForRestriction: string; // Reason FIC / KYC / Court order

    entityType: string;
    currentAccount?: string;
    contactDetail: IClientContactDetails;
    taxDetail: IClientTaxDetails;

    bankingDetail: IClientBankingDetails[];
    relatedParty: IClientRelatedPartyDetails[];
    description?: string;
    isDuplicate?: boolean;
    createdBy?: string;

    supportingDocuments?: ISupportingDocuments;

    isMinor?: string;
    maritalStatus?: string;
    employmentStatus?: string;
    employer?: string;
    gender?: string;
    countryOfResidence?: string;

    profileStatus?: ProfileStatus;
    fiaStatus?: string;

    timeDrafted?: number;
    lastUpdated?: number;
    timeApprovedForFirstLevel?: number;
    timeApprovedForSecondLevel?: number;
    timeApprovedForThirdLevel?: number;
    timeApproved?: number;
    timeDeleted?: number;

    pageOneCompleted?: boolean,
    pageTwoCompleted?: boolean,
    pageThreeCompleted?: boolean,
    pageFourCompleted?: boolean,
    pageFiveCompleted?: boolean,
}

export default class NaturalPersonModel {
    private naturalPerson: INaturalPerson;

    constructor(private store: AppStore, naturalPerson: INaturalPerson) {
        makeAutoObservable(this);
        this.naturalPerson = naturalPerson;
    }

    get asJson(): INaturalPerson {
        return toJS(this.naturalPerson);
    }
}