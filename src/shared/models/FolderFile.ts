import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultFolderFile: IFolderFile = {
  name: "File",
  url: "",
  extension: "unknown",
};

export interface IFolderFile {
  name: string;
  url: string;
  extension: string;
}

export default class FolderFile {
  private file: IFolderFile;

  constructor(private store: AppStore, file: IFolderFile) {
    makeAutoObservable(this);
    this.file = file;
  }

  get asJson(): IFolderFile {
    return toJS(this.file);
  }
}
