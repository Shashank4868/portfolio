import developer from "../../../images/developer.svg";
import classes from "./Mid.module.css";
import Button from "../../../reusable/Button";
import doc from "../../../files/resume.pdf";

const Mid = () => {
  return (
    <div className="mid">
      <div className={classes.mid__container}>
        <h1 className={classes.mid__container__title}>
          HI, IAM <span className={classes.name}>SHASHANK</span>
          <br />
          <span className={classes.mid__text_small}>
            I am a developer who loves to code and solve problems.
          </span>
          <br />
          <br />
          <Button
            title="Download CV"
            doc={doc}
            className={classes.btn}
            method="get"
            onClick={doc}
          />
        </h1>
        <img
          className={classes.mid__container__image}
          src={developer}
          alt="developer"
        />
      </div>
    </div>
  );
};

export default Mid;
