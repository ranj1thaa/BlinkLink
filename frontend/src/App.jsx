import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoute from './pages/admin/AdminRoute'
import { useAuthContext } from './context/AuthContext'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUrls from './pages/admin/AdminUrls'

function App() {
  const { user, loading } = useAuthContext();  

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute> <Dashboard/></ProtectedRoute>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />

        <Route  path="/admin/dashboard"  element={ <AdminRoute><AdminDashboard/></AdminRoute>} />
        <Route  path="/admin/users"  element={ <AdminRoute> <AdminUsers /></AdminRoute>}/>
        <Route  path="/admin/urls" element={ <AdminRoute> <AdminUrls /></AdminRoute>}/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App