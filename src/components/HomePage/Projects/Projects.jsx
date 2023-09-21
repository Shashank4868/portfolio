import { Fragment } from "react";
import ProjectCard from "./Project-card";
import classes from "./Projects.module.css";
import todo from "../../../assets/todo.png";
import food from "../../../assets/food.png";

const DATA = [
  {
    id: 1,
    title: "To-do App",
    text: "A simple to-do app to help you plan your day.",
    src: todo,
    alt: "todo",
    link: "https://yourtodoist.netlify.app/",
    tech: [
      {
        id: 1,
        title: "HTML",
      },
      {
        id: 2,
        title: "CSS",
      },
      {
        id: 3,
        title: "JavaScript",
      },
    ],
  },
  {
    id: 2,
    title: "Food Order App",
    text: "A web app used as a website for hotels to help them manage their food orders.",
    src: food,
    alt: "food-order",
    link: "https://hungerkiller.netlify.app/",
    tech: [
      {
        id: 1,
        title: "HTML",
      },
      {
        id: 2,
        title: "CSS",
      },
      {
        id: 3,
        title: "JavaScript",
      },
      {
        id: 4,
        title: "ReactJS",
      },
    ],
  },
  {
    id: 2,
    title: "SpiceNest",
    text: "A web application made using MERN stack technology to login and order your favourite food.",
    src: food,
    alt: "Hotel Management Web Application",
    link: "https://github.com/Shashank4868/Spicenest",
    tech: [
      {
        id: 1,
        title: "HTML",
      },
      {
        id: 2,
        title: "CSS",
      },
      {
        id: 3,
        title: "JavaScript",
      },
      {
        id: 4,
        title: "ReactJS",
      },
      {
        id: 5,
        title: "NodeJS",
      },
      {
        id: 6,
        title: "ExpressJS",
      },
      {
        id: 7,
        title: "MongoDB",
      },
    ],
  },
];

const Projects = () => {
  return (
    <Fragment>
      {/* <p className={classes.title}>Projects</p> */}
      <p className={classes.heading}>
        Things I've made trying to put my dent in the universe.
      </p>
      <div className={classes.subheading}>
        I've worked on a variety of projects over the years and I'm proud of the
        progress I've made. Many of these projects are open-source and available
        for others to explore and contribute to. If you're interested in any of
        the projects I've worked on, please feel free to check out the code and
        suggest any improvements or enhancements you might have in mind.
        Collaborating with others is a great way to learn and grow, and I'm
        always open to new ideas and feedback.
      </div>
      <ul className={classes.cards}>
        {DATA.map((item) => (
          <li key={item.id}>
            <ProjectCard
              title={item.title}
              src={item.src}
              text={item.text}
              alt={item.alt}
              tech={item.tech}
              link={item.link}
            />
          </li>
        ))}
      </ul>
    </Fragment>
  );
};

export default Projects;
