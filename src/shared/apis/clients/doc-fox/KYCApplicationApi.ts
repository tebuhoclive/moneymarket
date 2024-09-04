import axios from "axios";
import { db } from "../../../config/firebase-config";

import AppStore from "../../../stores/AppStore";
import AppApi from "../../AppApi";
import { Unsubscribe, collection, doc, onSnapshot, query, setDoc } from "firebase/firestore";
import { IDocFoxApplications } from "../../../models/clients/DocFoxApplicationsModel";
import { IDocFoxApplicationRiskRatings } from '../../../models/clients/DocFoxApplicationRiskRatingModel';

export default class KYCApplicationApi {
    constructor(private api: AppApi, private store: AppStore) {
    }

    private kycApplicationsPath = () => {
        return "kycApplications";
    }

    async getKYCApplicationsFromDocFox() {
        const kycApplicationsUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCApplications';

        try {
            const response = await axios.get(kycApplicationsUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            });

            const tokenData = response.data;

            const applications: IDocFoxApplications[] = tokenData.map((tokenData: any) => ({
                id: tokenData.id,
                kycProfileId: tokenData.relationships.profile.data.id,
                kycEntityType: tokenData.attributes.kyc_entity_type_name,
            }));

            console.log(applications);

            applications.forEach(application => {
                this.createOrUpdateKYCApplication(application);
                console.log(application);
            });

        } catch (error) {
            console.log(error);
        }
    }

    async getKYCApplicationsFromDatabase() {
        this.store.docFoxApplication.removeAll();

        const path = this.kycApplicationsPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const kycApplications: IDocFoxApplications[] = [];
                querySnapshot.forEach((doc) => {
                    kycApplications.push({ id: doc.id, ...doc.data() } as IDocFoxApplications);
                });
                this.store.docFoxApplication.load(kycApplications);
                kycApplications.forEach(kycApplication => {
                    this.api.docfox.kycProfiles.getKYCProfilesFromDocFox(kycApplication.kycProfileId, kycApplication.id, kycApplication.kycEntityType);
                    this.api.docfox.kycProfiles.getById(kycApplication.kycProfileId);
                });
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });
    }

    async getById(id: string) {
        const path = this.kycApplicationsPath();
        if (!path) return;

        const unsubscribe = onSnapshot(doc(db, path, id), (doc) => {
            if (!doc.exists) return;
            const item = { id: doc.id, ...doc.data() } as IDocFoxApplications;
            this.api.docfox.kycProfiles.getKYCProfilesFromDocFox(item.kycProfileId, item.id, item.kycEntityType);
            this.api.docfox.kycProfiles.getById(item.kycProfileId);
            this.getKYCApplicationRelatedEntities(item.id);
            this.getKYCApplicationRelatedEntities(item.id);
            this.store.docFoxApplication.load([item]);
        });

        return unsubscribe;
    }

    async createOrUpdateKYCApplication(kycApplication: IDocFoxApplications) {
        const path = this.kycApplicationsPath();
        if (!path) return;

        const itemRef = doc(collection(db, path), kycApplication.id);
        this.api.docfox.kycProfiles.getKYCProfilesFromDocFox(kycApplication.kycProfileId, kycApplication.id, kycApplication.kycEntityType);

        try {
            await setDoc(itemRef, kycApplication, { merge: true, })
        } catch (error) {
            console.log(error);
        }

    }

    // Links

    async getKYCApplicationRiskRatings(kycApplicationId: string) {
        const kycApplicationsUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCApplicationRiskRatings';
        try {
            const response = await axios.get(kycApplicationsUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Application-Id": kycApplicationId,
                },
            });

            const responseData = response.data.data;
            // console.log("KYC Application Risk Ratings", responseData);

            if (responseData) {
                const applicationRiskRatings: IDocFoxApplicationRiskRatings[] = responseData.map((applicationRiskRating: any) => ({
                    id: applicationRiskRating.id,
                    status: applicationRiskRating.attributes.status,
                    color: applicationRiskRating.attributes.color,
                    isPIP: applicationRiskRating.attributes.questions[3]?.answer === "No" ? false : true,
                    rating: applicationRiskRating.attributes.rating,
                    riskScore: applicationRiskRating.attributes.risk_score,
                    createdAt: applicationRiskRating.attributes.created_at,
                    updatedAt: applicationRiskRating.attributes.updated_at
                }));

                this.store.docFoxApplicationRiskRating.load(applicationRiskRatings);
            }

        } catch (error) {
            console.log("Error", error);
        }
    }

    async getKYCApplicationRelatedEntities(kycApplicationId: string) {
        const kycApplicationsUrl = 'https://us-central1-ijgmms.cloudfunctions.net/getKYCApplicationRelatedEntities';
        try {
            const response = await axios.get(kycApplicationsUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    "X-KYC-Application-Id": kycApplicationId,
                },
            });

            const responseData = response.data;
            console.log("KYC Application Risk Ratings", responseData);

        } catch (error) {
            console.log(error);
        }
    }
}


