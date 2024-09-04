import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultCommunicationAndFilling: ICommunicationAndFiling = {
    id: "",
    subject: "",
    communicationDate: 0,
    details: "",
    attachments: null,
    communicationType: "Notification"
}

export interface ICommunicationAndFiling {
    id: string;
    subject: string
    communicationDate: number;
    details: string;
    attachments: [ICommunicationAttachment] | null;
    communicationType: string;
}

interface ICommunicationAttachment {
    id: string;
    fileName: string;
    file: string;
}

export interface IStatementMailingList {
    clientName: string | undefined;
    emailAddress: string | undefined;
}

export default class CommunicationAndFilingModel {
    private _communication: ICommunicationAndFiling;

    items = new Map<string, CommunicationAndFilingModel>();

    constructor(private store: AppStore, communication: ICommunicationAndFiling) {
        makeAutoObservable(this);
        this._communication = communication;
    }

    get asJson(): ICommunicationAndFiling {
        return toJS(this._communication);
    }

    get communicationByType() {
        return this.store.product.getItemById(this._communication.communicationType);
    }

    static groupByAccountType(Communication: CommunicationAndFilingModel[]): Record<string, CommunicationAndFilingModel[]> {
        const groupedCommunication: Record<string, CommunicationAndFilingModel[]> = {};

        for (const communication of Communication) {
            const _communicationType = communication.asJson.communicationType;

            if (_communicationType in groupedCommunication) {
                groupedCommunication[_communicationType].push(communication);
            } else {
                groupedCommunication[_communicationType] = [communication];
            }
        }
        return groupedCommunication;
    }
}