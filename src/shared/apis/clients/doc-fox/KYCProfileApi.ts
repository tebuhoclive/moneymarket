import axios from "axios";
import { db } from "../../../config/firebase-config";
import { IDocFoxProfile } from "../../../models/clients/DocFoxProfileNamesModel";
import AppStore from "../../../stores/AppStore";
import AppApi from "../../AppApi";
import { Unsubscribe, collection, doc, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore";
import { IDocFoxProfileContacts } from '../../../models/clients/docfox-profile/DocFoxProfileContactsModel';
import { IDocFoxProfileNumbers } from "../../../models/clients/docfox-profile/DocFoxProfileNumbersModel";
import { IDocFoxProfileAddresses } from "../../../models/clients/docfox-profile/DocFoxProfileAddressesModel";
import { IDocFoxProfileAdditionalDetails } from '../../../models/clients/docfox-profile/DocFoxProfileAdditionalDetailsModel';

export default class KYCProfileApi {
    constructor(private api: AppApi, private store: AppStore) {
    }

    private kycProfilesPath = () => {
        return "kycProfiles";
    }

    private contacts: IDocFoxProfileContacts = {
        id: "",
        emailAddress: "",
        emailAddressSecondary: "",
        cellphoneNumber: "",
        cellphoneNumberSecondary: "",
        workNumber: "",
        workNumberSecondary: ""
    }

    // private numbers: IDocFoxProfileNumbers = {
    //     id: "",
    //     idExpiry: null,
    //     idCountry: "",
    //     idType: "",
    //     idNumber: ""
    // }

    private addresses: IDocFoxProfileAddresses = {
        id: "",
        physical: {
            address_line_one: "",
            address_line_two: "",
            city: "",
            country: "",
            state: "",
            suburb: ""
        },
        postal: ""
    }

    private additionalDetails: IDocFoxProfileAdditionalDetails = {
        id: "",
        nationality: "",
        bankAccountNumber: "",
        employerName: "",
        bankName: "",
        occupation: "",
        dateOfBirth: "",
        bankAccountType: "",
        bankBranchName: "",
        bankBranchCode: ""
    }

    async getKYCProfilesFromDocFox(profileId: string, applicationId: string, entityType: string) {

        const kycProfileNamesUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCProfileNames';

        try {
            const response = await axios.get(kycProfileNamesUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Profile-Id": profileId,
                },
            });

            const profile: IDocFoxProfile = {
                id: profileId,
                kycApplicationId: applicationId,
                lastName: response.data.data[0].attributes.slug === "last_names" ? response.data.data[0].attributes.value : response.data.data[1].attributes.value,
                firstName: response.data.data[1].attributes.slug === "first_names" ? response.data.data[1].attributes.value : response.data.data[0].attributes.value,
                entityType: entityType,
                systemOnBoardingStatus: "pending"
            }
            this.createKYCProfile(profile);
        } catch (error) {
            console.log(error);
        }
    }

    async getKYCProfilesFromDatabase() {

        this.store.docFoxProfile.removeAll();

        const path = this.kycProfilesPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const profiles: IDocFoxProfile[] = [];
                querySnapshot.forEach((doc) => {
                    profiles.push({ id: doc.id, ...doc.data() } as IDocFoxProfile);
                });
                this.store.docFoxProfile.load(profiles);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.kycProfilesPath();
        if (!path) return;

        try {
            const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
                if (!doc.exists) return;
                const item = { id: doc.id, ...doc.data() } as IDocFoxProfile;
                this.store.docFoxProfile.load([item]);
            });

            return unsubscribe;
        } catch (error) {
            console.log(error);

        }
    }

    async createKYCProfile(profile: IDocFoxProfile) {
        const path = this.kycProfilesPath();
        if (!path) return;

        const itemRef = doc(collection(db, path), profile.id)
        try {
            await setDoc(itemRef, profile, { merge: true, })
        } catch (error) {
            console.log(error);
        }

    }

    async updateKYCProfile(profile: IDocFoxProfile) {

        const path = this.kycProfilesPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, profile.id), {
                ...profile,
            });
            this.store.docFoxProfile.load([profile]);
        } catch (error) { }
    }

    //update

    //delete


    //Profile Links

    async getKYCProfileContacts(profileId: string) {
        let profileContacts = {}

        const kycProfileContactUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCProfileContacts';

        try {
            const response = await axios.get(kycProfileContactUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Profile-Id": profileId,
                },
            });

            const responseData = response.data.data;
            console.log("KYC Profile Contact", responseData);
            

            if (responseData) {
                const profileContacts: IDocFoxProfileContacts[] = responseData.map((profileContact: any) => ({
                    id: this.contacts.id = profileId,
                    emailAddress: profileContact.attributes.slug === "primary_contact_information" ? this.contacts.emailAddress = profileContact.attributes.email : "",
                    emailAddressSecondary: profileContact.attributes.slug !== "primary_contact_information" ? this.contacts.emailAddressSecondary = profileContact.attributes.email : "",
                    cellphoneNumber: profileContact.attributes.slug === "primary_contact_information" ? this.contacts.cellphoneNumber = profileContact.attributes.mobile_number : "",
                    cellphoneNumberSecondary: profileContact.attributes.slug !== "primary_contact_information" ? this.contacts.cellphoneNumberSecondary = profileContact.attributes.cellphone : "",
                    workNumber: profileContact.attributes.slug === "primary_contact_information" ? this.contacts.workNumber = profileContact.attributes.cellphone : "",
                    workNumberSecondary: profileContact.attributes.slug !== "primary_contact_information" ? this.contacts.workNumberSecondary = profileContact.attributes.cellphone : "",
                }));
                this.store.docFoxProfileContacts.load(profileContacts);
            }
            this.store.docFoxProfileContacts.load([]);
        } catch (error) {
            console.log(error);
        }

        return profileContacts
    }

    async getKYCProfileNumbers(profileId: string) {
        const kycProfileNumbersUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCProfileNumbers';

        try {
            const response = await axios.get(kycProfileNumbersUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Profile-Id": profileId,
                },
            });

            const responseData = response.data.data;
            console.log("KYC Profile Numbers", responseData);


            if (responseData) {
                const profileNumbers: IDocFoxProfileNumbers[] = responseData.map((profileNumber: any) => ({
                    id: profileId,
                    idExpiry: profileNumber.attributes.expiry_date,
                    idCountry: profileNumber.attributes.issued_by,
                    idType: profileNumber.attributes.slug,
                    idNumber: profileNumber.attributes.value,
                }));

                this.store.docFoxProfileNumbers.load(profileNumbers);
            } else {
                this.store.docFoxProfileNumbers.load([]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getKYCProfileAddresses(profileId: string) {

        const kycProfileAddressesUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCProfileAddresses';

        try {
            const response = await axios.get(kycProfileAddressesUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Profile-Id": profileId,
                },
            });

            const responseData = response.data.data;
            // console.log("KYC Profile Addresses", responseData);

            if (responseData) {
                const profileAddresses: IDocFoxProfileAddresses[] = responseData.map((profileAddress: any, index: number) => ({
                    id: this.addresses.id = profileId,
                    physical: {
                        address_line_one: profileAddress.attributes.slug === "physical_address" ? this.addresses.physical.address_line_one = profileAddress.attributes.address_line_one : "",
                        address_line_two: profileAddress.attributes.slug === "physical_address" ? this.addresses.physical.address_line_two = profileAddress.attributes.address_line_two : "",
                        city: profileAddress.attributes.slug === "physical_address" ? this.addresses.physical.city = profileAddress.attributes.city : "",
                        country: profileAddress.attributes.slug === "physical_address" ? this.addresses.physical.country = profileAddress.attributes.country : "",
                        state: profileAddress.attributes.slug === "physical_address" ? this.addresses.physical.state = profileAddress.attributes.state_or_province_or_region : "",
                        suburb: profileAddress.attributes.slug === "physical_address" ? this.addresses.physical.suburb = profileAddress.attributes.suburb : ""
                    },
                    postalAddress: profileAddress.attributes.slug === "postal_address" ? this.addresses.postal = profileAddress.attributes.full_address : ""
                }));
                this.store.docFoxProfileAddresses.load([this.addresses]);
            }
            this.store.docFoxProfileAddresses.load([this.addresses]);
        } catch (error) {
            console.log(error);
        }
    }

    async getKYCProfileAdditionalDetails(profileId: string) {

        const kycProfileAdditonalUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCProfileAdditionalDetails';

        try {
            const response = await axios.get(kycProfileAdditonalUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Profile-Id": profileId,
                },
            });

            const responseData = response.data.data;
            // console.log("KYC Profile Additional Details", responseData);

            if (responseData) {
                const profileAdditionalDetails: IDocFoxProfileAdditionalDetails[] = responseData.map((profileAdditionalDetail: any) => ({
                    id: this.additionalDetails.id = profileId,
                    nationality: profileAdditionalDetail.attributes.slug === "nationality" ? this.additionalDetails.nationality = profileAdditionalDetail.attributes.value : "",
                    bankAccountNumber: profileAdditionalDetail.attributes.slug === "account_number" ? this.additionalDetails.bankAccountNumber = profileAdditionalDetail.attributes.value : "",
                    employerName: profileAdditionalDetail.attributes.slug === "employer_name" ? this.additionalDetails.employerName = profileAdditionalDetail.attributes.value : "",
                    bankName: profileAdditionalDetail.attributes.slug === "bank_name" ? this.additionalDetails.bankName = profileAdditionalDetail.attributes.value : "",
                    occupation: profileAdditionalDetail.attributes.slug === "occupation" ? this.additionalDetails.occupation = profileAdditionalDetail.attributes.value : "",
                    dateOfBirth: profileAdditionalDetail.attributes.slug === "date_of_birth" ? this.additionalDetails.dateOfBirth = profileAdditionalDetail.attributes.value : "",
                    bankAccountType: profileAdditionalDetail.attributes.slug === "account_type" ? this.additionalDetails.bankAccountType = profileAdditionalDetail.attributes.value : "",
                    bankBranchCode: profileAdditionalDetail.attributes.slug === "branch_code" ? this.additionalDetails.bankBranchCode = profileAdditionalDetail.attributes.value : "",

                    bankBranchName: profileAdditionalDetail.attributes.slug === "generic_detail" ? this.additionalDetails.bankBranchName = profileAdditionalDetail.attributes.value : "",
                }));
                this.store.docFoxProfileAdditionalDetails.load([this.additionalDetails]);
            }
            this.store.docFoxProfileAdditionalDetails.load([this.additionalDetails]);
        } catch (error) {
            console.log(error);
        }
    }
}


