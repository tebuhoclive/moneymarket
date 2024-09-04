import AppStore from "../../../../../shared/stores/AppStore";

export function getProductCode(store: AppStore, accountNumber: string) {
  const mmaType = store.mma.all.find(
    (a) => a.asJson.accountNumber === accountNumber
  )?.asJson.accountType;
  if (mmaType) {
    return mmaType;
  } else {
    return "N/A";
  }
}
export function getProductName(store: AppStore, productCode: string): string {
  const instrumentName = store.product.all.find(
    (prod) => prod.asJson.productCode === productCode
  )?.asJson.productName;
  if (instrumentName) {
    return instrumentName;
  }
  return "-";
}
