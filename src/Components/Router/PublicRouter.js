import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Auth from '../Modules/Auth';
import Error404 from '../Modules/Error404';

const PublicRouter = createBrowserRouter([
    {
        path: "/",
        element: <Outlet />,
        children: [
            {
                path: "/",
                element: localStorage.getItem('token') && localStorage.getItem('user_status') !== '0'
                    ? <Navigate to="/dashboard" />
                    : <Navigate to="auth" />,
            },
            {
                path: "auth",
                element: <Auth />,
            },
            {
                path: "*",
                element: <Error404 />,
            },
        ],
    },
]);

export default PublicRouter;
