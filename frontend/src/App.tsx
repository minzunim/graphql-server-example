import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import SubscriptionComponent from './Subscription';

function App() {
  return (
<div>
      <nav>
        <Link to="/subscription">구독</Link>
      </nav>

      <Routes>
        <Route path="/subscription" element={<SubscriptionComponent />} />
      </Routes>
    </div>  );
}

export default App;
