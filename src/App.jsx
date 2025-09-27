import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Login from './views/pages/Login'
import Register from './views/pages/Register'
import ForgotPassword from './views/pages/ForgotPassword'
import StudentDashboard from './views/pages/student/Dashboard'
import AdminDashboard from './views/pages/admin/Dashboard'
import EventDetails from './views/pages/student/EventDetails'
import RewardMarketplace from './views/pages/student/RewardMarketplace'
import TransactionHistory from './views/pages/student/TransactionHistory'
import EventManagement from './views/pages/admin/EventManagement'
import AttendanceVerification from './views/pages/admin/AttendanceVerification'
import RewardManagement from './views/pages/admin/RewardManagement'
import SellerDashboard from './views/pages/seller/Dashboard'
import ProductManagement from './views/pages/seller/ProductManagement'
import AddProduct from './views/pages/seller/AddProduct'
import Layout from './views/components/Layout'  
import Events from './views/pages/student/Events'
import Sales from './views/pages/seller/Sales'
import UserManagement from './views/pages/admin/UserManagement'
import { BalanceProvider } from "./views/components/BalanceContext";
import SuperAdminLayout from './views/components/SuperAdminLayout'
import SuperAdminDashboard from './views/pages/superadmin/Dashboard'
import ValidateAdmin from './views/pages/superadmin/ValidateAdmin'
import ValidateStudent from './views/pages/superadmin/ValidateStudent'
import ValidateSeller from './views/pages/superadmin/ValidateSeller'
import { AuthProvider } from "./views/components/AuthContext";
import AllUser from './views/pages/superadmin/AllUser'
export default function App() {
  return (
    <BalanceProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
              {/* Super Admin Routes */}
             <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="validate/admin" element={<ValidateAdmin />} />
              <Route path="validate/student" element={<ValidateStudent />} />
              <Route path="validate/seller" element={<ValidateSeller />} />
              <Route path="users" element={< AllUser/>}/>
            </Route>
            {/* Student Routes */}
            <Route path="/student" element={<Layout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="event/:id" element={<EventDetails />} />
              <Route path="events" element={< Events/>}/>
              <Route path="rewards" element={<RewardMarketplace />} />
              <Route path="transactions" element={<TransactionHistory />} />
            </Route>
            {/* Admin Routes */}
            <Route path="/admin" element={<Layout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<EventManagement />} />
              <Route path="attendance" element={<AttendanceVerification />} />
              <Route path="rewards" element={<RewardManagement />} />
              <Route path="users" element={<UserManagement/>}/>
            </Route>
            {/* Seller Routes */}
            <Route path="/seller" element={<Layout />}>
              <Route index element={<SellerDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="sales" element={<Sales/>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </BalanceProvider>
  )
}
