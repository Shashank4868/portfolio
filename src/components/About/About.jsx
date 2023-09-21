import classes from "./About.module.css";

import passport from "../../assets/passport.png";

const skills = [
  "HTML",
  "CSS",
  "JavaScript",
  "ReactJS",
  "NodeJS",
  "C++",
  "Python",
  "Data Structures and Algorithms",
];

const hobbies = [
  "Coding",
  "Reading Books",
  "Playing Chess",
  "Playing Badminton",
  "Watching Movies and Series",
];

const achievements = [
  "State Rank Holder in 12th Intermediate Examinations",
  "Solved 400+ questions on leetcode",
  "Solved 100+ questions on Hackerrank",
];

const certifications = [
  {
    id: 1,
    name: "Microsoft Virtual Internship program",
    link: "https://drive.google.com/file/d/1lx0XZNgExQAv3AF1HBAGo6FIPNGS391O/view",
  },
  {
    id: 2,
    name: "Certificate of participaition in Jumpstart - Publicis Sapient",
    link: "https://unstop.com/certificate-preview/bed1466c-373f-41e9-9a90-618d41be1f21?utm_campaign=",
  },
  {
    id: 3,
    name: "Problem Solving (Basic) - Hackerrank",
    link: "https://www.hackerrank.com/certificates/dbb04a0d5add",
  },
  {
    id: 4,
    name: "Problem Solving (Intermediate) -Hackerrank",
    link: "https://www.hackerrank.com/certificates/63503ccc5157",
  },
  {
    id: 5,
    name: "Certificate of participation in Hero Campus challenge Season 8",
    link: "https://unstop.com/certificate-preview/1c4fd8e4-e4cd-4e0c-81d8-aeef74c79f41",
  },
  {
    id: 6,
    name: "Introduction to HTML5 - Coursera",
    link: "https://www.coursera.org/account/accomplishments/certificate/HFHWT58YJ4WX",
  },
];

const About = () => {
  return (
    <>
      {/* <p className={classes.title}>About Me</p> */}
      <div className={classes.container}>
        <img src={passport} alt="Profile" className={classes.left__image} />
        <p className={classes.main__text}>
          Hii,
          <span className={classes.main__text__name}>
            {" "}
            I am Shashank Raj.
          </span>{" "}
          I am a student currently pursuing my Bachelor of Technology degree in
          Information Technology from Kalinga Institute of Industrial
          Technology, Bhubaneswar. <br />A Frontend Developer and Coder. I am a
          passionate learner and always ready to learn new technologies. I am
          currently learning ReactJS and NodeJS. I am also interested in
          Competitive Programming and have a good knowledge of Data Structures
          and Algorithms.
          <br />
        </p>
      </div>
      <span
        className={classes.skills__hobbies__achievements__certifications}
        key={Math.random()}
      >
        My Skills
      </span>
      <div className={classes.detail}>
        {skills.map((skill) => (
          <span className={classes.boxes} key={Math.random()}>
            {skill}
          </span>
        ))}
      </div>
      <span
        className={classes.skills__hobbies__achievements__certifications}
        key={Math.random()}
      >
        My Hobbies
      </span>
      <div className={classes.detail}>
        {hobbies.map((hobby) => (
          <span className={classes.boxes} key={Math.random()}>
            {hobby}
          </span>
        ))}
      </div>
      <span
        className={classes.skills__hobbies__achievements__certifications}
        key={Math.random()}
      >
        My Achievements
      </span>{" "}
      <div className={classes.detail}>
        {achievements.map((achievement) => (
          <span className={classes.boxes} key={Math.random()}>
            {achievement}
          </span>
        ))}
      </div>
      <span
        className={classes.skills__hobbies__achievements__certifications}
        key={Math.random()}
      >
        My Certifications
        <br />( Click to view )
      </span>{" "}
      <div className={classes.detail}>
        {certifications.map((certification) => (
          <a
            className={classes.boxesa}
            href={certification.link}
            target="__blank"
            key={certification.id}
          >
            {certification.name}
          </a>
        ))}
      </div>
    </>
  );
};

export default About;
