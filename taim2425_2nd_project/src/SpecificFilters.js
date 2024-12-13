import React, { useState, useEffect } from 'react';
import './Filters.css';
import shareholders from './shareholder_list.json'; // Adjust the path as needed
import sectors_en from './sector_list_en.json'; // Adjust the path as needed
import sectors_pt from './sector_list_pt.json';
import states from './state_list.json'; // Adjust the path as needed
import { getCurrentLanguage } from './NavBar';

const SpecificFilters = ({ onSubFilterChange, language }) => {
    const [subCategory, setCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [stateSectorSearchQuery, setStateSectorSearchQuery] = useState('');
    const [stateSectorSuggestions, setStateSectorSuggestions] = useState([]);
    console.log("language: " + language )

    const handleSubCategoryChange = (e) => {
        setCategory(e.target.value);
        onSubFilterChange({ subCategory: e.target.value, shareholder: searchQuery });
        setStateSectorSearchQuery('')
    };

    // Update labels dynamically based on the selected language
    const labels = {
        en: {
            sector: 'By Sector',
            state: 'By State',
            general: 'In General',
            search: 'Search for ',
            sector: 'Sector',
            state: 'State',
            shareholder: 'Search for Shareholder',
        },
        pt: {
            sector: 'Por Setor',
            state: 'Por estado',
            general: 'Geral',
            search: 'Pesquisar por ',
            sector: 'Setor',
            state: 'Estado',
            shareholder: 'Pesquisar por Investidor',
        },
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
            if(language==='en'){
                const results = searchElements(query, subCategory === 'sector' ? sectors_en : states, 1);
                setStateSectorSuggestions(results);
            }
            else if(language==='pt'){
                const results = searchElements(query, subCategory === 'sector' ? sectors_en : states, 1);
                setStateSectorSuggestions(results);
            }
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
                placeholder={labels[language].shareholder}
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
                {labels[language].sector}
            </label>
            <label>
                <input
                    type="radio"
                    value="state"
                    checked={subCategory === 'state'}
                    onChange={handleSubCategoryChange}
                />
                {labels[language].state}
            </label>
            <label>
                <input
                    type="radio"
                    value="general"
                    checked={subCategory === 'general'}
                    onChange={handleSubCategoryChange}                    
                />
                {labels[language].general}
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
                            placeholder={labels[language].search + (subCategory === 'sector' ? labels[language].sector : labels[language].state)}
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