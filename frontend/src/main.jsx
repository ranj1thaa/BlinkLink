import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from "react-hot-toast";
import AuthProvider from './context/AuthContext.jsx';
createRoot(document.getElementById('root')).render(
    <>
        <AuthProvider>
            <App />
            <Toaster position="top-right" />  
        </AuthProvider>
    </>
)
