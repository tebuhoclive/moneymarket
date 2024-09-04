import { makeAutoObservable, toJS } from "mobx";
import UiStore from "../stores/UiStore";

export interface ISnackbar {
  id: number;
  message: string;
  type: "primary" | "success" | "warning" | "danger" | "default";
  children?: any;
  timeoutInMs?: number;
  isUndoable?: boolean;
}

export default class Snackbar {
  private snackbar: ISnackbar;

  constructor(snackbar: ISnackbar) {
    makeAutoObservable(this);
    this.snackbar = snackbar;
  }

  get asJson(): ISnackbar {
    return toJS(this.snackbar);
  }


}

export const FAILEDACTION = (ui: UiStore) => {
  return ui.snackbar.load({
    id: Date.now(),
    message: "An error occured! Failed.",
    type: "danger",
  });
};

export const SUCCESSACTION = (ui: UiStore) => {
  return ui.snackbar.load({
    id: Date.now(),
    message: "Success!",
    type: "success",
  });
};
