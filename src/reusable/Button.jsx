import classes from "./Button.module.css";

const Button = (props) => {
  const dnld = props.doc ? "Shashank's CV" : "";
  const trgt = props.target ? props.target : "";
  const mthd = props.method ? props.method : "";
  return (
    <a
      href={props.onClick}
      target={trgt}
      className={!props.disabled ? classes.anchor : ""}
      download={dnld}
    >
      <button
        className={!props.disabled ? classes.button : ""}
        type={props.type}
        formMethod={mthd}
        disabled={props.disabled}
      >
        {props.title}
      </button>
    </a>
  );
};

export default Button;
