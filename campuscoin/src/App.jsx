import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Login from './page/Login'
import Register from './page/Register'
import ForgotPassword from './page/ForgotPassword'
import StudentDashboard from './page/student/Dashboard'
import AdminDashboard from './page/admin/Dashboard'
import EventDetails from './page/student/EventDetails'
import RewardMarketplace from './page/student/RewardMarketplace'
import TransactionHistory from './page/student/TransactionHistory'
import EventManagement from './page/admin/EventManagement'
import AttendanceVerification from './page/admin/AttendanceVerification'
import RewardManagement from './page/admin/RewardManagement'
import SellerDashboard from './page/seller/Dashboard'
import ProductManagement from './page/seller/ProductManagement'
import AddProduct from './page/seller/AddProduct'
import Layout from './components/Layout'
import { UserProvider } from './context/UserContext'
export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Student Routes */}
          <Route path="/student" element={<Layout userType="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="event/:id" element={<EventDetails />} />
            <Route path="rewards" element={<RewardMarketplace />} />
            <Route path="transactions" element={<TransactionHistory />} />
          </Route>
          {/* Admin Routes */}
          <Route path="/admin" element={<Layout userType="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="attendance" element={<AttendanceVerification />} />
            <Route path="rewards" element={<RewardManagement />} />
          </Route>
          {/* Seller Routes */}
          <Route path="/seller" element={<Layout userType="seller" />}>
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddProduct />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  )
}
