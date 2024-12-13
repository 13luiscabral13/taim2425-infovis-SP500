import React, { useState, useEffect } from 'react';
import './Filters.css';
import sectors_en from './sector_list_en.json'; // Adjust the path as needed
import sectors_pt from './sector_list_pt.json';
import states from './state_list.json'; // Adjust the path as needed
import { getCurrentLanguage } from './NavBar';


const OwnershipFilters = ({ onSubFilterChange, language }) => {
    const [subCategory, setCategory] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    console.log("language: " + language )

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

    // Update labels dynamically based on the selected language
    const labels = {
        en: {
            bySector: 'By Sector',
            byState: 'By State',
            inGeneral: 'In General',
            search: 'Search for ',
            sector: 'Sector',
            state: 'State',
        },
        pt: {
            bySector: 'Por Setor',
            byState: 'Por estado',
            inGeneral: 'Geral',
            search: 'Pesquisar por ',
            sector: 'Setor',
            state: 'Estado',
        },
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            if(language==='en'){
                const results = searchAttribute(query, subCategory === 'sector' ? sectors_en : states);
                setSuggestions(results);
            }
            else if(language==='pt'){
                const results = searchAttribute(query, subCategory === 'sector' ? sectors_en : states);
                setSuggestions(results);
            }
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
        setSearchQuery('');
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
                {labels[language].bySector}
            </label>
            <label>
                <input
                    type="radio"
                    value="state"
                    checked={subCategory === 'state'}
                    onChange={handleSubCategoryChange}
                />
                {labels[language].byState}
            </label>
            <label>
                <input
                    type="radio"
                    value="general"
                    checked={subCategory === 'general'}
                    onChange={handleSubCategoryChange}                    
                />
                {labels[language].inGeneral}
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
                            placeholder={labels[language].search + (subCategory === 'sector' ? labels[language].sector : labels[language].state)}
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
