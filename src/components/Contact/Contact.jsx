import classes from "./Contact.module.css";
import ContactForm from "./ContactForm";
import Details from "./Detail";

const ContactPage = () => {
  return (
    <>
      <h1 className={classes.main__heading}>
        Let's Get in Touch: Ways to Connect with Me
      </h1>
      {/* <div>
        
        <p className={classes.subheading}>
          Thank you for your interest in getting in touch with me. I welcome
          your feedback, questions, and suggestions. If you have a specific
          question or comment, please feel free to email me directly at{" "}
          <a
            href="mailto: shashankrajjais@gmail.com"
            target="__blank"
            style={{ textDecoration: "none", color: "#1412EF" }}
          >
            My Email
          </a>
          . I make an effort to respond to all messages within 24 hours,
          although it may take me longer during busy periods. Alternatively, you
          can use the contact form on my website to get in touch. Simply fill
          out the required fields and I'll get back to you as soon as possible.
          Finally, if you prefer to connect on social media, you can find me on{" "}
          <a
            href="https://instagram.com/shhhashank.__"
            target="__blank"
            style={{ textDecoration: "none", color: "#1412EF" }}
          >
            Instagram
          </a>
          . I post regular updates and engage with my followers there, so don't
          hesitate to reach out. Thanks again for your interest, and I look
          forward to hearing from you!
        </p>
      </div>
      <div>
        <h1 className={classes.main__heading}>Contact Form</h1>
        <p className={classes.subheading}>
          Please fill out the form below to get in touch with me. I'll get back
          to you as soon as possible.
        </p>
      </div> */}
      <div className={classes.container}>
        <ContactForm />
        <Details />
      </div>
    </>
  );
};

export default ContactPage;
