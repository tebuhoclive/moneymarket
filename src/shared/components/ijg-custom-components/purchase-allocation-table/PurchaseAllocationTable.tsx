// import React, { ChangeEvent, Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
// import { TreasuryBillAllocationTableItem } from '../../../../logged-in/transactions/purchases-view/treasury-purchase-page/TreasuryBillClientTable';
// import { ITreasuryBillPurchaseAllocation } from '../../../models/treasury-bill-allocation/TreasuryBillAllocation';
// import { runInAction } from 'mobx';
// import { useAppContext } from '../../../functions/Context';
// import { ITreasuryBill, defaultTreasuryBill } from '../../../models/instruments/TreasuryBillModel';
// import { IPurchaseTreasuryBill, defaultPurchaseTreasuryBill } from '../../../models/purchases/PurchaseTreasuryBillModel';
// import { IFolderFile } from '../../../models/FolderFile';
// import Toolbar from '../../../../money-market-management-system/logged-in/shared/toolbar/Toolbar';
// import { IMoneyMarketAccountBalance } from '../../../models/MoneyMarketAccount';
// import { IMoneyMarketAccountPurchase } from '../../../models/MoneyMarketAccountPurchase';

// interface TableData {
//   index: number;
//   allocation: string; //existing client id or name
//   accountNumber: string; //existing client account id
//   nominal: number; //shares per percentage, of the selected intrument amount
//   purchaseYield: number; //percentage
//   margin: number; //percentage
//   clientYield: number;
//   purchaseConsideration: number;
//   clientConsideration: number;
//   clientCashBalance: number; //what is available in money markey account
//   clientMaturities: number; //amounts of instrument expected from maturity dates
//   clientAvailableBalance: number; //Sum of cash + maturities - client consideration (on all draft forms)
//   profit: number;
//   document: IFolderFile;
// }

// interface IProps {
//   setSelectedTab: Dispatch<SetStateAction<string>>
// }

// const PurchaseAllocationTable = (props: IProps) => {
//   const { api, store } = useAppContext();
//   const [loading, setLoading] = useState(false);
//   const { setSelectedTab } = props;

//   const [clients, setClients] = useState<any[]>([]);
//   const [purchaseTreasuryBill, setPurchaseTreasuryBill] = useState<IPurchaseTreasuryBill>({ ...defaultPurchaseTreasuryBill });
//   const [treasuryBill, setTreasuryBill] = useState<ITreasuryBill>({ ...defaultTreasuryBill });

//   const difference = Math.abs((treasuryBill.maturityDate ? treasuryBill.maturityDate : 0) - treasuryBill.issueDate); // Difference in milliseconds
//   const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
//   const daysToMaturity = Math.floor(difference / millisecondsPerDay);
//   const allocator = store.auth.meJson?.uid;


//   const [sortConfig, setSortConfig] = useState<{ key: keyof TableData; direction: string } | null>(null);
//   const [columnVisibility, setColumnVisibility] = useState<{ [key in keyof TableData]: boolean }>({
//     index: true,
//     allocation: true,
//     accountNumber: true,
//     nominal: true,
//     purchaseYield: true,
//     margin: true,
//     clientYield: true,
//     purchaseConsideration: true,
//     clientConsideration: true,
//     clientCashBalance: true,
//     clientMaturities: true,
//     clientAvailableBalance: true,
//     profit: true,
//     document: true,
//   });

//   const columnNames = {
//     index: "#",
//     allocation: "Allocation",
//     accountNumber: "Account Number",
//     nominal: "Nominal",
//     purchaseYield: "Purchase Yield",
//     margin: "Margin",
//     clientYield: "Client Yield",
//     purchaseConsideration: "Purchase Consideration",
//     clientConsideration: "Client Consideration",
//     clientCashBalance: "Client Cash Balance",
//     clientMaturities: "Client Maturities",
//     clientAvailableBalance: "Client Available Balance",
//     profit: "Profit",
//     document: "Document",
//   };

//   const onAddItem = () => {
//     const newItem: ITreasuryBillPurchaseAllocation = {
//       id: "",
//       allocation: "",
//       accountId: "",
//       accountNumber: "",
//       nominal: 0,
//       purchaseYield: 0,
//       margin: 0,
//       clientYield: 0,
//       purchaseConsideration: 0,
//       clientConsideration: 0,
//       clientCashBalance: 0,
//       clientMaturities: 0,
//       clientAvailableBalance: 0,
//       profit: 0,
//       document: {
//         name: "",
//         url: "",
//         extension: ""
//       }
//     };
//     const data = [...clients];
//     data.push(newItem);
//     setClients(data);
//   };


