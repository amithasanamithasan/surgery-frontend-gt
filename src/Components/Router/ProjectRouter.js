import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Error500 from "../Modules/Error500";
import Error404 from "../Modules/Error404";
import Error401 from "../Modules/Error401";
import Dashboard from "../Modules/Dashboard";
import Administration from "../Modules/UserSetting/Administration";
import SendMessage from "../Modules/UserSetting/SendMessage";
import Massages from "../Modules/UserSetting/Massages";
import InboxMassage from "../Modules/UserSetting/inboxMessage";
import ReplyMessage from "../Modules/UserSetting/replyMassage";
import InboxSentMessage from "../Modules/UserSetting/inboxSentMessage";
import HospitalRound from "../Modules/HospitalRoundSetting/HospitalRound";
import SearchByName from "../Modules/HospitalRoundSetting/searchByName";
import SearchByDate from "../Modules/HospitalRoundSetting/searchByDate";
import OparativeLog from "../Modules/OparativeLogSetting/oparativeLog";
import SearchByNameOL from "../Modules/OparativeLogSetting/searchByName";
import SearchByDateOL from "../Modules/OparativeLogSetting/searchByDate";
import DailySchedule from "../Modules/DailyScheduleSetting/DailySchedule";
import AddEvent from "../Modules/DailyScheduleSetting/addEvent";
import EditEvent from "../Modules/DailyScheduleSetting/EditEvent";
import SearchByDateDs from "../Modules/DailyScheduleSetting/SearchByDateDS";
import MonthlyCallForm from "../Modules/MonthlyScheduleSetting/addDataCalendar";
import MonthlyCallCalender from "../Modules/MonthlyScheduleSetting/MonthlyCallCalender";
import EditCallCalender from "../Modules/MonthlyScheduleSetting/EditCallCalender";
import BlockCalender from "../Modules/MonthlyScheduleSetting/BlockCalender";
import EditBlockCalender from "../Modules/MonthlyScheduleSetting/EditBlockCalender";
import SearchMonthlyCallCalender from "../Modules/MonthlyScheduleSetting/SearchMonthlyCallCalender";

const ProjectRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Outlet />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="dashboard" />, // Redirect to dashboard by default
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "administration",
        element: (
          <PrivateRoute requiredRoles={[1, 2]}>
            <Administration />
          </PrivateRoute>
        ),
      },
      {
        path: "messages",
        element: <Massages />,
      },
      {
        path: "send-message",
        element: <SendMessage />,
      },
      {
        path: "/message-reply/:id/:senderId",
        element: <ReplyMessage />,
      },
      {
        path: "/recivedbox/:id",
        element: <InboxMassage />,
      },
      {
        path: "sentbox/:id",
        element: <InboxSentMessage />,
      },
      {
        // Hospital Oparative Round
        path: "/hospital-round",
        element: (
          <PrivateRoute>
            <HospitalRound />
          </PrivateRoute>
        ),
      },
      {
        path: "/hospital-round-search",
        element: (
          <PrivateRoute>
            <SearchByName />
          </PrivateRoute>
        ),
      },
      {
        path: "/hospital-round-search-date",
        element: (
          // <PrivateRoute requiredRoles={[1, 3]}>
          <PrivateRoute>
            <SearchByDate />
          </PrivateRoute>
        ),
      },
      // Operative Log
      {
        path: "/oparative-log",
        element: (
          <PrivateRoute>
            <OparativeLog />
          </PrivateRoute>
        ),
      },
      {
        path: "/oparative-log-search",
        element: (
          <PrivateRoute>
            <SearchByNameOL />
          </PrivateRoute>
        ),
      },
      {
        path: "/oparative-log-search-date",
        element: (
          <PrivateRoute>
            <SearchByDateOL />
          </PrivateRoute>
        ),
      },
      // Daily Schedule
      {
        path: "/daily-schedule",
        element: (
          <PrivateRoute>
            <DailySchedule />
          </PrivateRoute>
        ),
      },
      {
        path: "/add-event",
        element: (
          <PrivateRoute requiredRoles={[1, 2, 4]}>
            <AddEvent />
          </PrivateRoute>
        ),
      },
      {
        path: "/edit-event/:id",
        element: (
          <PrivateRoute requiredRoles={[1, 2, 4]}>
            <EditEvent />
          </PrivateRoute>
        ),
      },
      {
        path: "/daily-schedule-search-by-date",
        element: (
          <PrivateRoute>
            <SearchByDateDs />
          </PrivateRoute>
        ),
      },
      // Montly Schedule
      {
        path: "/montly-schedule",
        element: (
          <PrivateRoute>
            <MonthlyCallCalender />
          </PrivateRoute>
        ),
      },
      {
        path: "/search-montly-schedule",
        element: (
          <PrivateRoute>
            <SearchMonthlyCallCalender />
          </PrivateRoute>
        ),
      },
      {
        path: "/edit-call-calender",
        element: (
          <PrivateRoute requiredRoles={[1, 2]}>
            <EditCallCalender />
          </PrivateRoute>
        ),
      },
      {
        path: "/add-montly-schedule",
        element: (
          <PrivateRoute requiredRoles={[1, 2]}>
            <MonthlyCallForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/block-calender",
        element: (
          <PrivateRoute>
            <BlockCalender />
          </PrivateRoute>
        ),
      },
      {
        path: "/edit-block-calender",
        element: (
          <PrivateRoute requiredRoles={[1, 2]}>
            <EditBlockCalender />
          </PrivateRoute>
        ),
      },
      {
        // error page
        path: "error-500",
        element: <Error500 />,
      },
      {
        path: "error-401",
        element: <Error401 />,
      },
      {
        path: "*",
        element: <Error404 />,
      },
    ],
  },
]);

export default ProjectRouter;
