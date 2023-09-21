import Button from "../../../reusable/Button";
import classes from "./Project-Card.module.css";

const ProjectCard = (props) => {
  const data = props.tech;
  const trgt = "__blank";
  return (
    <div className={classes.card}>
      <img src={props.src} alt={props.alt} className={classes.card__image} />

      <div className={classes.card__content}>
        <Button
          className={classes.card__content__title}
          onClick={props.link}
          title={props.title}
          target={trgt}
        ></Button>
        <p className={classes.card__content__text}>{props.text}</p>
        <h4 className={classes.card__content__tech}>Technologies Used:</h4>
        <ul className={classes.techs}>
          {data.map((tech) => (
            <li key={tech.id} className={classes.list}>
              {tech.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectCard;
