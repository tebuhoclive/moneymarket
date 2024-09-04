import { observer } from "mobx-react-lite";
import MainLayout from "./main-layout/MainLayout";
import Drawer from "./nagivation/Drawer";

const LoggedIn = observer(() => {
  return (
    <div className="application-layout">
      <Drawer />
      <MainLayout />
    </div>
  );
});

export default LoggedIn;
