import { IFeatureAccess, SystemFeatures } from '../../models/User';
import AppStore from "../../stores/AppStore";

/**
 * Checks if the user has the specified permission for a given feature.
 * @author : Naftal Ngesheya
 * @param {Store} store - The user object.
 * @param {string} featureName - The name of the feature to check.
 * @param {string} permission - The permission to check (e.g., "read").
 * @returns {boolean} - True if the user has the specified permission for the given feature, false otherwise.
 */

export const hasFeaturePermission = (store: AppStore, featureName: SystemFeatures, permission: keyof IFeatureAccess): boolean => {
    const user = store.auth.meJson;
    if (user) {

        const feature = user.feature.find((feature: IFeatureAccess) => feature.featureName === featureName);
        if (!feature) {
            return false; // Feature not found
        }

        if (permission === "featureName") {
            throw new Error("'featureName' is not a valid permission property");
        }

        return feature[permission] === true;
    }else{
        return false
    }
};