//   const onNumberChange = (value: string | number, index: number, fieldName: string) => {
//     runInAction(() => {
//       const data = [...clients];
//       data[index] = {
//         ...data[index],
//         [fieldName]: Number(value)
//       };
//       setClients(data);
//     });
//   };

//   const onClientChange = (value: string, index: number) => {
//     runInAction(() => {
//       const data = [...clients];
//       const clientId = value; // Assuming the client ID is obtained from the selected value
//       data[index] = {
//         ...data[index],
//         allocation: value,
//         accountId: clientId // Assign the clientId to accountId
//       };
//       setClients(data);
//     });
//   };


//   const onItemChange = (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     runInAction(() => {
//       const data = [...clients];
//       const name = e.target.name;
//       const value = e.target.value;
//       data[index] = { ...data[index], [name]: value };
//       setClients(data);
//     })
//   };

//   const onProcessItems = async () => {
//     const purchasedTreasuryBill: IPurchaseTreasuryBill = {
//       ...defaultPurchaseTreasuryBill,
//       instrumentId: treasuryBill.id,
//       instrumentName: treasuryBill.instrumentName,
//       counterPartyId: purchaseTreasuryBill.counterPartyId,
//       counterParty: purchaseTreasuryBill.counterParty,
//       nominal: purchaseTreasuryBill.nominal,
//       daysToMaturity: purchaseTreasuryBill.daysToMaturity,
//       tradeDate: purchaseTreasuryBill.tradeDate,
//       settlementDate: purchaseTreasuryBill.settlementDate,
//       allocatedBy: allocator || ""
//     }
//     setLoading(true);
//     await api.purchase.treasuryBill.create(purchasedTreasuryBill);

//     clients.forEach(async client => {
//       const clientMoneyMarketPurchase: IMoneyMarketAccountPurchase = {
//         ...purchasedTreasuryBill,
//         ...client,
//         instrumentType: "Tresuary Bill"

//       }
//       try {

//         await api.purchase.treasuryBill.createPurchaseInAccount(client.accountNumber, clientMoneyMarketPurchase);
//         await api.purchase.treasuryBill.createPurchaseAllocations(purchasedTreasuryBill.id, client);
//         console.log(client);

//       } catch (error) {
//       }
//       const mma: IMoneyMarketAccountBalance = {
//         id: client.accountNumber,
//         balance: client.clientCashBalance - client.clientConsideration
//       }
//       try {
//         //await api.mma.updateBalance(mma);
//       } catch (error) {
//       }
//     });
//     setLoading(false);
//     setSelectedTab("submissions-tab");
//   };

//   const onItemRemove = (index: number) => {
//     const data = [...clients];
//     data.splice(index, 1);
//     setClients(data);
//   };

//   const handleSort = (key: keyof TableData) => {
//     let direction = 'asc';
//     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const handleColumnVisibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedColumn = event.target.value as keyof TableData;
//     setColumnVisibility((prevColumnVisibility) => ({
//       ...prevColumnVisibility,
//       [selectedColumn]: !event.target.checked,
//     }));
//   };

//   const sortedData = [...clients];
//   if (sortConfig !== null) {
//     sortedData.sort((a, b) => {
//       if (a[sortConfig.key] < b[sortConfig.key]) {
//         return sortConfig.direction === 'asc' ? -1 : 1;
//       }
//       if (a[sortConfig.key] > b[sortConfig.key]) {
//         return sortConfig.direction === 'asc' ? 1 : -1;
//       }
//       return 0;
//     });
//   }

//   const getSortIndicator = (key: keyof TableData): string => {
//     if (sortConfig && sortConfig.key === key) {
//       return sortConfig.direction === 'asc' ? '▲' : '▼';
//     }
//     return '';
//   };

//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(event.target.value);
//   };

//   const filteredData = clients.filter((item) => {
//     const values = Object.values(item);
//     const searchValue = searchQuery.toLowerCase();
//     return values.some((value) =>
//       String(value).toLowerCase().includes(searchValue)
//     );
//   });

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         await api.client.legalEntity.getAll();
//         await api.client.naturalPerson.getAll();
//         await api.mma.getAll();

