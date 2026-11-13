import { Navigate } from "react-router-dom";
import Login from "../components/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";
import Home from "../pages/dashboard/home/Home";
import AddProduct from "../pages/dashboard/inventory/product/AddProduct";
import CreateSaleInvoice from "../pages/dashboard/invoice/sale/CreateSaleInvoice";
import SettingsLayout from "../pages/dashboard/settings/SettingsLayout";
import SettingsSection from "../pages/dashboard/settings/SettingsSection";

export const routes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <Dashboard />,
        children: [
          { index: true, element: <Home /> },
          { path: "product/add", element: <AddProduct /> },
          { path: "invoice/sale/create", element: <CreateSaleInvoice /> },
          {
            path: "settings",
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="business" replace /> },
              { path: ":section", element: <SettingsSection /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
];
