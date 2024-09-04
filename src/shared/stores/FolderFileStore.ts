import Store from "./Store";
import AppStore from "./AppStore";
import FolderFile, { IFolderFile } from "../models/FolderFile";

export default class FolderFileStore extends Store<IFolderFile, FolderFile> {
  items = new Map<string, FolderFile>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }
}
