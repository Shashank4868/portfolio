import { RouterProvider, createBrowserRouter } from "react-router-dom";

import HomePage from "./components/HomePage/HomePage.jsx";
import About from "./components/About/About.jsx";
import RootLayout from "./components/HomePage/Nav/Root.jsx";
import Projects from "./components/HomePage/Projects/Projects.jsx";
import ContactPage from "./components/Contact/Contact.jsx";
import ErrorPage from "./components/ErrorPage/ErrorPage.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/aboutme",
        element: <About />,
      },
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
