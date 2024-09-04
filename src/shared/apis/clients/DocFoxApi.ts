import AppStore from '../../stores/AppStore';
import AppApi from '../AppApi';

import KYCApplicationApi from './doc-fox/KYCApplicationApi';
import KYCProfileApi from './doc-fox/KYCProfileApi';

export default class DocFoxApi {
  kycApplications: KYCApplicationApi;
  kycProfiles: KYCProfileApi;

  constructor(api: AppApi, store: AppStore) {
      this.kycApplications = new KYCApplicationApi(api, store);
      this.kycProfiles = new KYCProfileApi(api, store);
  }
}
