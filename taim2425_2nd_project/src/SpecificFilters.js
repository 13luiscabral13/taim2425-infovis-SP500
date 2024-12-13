import React, { useState } from 'react';
import './Filters.css';
import shareholders from './shareholder_list.json'; // Adjust the path as needed
import sectors from './sector_list.json'; // Adjust the path as needed
import states from './state_list.json'; // Adjust the path as needed

const SpecificFilters = ({onSubFilterChange}) => {
    const [subCategory, setCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [stateSectorSearchQuery, setStateSectorSearchQuery] = useState('');
    const [stateSectorSuggestions, setStateSectorSuggestions] = useState([]);

    const handleSubCategoryChange = (e) => {
        setCategory(e.target.value);
        onSubFilterChange({ subCategory: e.target.value, shareholder: searchQuery });
    };

    // Basic fuzzy search function
    const searchElements = (query, attribute, length) => {
        if (!query || query.length < length) return [];
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
            return matchCount / lowerCaseQuery.length >= 0.8; // Adjust this threshold as needed
        });
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const results = searchElements(query, shareholders, 3);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const handleStateSectorSearchChange = (e) => {
        const query = e.target.value;
        setStateSectorSearchQuery(query);

        if (query.length > 0) {
            const results = searchElements(query, subCategory === 'sector' ? sectors : states, 1);
            setStateSectorSuggestions(results);
        } else {
            setStateSectorSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        onSubFilterChange({ subCategory, shareholder: suggestion, specificity: stateSectorSearchQuery });
        setSuggestions([]); // Clear suggestions when a suggestion is clicked
    };

    const handleStateSectorSuggestionClick = (suggestion) => {
        setStateSectorSearchQuery(suggestion);
        onSubFilterChange({ subCategory, searchQuery, specificity: suggestion });
        setStateSectorSuggestions([]); // Clear suggestions when a suggestion is clicked
    };

    const deleteSuggestions = () => {
        setSuggestions([]);
        setSearchQuery('');
    };

    const deleteStateSectorSuggestions = () => {
        setStateSectorSuggestions([]);
        setStateSectorSearchQuery('');
    }

    return (
        <div className='shareholder filters'>
        <div className="searchInput">
        <button id="deleteText" onClick={() => deleteSuggestions()} ><img src='/image.png'></img></button>
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
                    <button id="deleteText" onClick={() => deleteStateSectorSuggestions()} ><img src="/image.png"></img></button>
                    <label>
                        <input
                            type="text"
                            value={stateSectorSearchQuery}
                            onChange={handleStateSectorSearchChange}
                            placeholder={"Search for " + (subCategory === 'sector' ? 'Sector' : 'State')}
                        />
                    </label>
                </div>
            ) : null}
            {stateSectorSuggestions.length > 0 && (
                <ul className="suggestions-list">
                    {stateSectorSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleStateSectorSuggestionClick(suggestion)}
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

export default SpecificFilters;