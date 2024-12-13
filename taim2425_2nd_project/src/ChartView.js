import React, { useState, useEffect } from 'react';
import './App.css';
import Chart from './Chart';
import Filters from './Filters';
import ShareholderFilters from './ShareholderFilters';
import OwnershipFilters from './OwnershipFilters';
import RangeFilter from './RangeFilter';
import SpecificFilters from './SpecificFilters';
import { getCurrentLanguage } from './NavBar';

function ChartView() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ownership");
  const [selectedSubFilter, setSelectedSubFilter] = useState({ subCategory: "general" });
  const [selectedRangeFilter, setSelectedRangeFilter] = useState(10);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const languageSelect = getCurrentLanguage() || { value: "en" };
  const [language, setLanguage] = useState(languageSelect.value); // Default language
  console.log("language: " + language )

// Update labels dynamically based on the selected language
const labels = {
  en: {
      search: 'Search',
      open_filters: 'Open Filters',
      close_filters: 'Close Filters',
  },
  pt: {
      search: 'Pesquisar',
      open_filters: 'Abrir Filtros',
      close_filters: 'Fechar Filtros',
  },
};

  useEffect(() => {
    const languageSelect = getCurrentLanguage(); // Get the language select element

    const handleLanguageChange = () => {
        setLanguage(languageSelect.value); // Update language state when the selection changes
    };

    languageSelect.addEventListener('change', () => {
        handleLanguageChange()
    });

    return () => {
        languageSelect.removeEventListener('change', handleLanguageChange); // Cleanup
    };
}, []);

  function getSearchBar(){
    const searchBar = document.querySelector('.searchInput input')
    return searchBar
  }

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

  const handleRangeFilterChange = (rangeFilter) => {
    console.log('Selected range filter:', rangeFilter);
    setSelectedRangeFilter(rangeFilter);
  }


  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  function search() {
    if (selectedSubFilter.subCategory == "ownership" && !selectedSubFilter.identifier) {
      alert("Please select a valid sub-filter.");
      return;
    }
    else {
      // Reload the Chart component with the new filter and sub-filter
      console.log('Executing search with:', selectedFilter, selectedSubFilter);
      setSearchTriggered(!searchTriggered); // This will cause the Chart component to re-render
      closeSidebar();
      console.log("searchTriggered: ", searchTriggered);
    }
  };

  return (
    <div className="chart-view">
      <button onClick={toggleSidebar} className="toggle-button">
        {isSidebarVisible ? labels[language].close_filters : labels[language].open_filters}
      </button>

      <div className={`sidebar-overlay ${isSidebarVisible ? 'visible' : ''}`}>
        <div className="sidebar-content">
          <div>
            <button onClick={closeSidebar} className="close-button"></button>
            <Filters onFilterChange={handleFilterChange} language={language} />
          </div>
          <hr></hr>
          <div>
            {selectedFilter == "shareholder" && <ShareholderFilters onSubFilterChange={handleSubFilterChange} language={language} />}
            {selectedFilter == "ownership" && <OwnershipFilters onSubFilterChange={handleSubFilterChange} language={language} />}
            {selectedFilter == "specific" && <SpecificFilters onSubFilterChange={handleSubFilterChange} language={language} />}
          </div>
          <hr></hr>
          <RangeFilter onRangeFilterChange={handleRangeFilterChange} language={language} />
          <button id="search-btn" onClick={search} >{labels[language].search}</button>
        </div>
      </div>
      {console.log(selectedSubFilter)}
      <Chart filter={selectedFilter} subFilter={selectedSubFilter} searchTriggered={searchTriggered} range={selectedRangeFilter} language={language} />
    </div>
  );
}

export default ChartView;
