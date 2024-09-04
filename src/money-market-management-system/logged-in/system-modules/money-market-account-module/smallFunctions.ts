import showModalFromId from "../../../../shared/functions/ModalShow";
import LegalEntityModel from "../../../../shared/models/clients/LegalEntityModel";
import NaturalPersonModel from "../../../../shared/models/clients/NaturalPersonModel";
import AppStore from "../../../../shared/stores/AppStore";
import MODAL_NAMES from "../../dialogs/ModalName";

export const getClientName = (clients:(LegalEntityModel|NaturalPersonModel)[] , parentEntityId: string) => {
    const client = clients.find(client => client.asJson.entityId === parentEntityId
    );
    if (client && parentEntityId !=="") {
      return client.asJson.entityDisplayName;
    }

    return "";
  };

  export const getProductName = (products:any ,productId: string) => {
    const product = products.find((product:any) => product.id === productId);
    if (product) {
      return product.productName;
    }
    return "";
  };

  export const onEdit = (accountId: string, store: AppStore) => {
    const selectedAccount = store.mma.getItemById(accountId);

    if (selectedAccount) {
      store.mma.select(selectedAccount.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.UPDATE_MONEY_MARKET_ACCOUNT_MODAL);
    }
  };