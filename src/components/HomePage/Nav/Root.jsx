import { Outlet } from "react-router-dom";
import MenuList from "./MenuList";
import Footer from "../../Footer/footerPage";

const RootLayout = () => {
  return (
    <>
      <MenuList />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
