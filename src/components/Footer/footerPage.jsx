import classes from "./footerPage.module.css";
import git from "../../assets/icons8-github-48.png";
import linkedIn from "../../assets/icons8-linkedin-48.png";
import insta from "../../assets/icons8-insta-48.png";
import twitter from "../../assets/icons8-twitter-circled-48.png";
import { Fragment } from "react";

const Footer = () => {
  return (
    <Fragment>
      <h2 className={classes.header}>Let's Get Connected...</h2>
      <div className={classes.list__container}>
        <a
          href="https://github.com/Shashank4868"
          target="_blank"
          rel="noreferrer"
        >
          <img src={git} alt="Git Logo" />
        </a>
        <a
          href="https://www.linkedin.com/in/shashank-raj-0625331b7/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={linkedIn} alt="linkedIn Logo" />
        </a>
        <a
          href="https://www.instagram.com/shhhashank.__/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={insta} alt="Insta Logo" />
        </a>
        <a
          href="https://twitter.com/shashankrajjais"
          target="_blank"
          rel="noreferrer"
        >
          <img src={twitter} alt="twitter Logo" />
        </a>
      </div>
    </Fragment>
  );
};

export default Footer;
