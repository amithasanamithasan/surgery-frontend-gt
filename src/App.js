import './index.css';
import { RouterProvider } from "react-router-dom";
import ProjectRouter from "./Components/Router/ProjectRouter";
import PublicRouter from "./Components/Router/PublicRouter";
import React, { useEffect, useState } from 'react';

function App() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStatus = localStorage.getItem('user_status');

    if (token && userStatus !== '0') {
      setAuth(true);
    } else {
      setAuth(false);
    }
  }, []);

  return (
    <>
      {auth ? <RouterProvider router={ProjectRouter} /> : <RouterProvider router={PublicRouter} />}
    </>
  );
}

export default App;
