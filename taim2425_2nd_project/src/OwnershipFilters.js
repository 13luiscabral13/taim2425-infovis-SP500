import React, { useState } from 'react';
import './Filters.css';
import sectors from './sector_list.json'; // Adjust the path as needed
import states from './state_list.json'; // Adjust the path as needed


const OwnershipFilters = ({ onSubFilterChange }) => {
    const [subCategory, setCategory] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Basic fuzzy search function
    const searchAttribute = (query, attribute) => {
        const lowerCaseQuery = query.toLowerCase();

        return attribute.filter((element) => {
            const lowerCaseElement = element.toLowerCase();
            let matchCount = 0;
            let queryIndex = 0;

            // Check for fuzzy match with character skipping
            for (let i = 0; i < lowerCaseElement.length; i++) {
                if (queryIndex < lowerCaseQuery.length && lowerCaseElement[i] === lowerCaseQuery[queryIndex]) {
                    queryIndex++;
                    matchCount++;
                }
            }

            // Return true if most of the characters in the query were found in sequence
            return matchCount / lowerCaseQuery.length >= 0.6; // Adjust this threshold as needed
        });
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const results = searchAttribute(query, subCategory === 'sector' ? sectors : states);
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
        onSubFilterChange({ subCategory: e.target.value });
    };

    return (
        <div className="ownership filters">
            <label>
                <input
                    type="radio"
                    value="sector"
                    checked={subCategory === 'sector'}
                    onChange={handleSubCategoryChange}
                />
                By Sector
            </label>
            <label>
                <input
                    type="radio"
                    value="state"
                    checked={subCategory === 'state'}
                    onChange={handleSubCategoryChange}
                />
                By State
            </label>
            <label>
                <input
                    type="radio"
                    value="general"
                    checked={subCategory === 'general'}
                    onChange={handleSubCategoryChange}                    
                />
                In General
            </label>
            <br />
            {subCategory === 'sector' || subCategory === 'state' ? (
                <div className="searchInput">
                    <button id="deleteText" onClick={() => deleteSuggestions()} ><img src="/image.png"></img></button>
                    <label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={"Search for " + (subCategory === 'sector' ? 'Sector' : 'State')}
                        />
                    </label>
                </div>
            ) : null}
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
        </div>
    );
};

export default OwnershipFilters;
