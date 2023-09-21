import { NavLink } from "react-router-dom";

import classes from "./MenuList.module.css";

const MenuList = () => {
  return (
    <nav>
      <ul className={classes.ul__List}>
        <li>
          <NavLink
            to="/"
            className={classes.list}
            style={({ isActive }) => {
              return {
                color: isActive ? "red" : "black",
              };
            }}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/projects"
            className={classes.list}
            style={({ isActive }) => {
              return {
                color: isActive ? "red" : "black",
              };
            }}
          >
            Projects
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/aboutme"
            className={classes.list}
            style={({ isActive }) => {
              return {
                color: isActive ? "red" : "black",
              };
            }}
          >
            About Me
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/Contact"
            className={classes.list}
            style={({ isActive }) => {
              return {
                color: isActive ? "red" : "black",
              };
            }}
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default MenuList;
