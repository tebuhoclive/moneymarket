import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { IClientContactDetails, IClientTaxDetails, IClientBankingDetails, IClientRelatedPartyDetails, ProfileStatus } from "./ClientShared";

export const defaultLegalEntity: ILegalEntity = {
    id: "",
    entityId: "",
    oldCPNumber: null,
    entityDisplayName: "",
    clientRegisteredName: "",
    legalEntityType: "",
    yearEnd: null,
    registrationDate: Date.now(),
    clientTradingName: "",
    registrationNumber: "",
    countryOfRegistration: "",
    dateCreated: Date.now(),
    dateDeactivated: null,
    listed: null,
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
        emailAddressSecondary: ""
    },
    contactPerson:{
        contactPersonName: "",
        contactPersonCellphone: "",
        contactPersonNameAlt: "",
        contactPersonCellphoneAlt: ""
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

export interface ILegalEntityContactPerson {
    contactPersonName: string;
    contactPersonCellphone: string;
    contactPersonNameAlt: string;
    contactPersonCellphoneAlt: string;
}

export interface ILegalEntity {
    id: string;
    entityId: string;
    entityDisplayName: string;
    oldCPNumber: string | null;
    clientRegisteredName: string;
    legalEntityType: string;
    yearEnd: number | null;
    registrationDate: number;
    clientTradingName: string;
    registrationNumber: string;
    countryOfRegistration: string;
    dateCreated: number;
    dateDeactivated: number | null;
    riskRating?: string; //low medium high
    dateOfLastFIA?: string;
    dateOfNextFIA?: string;
    listed: string | null;
    clientStatus?: string; //Pending / Active / Closed / Suspended
    annualInvestmentLimit?: number;
    singleTransactionLimit?: number;
    contactDetail: IClientContactDetails;
    contactPerson: ILegalEntityContactPerson;
    taxDetail: IClientTaxDetails;
    bankingDetail: IClientBankingDetails[];
    relatedParty: IClientRelatedPartyDetails[];
    restricted?: boolean;
    reasonForRestriction?: string;
    description?: string; 
    isDuplicate?: boolean;
    entityType?: string;
    profileStatus?: ProfileStatus;
    fiaStatus?: string
}

export default class LegalEntityModel {
    private clientLegalEntity: ILegalEntity;

    constructor(private store: AppStore, clientLegalEntity: ILegalEntity) {
        makeAutoObservable(this);
        this.clientLegalEntity = clientLegalEntity;
    }

    get asJson(): ILegalEntity {
        return toJS(this.clientLegalEntity);
    }
}

