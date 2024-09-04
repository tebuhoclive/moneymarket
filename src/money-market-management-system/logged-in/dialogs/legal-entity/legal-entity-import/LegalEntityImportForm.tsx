import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useState } from "react";
import { read, utils } from "xlsx";
import "./EntityImport.scss";

import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import MODAL_NAMES from "../../ModalName";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { ILegalEntity, defaultLegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { generateNextValueWithIncrement, generateNextValue, dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { log } from "console";

export interface IClientStaticDataImport {
  "CounterParty Code": string;
  "Counterparty Name": string;
  Phone: string;
  "ID / Registration Number": string;
  ["Cellphone Nr (Primary)"]: string;
  ["Cellphone Nr (Secondary)"]: string,
  "Address Line 1": string; // postal address
  "Address Line 2": string; // city
  "Address Line 3": string; // street
  "Address Line 4": string; // country
  "Email - Primary": string;
  "Email - Secondary": string;
  "Entity Type": string;
  "Sub Entity Type": string;
  "Legal Entity Name": string;
  Description: string;
  "Contact Person": string;
}

const LegalEntityImportForm = observer(() => {
  const { api, store } = useAppContext();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [importData, setImportData] = useState<ILegalEntity[]>([]);
  const [completedItems, setCompletedItems] = useState(0);

  const [entityId, setEntityId] = useState("");
  const [currentId, setCurrentId] = useState("");

  const handleChangeEntityFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  };

  const handleEntityImport = async () => {
    if (importFile) {
      const wb = read(await importFile.arrayBuffer());
      const data = utils.sheet_to_json<IClientStaticDataImport>(
        wb.Sheets[wb.SheetNames[0]]
      );

      const importDataAsJson = data.map(
        (data: IClientStaticDataImport, index) => ({
          counterPartyCode: data["CounterParty Code"],
          counterPartyName: data["Counterparty Name"],
          phone: data.Phone,
          idNumber: data["ID / Registration Number"],
          cellPhone: data["Cellphone Nr (Primary)"],
          cellPhoneAlt: data["Cellphone Nr (Secondary)"],
          addressLineOne: data["Address Line 1"],
          addressLineTwo: data["Address Line 2"],
          addressLineThree: data["Address Line 3"],
          addressLineFour: data["Address Line 4"],
          emailAddress: data["Email - Primary"],
          emailAddressSecondary: data["Email - Secondary"],
          entityType: data["Entity Type"],
          subEntityType: data["Sub Entity Type"],
          legalEntityName: data["Legal Entity Name"],
          description: data.Description,
        })
      );

      const legalImportDataAsJson: ILegalEntity[] = importDataAsJson.map(
        (data, index) => ({
          ...defaultLegalEntity,
          entityId: generateNextValueWithIncrement(entityId, index + 1),
          oldCPNumber: typeof (data.counterPartyCode) === "string" ? data.counterPartyCode : `${data.counterPartyCode}`,
          entityDisplayName: data.counterPartyName || "",
          counterPartyName: data.counterPartyName,
          createdBy: "System Import",
          entityType: data.subEntityType || "",
          clientName: data.legalEntityName || "",
          registrationNumber: data.idNumber ? `${data.idNumber}` : "",
          clientRegisteredName: data.legalEntityName || "",
          clientTradingName: data.legalEntityName || "",
          contactDetail: {
            address1: data.addressLineThree || "",
            address2: "",
            suburb: "",
            city: data.addressLineTwo || "",
            state: "",
            country: data.addressLineFour || "",
            phoneNumber: data.phone || "",
            cellphoneNumber: data.cellPhone || "",
            cellphoneNumberSecondary: "",
            fax: "",
            emailAddress: data.emailAddress || "",
            emailAddressSecondary: data.emailAddressSecondary || "",
            postalAddress: data.addressLineOne || "",
          },
          description: data.description || "",
          isDuplicate: data.description ? true : false,
          dateCreated: Date.now()
        })
      );

      setImportData(legalImportDataAsJson);

      setLoading(true);

 

      try {
        const data = {
          legalEntities: legalImportDataAsJson,
        };
        
        const response = await fetch(
          "https://us-central1-ijgmms.cloudfunctions.net/importLegalEntityProfiles",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          //action
        } else {
          //action
        }

      } catch (error) {
        console.log(error);
      }

      setLoading(false);
      onCancel();
    }
  };

  const onCancel = () => {
    setImportFile(null);
    hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_LEGAL_ENTITY_MODAL);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await api.client.entityId.getId();
        setEntityId(store.entityId.id);
        const nextEntityId = generateNextValue(entityId);
        setCurrentId(nextEntityId);
      } catch (error) {}
    };
    loadAll();
  }, [api.client.entityId, api.docfox, entityId, store.entityId.id]);

  return (
    <ErrorBoundary>
      <div className="uk-width-1-1 uk-margin" data-uk-margin>
        <div data-uk-form-custom="target: true">
          <input
            type="file"
            aria-label="Custom controls"
            onChange={handleChangeEntityFile}
            accept="xls"
            required
          />
          <input
            className="uk-input uk-form-width-large"
            type="text"
            placeholder="Select file"
            aria-label="Custom controls"
            disabled
          />
        </div>
        <FormFieldInfo>You can only upload Excel Files</FormFieldInfo>
        {!loading && importFile && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEntityImport}
          >
            Import
          </button>
        )}
        {loading && importFile && (
          <ProgressBar
            totalItems={importData.length}
            progress={completedItems}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

export default LegalEntityImportForm;
