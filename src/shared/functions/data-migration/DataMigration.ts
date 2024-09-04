import AppApi from "../../apis/AppApi";
import AppStore from "../../stores/AppStore";
import { read, utils } from "xlsx";
import { generateNextValueWithIncrement } from "../../utils/utils";
import { ILegalEntity, defaultLegalEntity } from "../../models/clients/LegalEntityModel";
import { INaturalPerson, defaultNaturalPerson } from '../../models/clients/NaturalPersonModel';
import { splitAndTrimString } from "../StringFunctions";
import { allBanks, getUniversalBankCode } from "../Banks";

export interface IClientStaticDataImport {
    'CounterParty Code': string,
    'Counterparty Name': string,
    'Phone': string,
    'ID / Registration Number': string,
    'Cell Phone': string,
    'Address Line 1': string, // postal address
    'Address Line 2': string, // city
    'Address Line 3': string, // street
    'Address Line 4': string, // country
    'Email Address': string,
    'Entity Type': string,
    'Sub Entity Type': string,
    'First Name': string,
    'Last Name': string,
    'Legal Entity Name': string,
    'Bank Name': string,
    'Branch Name': string,
    'Branch Code': string,
    'Account Holder': string,
    'Account Number': string,
    'Account Type': string,
    'Description' : string
}


export const importClientStaticDataFromExcel = async (file: File | null, api: AppApi, store: AppStore) => {
    console.log("Here now", file);
    
    if (file && file !== null) {
        console.log("Here now 2");
        const wb = read(await file.arrayBuffer());
        const data = utils.sheet_to_json<IClientStaticDataImport>(wb.Sheets[wb.SheetNames[0]]);

        const importDataAsJson = data.map((data: IClientStaticDataImport, index) => ({
            counterPartyCode: data["CounterParty Code"],
            counterPartyName: data["Counterparty Name"],
            phone: data.Phone,
            cellPhone: data["Cell Phone"],
            addressLineOne: data["Address Line 1"],
            addressLineTwo: data["Address Line 2"],
            addressLineThree: data["Address Line 3"],
            addressLineFour: data["Address Line 4"],
            emailAddress: data["Email Address"],
            entityType: data["Entity Type"],
            subEntityType: data["Entity Type"],
            firstName: data["First Name"],
            lastName: data["Last Name"],
            legalEntityName: data["Legal Entity Name"],
            bankName: data["Bank Name"],
            branchName: data["Branch Name"],
            branchCode: data["Branch Code"],
            accountHolder: data["Account Holder"],
            accountNumber: data["Account Number"],
            accountType: data["Account Type"],
        }));

        console.log("File", importDataAsJson);
        

        const naturalPerson = importDataAsJson.filter(
            naturalPerson => naturalPerson.entityType === 'I'
        )
        const legalEntity = importDataAsJson.filter(
            legalEntity => legalEntity.entityType === 'LE'
        )

        const naturalPersonImportDataAsJson: INaturalPerson[] = naturalPerson.map((data, index) => ({
            ...defaultNaturalPerson,
            entityId: generateNextValueWithIncrement('E', index + 1),
            oldCPNumber: data.counterPartyCode,
            entityDisplayName: `${data.firstName} ${data.lastName}`,
            entityType: data.subEntityType,
            clientName: data.firstName,
            clientSurname: data.lastName,
            contactDetail: {
                address1: data.addressLineThree || "",
                address2: "",
                suburb: "",
                city: data.addressLineTwo || "",
                state: "",
                country: data.addressLineFour || "",
                phoneNumber: data.phone || "",
                cellphoneNumber: data.cellPhone || "",
                cellphoneNumberSecondary: "",
                fax: "",
                emailAddress: splitAndTrimString(';', data.emailAddress)[1] || "",
                emailAddressSecondary: splitAndTrimString(';', data.emailAddress)[2] || "",
                postalAddress: data.addressLineOne
            },
            bankingDetail: [{
                bankName: data.bankName || "",
                accountType: data.accountType || "",
                branch: data.branchName || "",
                branchNumber: getUniversalBankCode(data.bankName, allBanks) || "",
                accountNumber: data.accountNumber || "",
                accountHolder: data.accountHolder || "",
                accountVerificationStatus: "not-verified",
            }],
        }));

        const legalImportDataAsJson: ILegalEntity[] = legalEntity.map((data, index) => ({
            ...defaultLegalEntity,
            entityId: generateNextValueWithIncrement('E', index + 1),
            oldCPNumber: data.counterPartyCode,
            entityDisplayName: `${data.firstName} ${data.lastName}`,
            entityType: data.subEntityType,
            clientRegisteredName: data.legalEntityName,
            contactDetail: {
                address1: data.addressLineThree || "",
                address2: "",
                suburb: "",
                city: data.addressLineTwo || "",
                state: "",
                country: data.addressLineFour || "",
                phoneNumber: data.phone || "",
                cellphoneNumber: data.cellPhone || "",
                cellphoneNumberSecondary: "",
                fax: "",
                emailAddress: splitAndTrimString(';', data.emailAddress)[1] || "",
                emailAddressSecondary: splitAndTrimString(';', data.emailAddress)[2] || "",
                postalAddress: data.addressLineOne
            },
            bankingDetail: [{
                bankName: data.bankName || "",
                accountType: data.accountType || "",
                branch: data.branchName || "",
                branchNumber: getUniversalBankCode(data.bankName, allBanks) || "",
                accountNumber: data.accountNumber || "",
                accountHolder: data.accountHolder || "",
                accountVerificationStatus: "not-verified",
            }],
        }));

        try {

            for (let index = 0; index < naturalPersonImportDataAsJson.length; index++) {
                const clientRecord = naturalPersonImportDataAsJson[index];
                await api.client.naturalPerson.create(clientRecord);
                await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
                console.log("Created:", clientRecord.annualIncome);
                
            }

            for (let index = 0; index < legalImportDataAsJson.length; index++) {
                const clientRecord = legalImportDataAsJson[index];
                await api.client.legalEntity.create(clientRecord);
                await new Promise(resolve => setTimeout(resolve, 200)); // Wait two seconds before adding the next record to the database
            }


        } catch (error) {
            console.log(error);
            
        }
    
    
    }
}

export const importClientAdditionalBankAccountDataFromExcel = () => {

}

export const importClientMoneyMarketAccountDataFromExcel = () => {

}

export const importIJGProductDataFromExcel = () => {

}