// import { useState } from "react";
// import { Form } from "react-router-dom";
import Button from "../../reusable/Button";
import classes from "./ContactForm.module.css";
import useInput from "../../hooks/use-input";

const ContactForm = () => {
  const isNotEmpty = (value) => value.trim().length !== 0;
  const isEmail = (value) => value.includes("@");
  const {
    value: nameValue,
    isValid: nameIsValid,
    hasError: nameHasError,
    valueChangeHandler: nameChangeHandler,
    inputBlurHandler: nameBlurHandler,
    reset: resetName,
  } = useInput(isNotEmpty);

  const {
    value: emailValue,
    isValid: emailIsValid,
    hasError: emailHasError,
    valueChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    reset: resetEmail,
  } = useInput(isEmail);

  const {
    value: messageValue,
    isValid: messageIsValid,
    hasError: messageHasError,
    valueChangeHandler: messageChangeHandler,
    inputBlurHandler: messageBlurHandler,
    reset: resetMessage,
  } = useInput(isNotEmpty);

  let formIsValid = false;

  if (nameIsValid && messageIsValid && emailIsValid) {
    formIsValid = true;
  }

  const submitHandler = (event) => {
    event.preventDefault();

    if (!formIsValid) return;

    console.log("Submitted");
    console.log(nameValue, messageValue, emailValue);

    resetName();
    resetMessage();
    resetEmail();
  };

  const nameClasses = nameHasError ? "form-control invalid" : "form-control";
  const messageClasses = messageHasError
    ? "form-control invalid"
    : "form-control";
  const emailClasses = emailHasError ? "form-control invalid" : "form-control";

  return (
    <div className={classes.card}>
      <h1 className={classes.main__heading}>Contact Form</h1>
      <form method="POST" className={classes.form} onSubmit={submitHandler}>
        <div className={nameClasses}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
            onChange={nameChangeHandler}
            onBlur={nameBlurHandler}
            value={nameValue}
          />
          {nameHasError && (
            <p className="error-text">Please Enter a Valid Name.</p>
          )}
        </div>
        <div className={emailClasses}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={emailValue}
            placeholder="Your Email"
            onChange={emailChangeHandler}
            onBlur={emailBlurHandler}
          />
          {emailHasError && (
            <p className="error-text">Please Enter a Valid Email.</p>
          )}
        </div>
        <div className={messageClasses}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            type="text"
            value={messageValue}
            placeholder="Your Message"
            className={classes.message}
            onChange={messageChangeHandler}
            onBlur={messageBlurHandler}
          ></textarea>
          {messageHasError && (
            <p className="error-text">Message can't be empty.</p>
          )}
        </div>
        <div className="form-actions">
          <Button
            type="submit"
            title="Send Message"
            disabled={!formIsValid}
            className="form-actions"
          ></Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
