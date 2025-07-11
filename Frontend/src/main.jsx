import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PrinterProvider } from './contexts/PrinterContext'; // Import the new provider
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PrinterProvider> {/* Wrap App with PrinterProvider */}
          <Toaster position="bottom-center" reverseOrder={false} />
          <App />
        </PrinterProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);