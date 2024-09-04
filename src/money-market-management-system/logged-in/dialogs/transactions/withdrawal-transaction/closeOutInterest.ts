// import {
//   DocumentSnapshot,
//   collection,
//   onSnapshot,
//   query,
//   where,
// } from "firebase/firestore";
// import { db } from "../../../../../shared/config/firebase-config";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import AppStore from "../../../../../shared/stores/AppStore";

// export async function getByAccountNumber(
//   accountNumber: string
// ): Promise<number> {
//   const path = "moneyMarketAccounts";

//   const queryParam = query(
//     collection(db, path),
//     where("accountNumber", "==", accountNumber)
//   );

//   return new Promise<number>((resolve, reject) => {
//     const unsubscribe = onSnapshot(
//       queryParam,
//       (snapshot) => {
//         const documents = snapshot.docs;

//         if (documents.length > 0) {
//           const firstDocument = documents[0] as DocumentSnapshot<
//             IMoneyMarketAccount
//           >;
//           const item = {
//             id: firstDocument.id,
//             ...firstDocument.data(),
//           } as IMoneyMarketAccount;

//           const monthTotalInterest = item.monthTotalInterest || 0; // Use optional chaining and default to 0 if undefined

//           unsubscribe(); // Unsubscribe to stop listening for changes
//           resolve(monthTotalInterest);
//         } else {
//           unsubscribe(); // Unsubscribe even if no documents are found
//           resolve(0); // Resolve with 0 if no documents are found
//         }
//       },
//       (error) => {
//         reject(error); // Reject with the error if there's an issue with the query
//       }
//     );
//   });
// }




const closeOutInterest = () => {
  return ("")
}

export default closeOutInterest
