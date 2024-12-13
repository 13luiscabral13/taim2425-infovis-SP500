//import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import ChartView from './ChartView';
import MapView from './MapView';
import NavBar from './NavBar';

function App() {
  // State to track the current view/page
  const [currentPage, setCurrentPage] = useState('ChartView');

  return (
    <div>
      <NavBar setCurrentPage={setCurrentPage} />
      {currentPage === 'MapView' && <MapView />}
      {currentPage === 'ChartView' && <ChartView />}
    </div>
  );
}

export default App;
