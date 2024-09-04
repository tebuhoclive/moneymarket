import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import InstrumentModel, { IInstrument } from "../models/InstrumentModel";

// export default class InstrumentStore extends Store<IInstrument, InstrumentModel> {
//     items = new Map<string, InstrumentModel>();

//     constructor(store: AppStore) {
//         super(store);
//         this.store = store;
//     }

//     load(items: IInstrument[] = []) {
//         runInAction(() => {
//             items.forEach((item) =>
//                 this.items.set(item.id, new InstrumentModel(this.store, item))
//             );
//         });
//     }

    // get treasuryBill() {
    //     const list = Array.from(this.items.values());
    //     return list.filter((item) => item.asJson.instrumentType === "TreasuryBill");
    // }
    // get bond() {
    //     const list = Array.from(this.items.values());
    //     return list.filter((item) => item.asJson.instrumentType === "Bond");
    // }
    // get equity() {
    //     const list = Array.from(this.items.values());
    //     return list.filter((item) => item.asJson.instrumentType === "Equity");
    // }
    // get fixedDeposit() {
    //     const list = Array.from(this.items.values());
    //     return list.filter((item) => item.asJson.instrumentType === "FixedDeposit");
    // }
    // get unitTrust() {
    //     const list = Array.from(this.items.values());
    //     return list.filter((item) => item.asJson.instrumentType === "UnitTrust");
    // }
// }