//       } catch (error) { }
//     };
//     loadData();
//   }, [api.client.naturalPerson, api.client.legalEntity, api.mma]);

//   return (
//     <div className="uk-section uk-section-snall">
//       <div className="uk-container uk-container-expand">
//         <Toolbar
//           rightControls={
//             <input
//               type="text"
//               className="uk-input uk-form-width-medium uk-margin-bottom"
//               placeholder="Search"
//               value={searchQuery}
//               onChange={handleSearchChange}
//             />
//           }
//           leftControls={
//             <div className="uk-flex">
//               <button className="btn btn-primary" type="button">Hidden Columns</button>
//               <div data-uk-dropdown="mode: click; pos: bottom-left">
//                 {/* <ul className="uk-nav uk-dropdown-nav">
//             {Object.keys(columnVisibility).map((key) => (
//               <li>
//                 <label>
//                   <input
//                     className="uk-input-small uk-checkbox uk-margin-small-right"
//                     type="checkbox"
//                     checked={!columnVisibility[key as keyof TableData]}
//                     onChange={handleColumnVisibilityChange}
//                     value={key}
//                   />
//                   {key}
//                 </label>
//               </li>
//             ))}
//           </ul> */}
//                 <ul className="uk-nav uk-dropdown-nav">
//                   {Object.keys(columnVisibility).map((key) => (
//                     <li>
//                       <label>
//                         <input
//                           className="uk-input-small uk-checkbox uk-margin-small-right"
//                           type="checkbox"
//                           checked={!columnVisibility[key as keyof TableData]}
//                           onChange={handleColumnVisibilityChange}
//                           value={key}
//                         />
//                         {columnNames[key as keyof TableData]}
//                       </label>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           }

//         />
//         <div className="uk-overflow-auto">
//           <table className="kit-table uk-table uk-table-small uk-table-middle uk-table-responsive" >
//             <thead>
//               <tr>
//                 {Object.keys(columnVisibility).map(
//                   (key) =>
//                     columnVisibility[key as keyof TableData] && (
//                       <th key={key} onClick={() => handleSort(key as keyof TableData)}>
//                         {columnNames[key as keyof TableData]} {getSortIndicator(key as keyof TableData)}
//                       </th>
//                     )
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {/* {sortedData.map((row) => (
//                 // <tr key={row.id}>
//                 //   {Object.keys(columnVisibility).map((key) =>
//                 //     columnVisibility[key as keyof TableData] ? (
//                 //       <td key={key}>{row[key as keyof TableData]}</td>
//                 //     ) : null
//                 //   )}
//                 // </tr>
//               ))} */}

//               {clients.map((item, index) => (
//                 <Fragment key={index}>
//                   <TreasuryBillAllocationTableItem
//                     index={index}
//                     onItemChange={onItemChange}
//                     onItemRemove={onItemRemove}
//                     onNumberChange={onNumberChange}
//                     onClientChange={onClientChange}
//                     allocation={item.allocation}
//                     accountId={item.accountId}
//                     accountNumber={item.accountNumber}
//                     nominal={item.nominal}
//                     purchaseYield={item.purchaseYield}
//                     margin={item.margin}
//                     clientYield={item.clientYield}
//                     purchaseConsideration={item.purchaseConsideration}
//                     clientConsideration={item.clientConsideration}
//                     clientCashBalance={item.clientCashBalance}
//                     clientMaturities={item.clientMaturities}
//                     clientAvailableBalance={item.clientAvailableBalance}
//                     profit={item.profit}
//                     document={item.document}
//                     maturityDays={purchaseTreasuryBill.daysToMaturity}
//                     clientId={item.accountId} // Pass clientId as a prop
//                     columnNames={columnNames} columnVisibility={columnVisibility} handleColumnVisibilityChange={handleColumnVisibilityChange} />
//                 </Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div>
//           <button className="btn btn-primary uk-margin-top" type="button"
//             onClick={onAddItem}>
//             <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
//             Client
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PurchaseAllocationTable;

import React from 'react'

const PurchaseAllocationTable = () => {
  return (
    <div>
      
    </div>
  )
}

export default PurchaseAllocationTable

