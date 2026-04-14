import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { LandingPage } from "./pages/LandingPage";
import { UserLogin } from "./pages/user/UserLogin";
import { UserRegister } from "./pages/user/UserRegister";
import { UserHome } from "./pages/user/UserHome";
import { BookingPage } from "./pages/user/BookingPage";
import { PaymentPage } from "./pages/user/PaymentPage";
import { BookingConfirmation } from "./pages/user/BookingConfirmation";
import { UserBookingHistory } from "./pages/user/UserBookingHistory";
import { SubscriptionPage } from "./pages/user/SubscriptionPage";
import { ProfilePage } from "./pages/user/ProfilePage";
import { ContactPage } from "./pages/ContactPage";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminBookings } from "./pages/admin/AdminBookings";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { NotFound } from "./pages/NotFound";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "user/login",
        element: <UserLogin />,
      },
      {
        path: "user/register",
        element: <UserRegister />,
      },
      {
        path: "user/home",
        element: <UserHome />,
      },
      {
        path: "user/booking",
        element: <BookingPage />,
      },
      {
        path: "user/payment",
        element: <PaymentPage />,
      },
      {
        path: "user/booking-confirmation",
        element: <BookingConfirmation />,
      },
      {
        path: "user/history",
        element: <UserBookingHistory />,
      },
      {
        path: "user/subscription",
        element: <SubscriptionPage />,
      },
      {
        path: "user/profile",
        element: <ProfilePage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "admin/login",
        element: <AdminLogin />,
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "admin/bookings",
        element: <AdminBookings />,
      },
      {
        path: "admin/settings",
        element: <AdminSettings />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);