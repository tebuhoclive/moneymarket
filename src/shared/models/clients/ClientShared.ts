export interface IClientContactDetails {
    address1: string;
    address2: string;
    suburb: string;
    city: string;
    state: string;
    country: string;
    phoneNumber: string;
    cellphoneNumber: string;
    cellphoneNumberSecondary: string;
    fax: string;
    emailAddress: string;
    emailAddressSecondary: string;
    postalAddress?: string;
}

export interface IClientTaxDetails {
    tin: string;
    tinCountryOfIssue: string;
    vatNumber: string;
    reasonForNoTIN: string;
}

export interface IClientBankingDetails {
    bankName: string;
    branch: string;
    branchNumber: string;
    accountNumber: string;
    accountHolder: string;
    accountType: string;
    accountVerificationStatus: string;
    country?:string;
}

export interface IClientRelatedPartyDetails {
    id?: string;
    firstName?: string;
    surname?: string;
    idNumber?: string;
    relationship: string;
    riskRating?: string; //low //high //medium
}
export type ProfileStatus = ""| "Reviewed" | "Submitted" |"Draft Pending Submission" | "Draft Pending Review" | "Approved First Level" | "Approved Second Level" | "Approved Third Level" | "Approved"; 
export type IFIAStatus = "" |"Complaint" | "Non Complaint" | "Non Complaint: Pending FIA Submission" |"Non Complaint: Pending FIA Approval";
export type IRiskRating = "" | "Low" | "Medium" | "High"
export interface IClientRiskRating {
    id: string; //firebase Document ID
    riskRatingId: string;
    riskQuestions:{
        id:string;
        question:string;
        options: {
            option: string | number
            value: string | number
        }
        score: number;
    }
}


export interface ISupportingDocuments{
    copyOfId?: string;
    reasonForNoCopyOfId?: string;

    copyOfBirthCertificate?: string;
    reasonForNoBirthCertificateId?: string;

    guardianId?:string;
    reasonForNoGuardianId?: string;

    courtOrder?:string;
    reasonForCourtOrder?: string;

    relatedPartyForm?:string;
    reasonForNoRelatedPartyForm?: string;

    bankConfirmation?:string;
    reasonForBankConfirmation?: string;

    proofOfSourceOfFunds?:string;
    reasonForNoSourceOfFunds?: string;

    proofOfSourceOfIncome?:string;
    reasonForNoSourceOfIncome?: string;

    ijgMoneyMarketTrustMandate?:string;
    reasonForNoIJGMoneyMarketTrustMandate?: string;
}