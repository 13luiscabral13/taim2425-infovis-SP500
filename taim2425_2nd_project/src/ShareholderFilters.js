import React, { useState } from 'react';
import './Filters.css';
import shareholders from './shareholder_list.json'; // Adjust the path as needed

const ShareholderFilters = ({ onSubFilterChange }) => {
    const [subCategory, setCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Basic fuzzy search function
    const searchShareholders = (query) => {
        if (!query || query.length < 4) return [];
        const lowerCaseQuery = query.toLowerCase();
        
        return shareholders.filter((shareholder) => {
            const lowerCaseShareholder = shareholder.toLowerCase();
            let matchCount = 0;
            let queryIndex = 0;
            
            // Check for fuzzy match with character skipping
            for (let i = 0; i < lowerCaseShareholder.length; i++) {
                if (queryIndex < lowerCaseQuery.length && lowerCaseShareholder[i] === lowerCaseQuery[queryIndex]) {
                    queryIndex++;
                    matchCount++;
                }
            }
            
            // Return true if most of the characters in the query were found in sequence
            return matchCount / lowerCaseQuery.length >= 0.8; // Adjust this threshold as needed
        });
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const results = searchShareholders(query);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        onSubFilterChange({ subCategory, identifier: suggestion });
        setSuggestions([]); // Clear suggestions when a suggestion is clicked
    };

    const deleteSuggestions = () => {
        setSuggestions([]);
        setSearchQuery('');
    };

    const handleSubCategoryChange = (e) => {
        setCategory(e.target.value);
        onSubFilterChange({ subCategory: e.target.value, identifier: searchQuery });
    };

    return (
        <div className="shareholder filters">
            <div className="searchInput">
            <button onClick={() => deleteSuggestions()} ></button>
            <label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for Shareholder"
                />
            </label>
            <br/>
            </div>
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="suggestion-item"
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
            <label>
                <input
                    type="radio"
                    value="sector"
                    checked={subCategory === 'sector'}
                    onChange={handleSubCategoryChange}
                />
                Sectors Invested In
            </label>
            <label>
                <input
                    type="radio"
                    value="company"
                    checked={subCategory === 'company'}
                    onChange={handleSubCategoryChange}
                />
                Companies Invested In
            </label>
            <br/>
        </div>
    );
};

export default ShareholderFilters;
