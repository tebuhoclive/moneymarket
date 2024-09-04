import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useState } from "react";
import { read, utils } from "xlsx";
import "./EntityImport.scss";

import FormFieldInfo from "../../../shared/components/form-field-info/FormFieldInfo";
import MODAL_NAMES from "../../ModalName";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { generateNextValueWithIncrement, generateNextValue, dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import swal from "sweetalert";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";

export interface IClientStaticDataImport {
  "CounterParty Code": string;
  "Counterparty Name": string;
  Phone: string;
  "ID / Registration Number": string;
  ["Cellphone Nr (Primary)"]: string;
  ["Cellphone Nr (Secondary)"]: string,
  Fax: string;
  "Address Line 1": string; // postal address
  "Address Line 2": string; // city
  "Address Line 3": string; // street
  "Address Line 4": string; // country
  "Email - Primary": string;
  "Email - Secondary": string;
  "Entity Type": string;
  "Sub Entity Type": string;
  "First Names": string;
  "Last Name": string;
  Description: string;
  "Contact Person": string;
}

const NaturalPersonEntityImportForm = observer(() => {
  const { api, store } = useAppContext();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);


  const [entityId, setEntityId] = useState("");
  const [currentId, setCurrentId] = useState("");

  const isNamibianId = (input: string): boolean => {
    // Check if the input consists of only numerical characters and its length is 11
    return /^\d{11}$/.test(input);
  }

  const handleChangeEntityFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImportFile(event.target.files[0]);
    }
  };

  const handleEntityImport = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Upload"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        if (importFile) {

          const wb = read(await importFile.arrayBuffer());
          const data = utils.sheet_to_json<IClientStaticDataImport>(
            wb.Sheets[wb.SheetNames[0]]
          );

          const importDataAsJson = data.map((data: IClientStaticDataImport) => ({
            counterPartyCode: data["CounterParty Code"],
            counterPartyName: data["Counterparty Name"],
            phone: data.Phone,
            idNumber: data["ID / Registration Number"],
            cellPhone: data["Cellphone Nr (Primary)"],
            cellPhoneAlt: data["Cellphone Nr (Secondary)"],
            fax: data["Fax"],
            addressLineOne: data["Address Line 1"],
            addressLineTwo: data["Address Line 2"],
            addressLineThree: data["Address Line 3"],
            addressLineFour: data["Address Line 4"],
            emailAddress: data["Email - Primary"],
            emailAddressSecondary: data["Email - Secondary"],
            entityType: data["Entity Type"],
            subEntityType: data["Sub Entity Type"],
            clientFirstName: data["First Names"],
            clientLastName: data["Last Name"],
            description: data.Description,
          }));

          const naturalPersonImportDataAsJson: INaturalPerson[] = importDataAsJson.map((data, index) => ({
            ...defaultNaturalPerson,
            entityId: generateNextValueWithIncrement(entityId, index + 1),
            oldCPNumber: typeof (data.counterPartyCode) === "string" ? data.counterPartyCode : `${data.counterPartyCode}`,
            entityDisplayName: data.counterPartyName,
            counterPartyName: data.counterPartyName,
            clientName: data.clientFirstName,
            clientSurname: data.clientLastName,
            createdBy: 'System Import',
            entityType: data.subEntityType || "",
            idNumber: data.idNumber || "",
            idType: isNamibianId(data.idNumber) ? 'ID' : 'Passport',
            contactDetail: {
              address1: data.addressLineThree || "",
              address2: "",
              suburb: "",
              city: data.addressLineTwo || "",
              state: "",
              country: data.addressLineFour || "",
              phoneNumber: data.phone || "",
              cellphoneNumber: data.cellPhone || "",
              cellphoneNumberSecondary: data.cellPhone || "",
              fax: data.fax || "",
              emailAddress: data.emailAddress || "",
              emailAddressSecondary: data.emailAddressSecondary || "",
              postalAddress: data.addressLineOne || "",
            },
            description: data.description || "",
            isDuplicate: data.description ? true : false,
            dateCreated: dateFormat_YY_MM_DD(Date.now())
          }));



          const dataUpload = {
            naturalPerson: naturalPersonImportDataAsJson
          }
          
          try {
            const response = await fetch(
              "https://us-central1-ijgmms.cloudfunctions.net/importClientAccounts",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(dataUpload)
              }
            );

            if (response.ok) {
              swal({
                icon: "success",
                title: "Upload Complete"
              });
            } else {
              swal({
                icon: "error",
                title: "Upload Failed"
              });
            }
            setLoading(false);
            onCancel();
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        swal({
          icon: "error",
          text: "Transaction cancelled!",
        });
        setLoading(false);
      }
      setLoading(false);
    });
  };

  const onCancel = () => {
    setImportFile(null);
    hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ENTITY_MODAL);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await api.client.entityId.getId();
        setEntityId(store.entityId.id);
        const nextEntityId = generateNextValue(entityId);
        setCurrentId(nextEntityId);
      } catch (error) { }
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
        {!loading && importFile &&
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEntityImport}
            disabled={loading}
          >
            Import
          </button>
        }
        {loading && <LoadingEllipsis />}
      </div>
      <button className="btn btn-danger uk-margin-right" type="button" onClick={onCancel}>
        Cancel
      </button>
    </ErrorBoundary>
  );
});

export default NaturalPersonEntityImportForm;
