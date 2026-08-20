import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AppRoutes />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(9, 9, 17, 0.95)',
            color: '#f3f4f6',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            fontFamily: "'Outfit', 'Cairo', sans-serif",
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.02em',
            padding: '14px 22px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.15)',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
            style: {
              borderColor: 'rgba(16, 185, 129, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.15)',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              borderColor: 'rgba(239, 68, 68, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(239, 68, 68, 0.15)',
            }
          }
        }}
      />
    </LanguageProvider>
  );
}

export default App;
