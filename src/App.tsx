import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CalendarPage from './pages/calendar/CalendarPage';
import RoomListPage from './pages/rooms/RoomListPage';
import RoomCreatePage from './pages/rooms/RoomCreatePage';
import RoomEditPage from './pages/rooms/RoomEditPage';
import BookingRequestsPage from './pages/bookings/BookingRequestsPage';
import BookingCreatePage from './pages/bookings/BookingCreatePage';
import BookingRequestForm from './pages/bookings/BookingRequestForm';
import MenuControlPage from './pages/menu/MenuControlPage';
import OrdersListPage from './pages/menu/OrdersListPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import HistoryPage from './pages/history/HistoryPage';
import GuestsPage from './pages/guests/GuestsPage';
import SettingsPage from './pages/settings/SettingsPage';
import LandingPage from './pages/landing/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<CalendarPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/rooms/list" element={<RoomListPage />} />
          <Route path="/rooms" element={<RoomCreatePage />} />
          <Route path="/rooms/:id/edit" element={<RoomEditPage />} />
          <Route path="/bookings/requests" element={<BookingRequestsPage />} />
          <Route path="/bookings/create/:requestId" element={<BookingCreatePage />} />
          <Route path="/bookings/request/new" element={<BookingRequestForm />} />
          <Route path="/menu" element={<MenuControlPage />} />
          <Route path="/menu/orders" element={<OrdersListPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;