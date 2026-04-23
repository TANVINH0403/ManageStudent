// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css'; // Hoặc đường dẫn đến file css toàn cục của bạn
import { Provider } from 'react-redux';
import { store } from './redux/store.js'; // Nhập "Bộ não" vừa tạo

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bọc toàn bộ App bằng Provider để truyền dữ liệu đi mọi nơi */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)