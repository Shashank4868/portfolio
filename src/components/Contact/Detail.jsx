import location from "../../assets/icons8-location-48.png";
import mail from "../../assets/icons8-mail-48.png";
import phone from "../../assets/icons8-phone-48.png";

import classes from "./Detail.module.css";

const Details = () => {
  return (
    <div className={classes.contaier}>
      <h1 style={{ color: " #025464" }}>Contact Details</h1>
      <div className={classes.loc}>
        <img
          src={location}
          alt="location"
          style={{ width: "20px", height: "20px", marginRight: "20px" }}
        />
        <p>Ranchi, Jharkhand - 835205</p>
      </div>
      <div className={classes.loc}>
        <img
          src={phone}
          alt="phone"
          style={{ width: "20px", height: "20px", marginRight: "20px" }}
        />
        <p>+91 6299425898</p>
      </div>
      <div className={classes.loc}>
        <img
          src={mail}
          alt="mail"
          style={{ width: "20px", height: "20px", marginRight: "20px" }}
        />
        <p>shashankrajjais@gmail.com</p>
      </div>
    </div>
  );
};

export default Details;
