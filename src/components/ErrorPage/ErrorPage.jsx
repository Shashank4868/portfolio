import MenuList from "../HomePage/Nav/MenuList";
import classes from "./ErrorPage.module.css";

const ErrorPage = () => {
  return (
    <>
      <MenuList />
      <div className={classes.main}>
        <h1>Error 404</h1>
        <h1>Oops! Something went wrong.</h1>
        <h2>Page not found</h2>
      </div>
    </>
  );
};

export default ErrorPage;
