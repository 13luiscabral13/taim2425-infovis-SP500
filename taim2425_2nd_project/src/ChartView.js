import React, { useState } from 'react';
import './App.css';
import Chart from './Chart';
import Filters from './Filters';
import ShareholderFilters from './ShareholderFilters';
import OwnershipFilters from './OwnershipFilters';

function ChartView() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedSubFilter, setSelectedSubFilter] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleFilterChange = (filter) => {
    console.log('Selected filter:', filter);
    if (filter.category != selectedFilter) {
    setSelectedFilter(filter.category);
    }
    setSelectedSubFilter('');
  };

  const handleSubFilterChange = (subFilter) => {
    console.log('Selected sub-filter:', subFilter);
    setSelectedSubFilter(subFilter);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  function search() {
    // Reload the Chart component with the new filter and sub-filter
    console.log('Executing search with:', selectedFilter, selectedSubFilter);
    setSearchTriggered(!searchTriggered); // This will cause the Chart component to re-render
    closeSidebar();
    console.log("searchTriggered: ", searchTriggered);
  };

  return (
    <div className="chart-view">
      <button onClick={toggleSidebar} className="toggle-button">
        {isSidebarVisible ? 'Close Filters' : 'Open Filters'}
      </button>

      <div className={`sidebar-overlay ${isSidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-content">
          <div>
          <button onClick={closeSidebar} className="close-button"><p id="closeBtnText">X</p></button>
          <Filters onFilterChange={handleFilterChange} />
          </div>
          <hr></hr>
          <div>
          {selectedFilter=="shareholder" && <ShareholderFilters onSubFilterChange={handleSubFilterChange} />}
          {selectedFilter=="ownership" && <OwnershipFilters onSubFilterChange={handleSubFilterChange} />}
          <button id="search-btn" onClick={search} >Search</button>
          </div>
        </div>
      </div>
      <Chart filter={selectedFilter} subFilter={selectedSubFilter} searchTriggered={searchTriggered}/>
    </div>
  );
}

export default ChartView;
