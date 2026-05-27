import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { store } from './store';
import { setAccessToken, clearAuth } from './store/slices/authSlice';
// Import the setup function from your axios file
import { setupAxiosInterceptors } from './api/axiosInstance';
import ThemeProvider from './context/ThemeProvider';
import './index.css';

// Inject the store and actions BEFORE React renders. 
// This breaks the circular dependency!
setupAxiosInterceptors(store, setAccessToken, clearAuth);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);