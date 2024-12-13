import React, { useState, useEffect } from 'react';
import { getCurrentLanguage } from './NavBar';
import './Filters.css';

const Filters = ({ onFilterChange, language }) => {
    const [category, setCategory] = useState('ownership');
    console.log("language: " + language )

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        onFilterChange({ category: e.target.value });
    };

    // Update labels dynamically based on the selected language
    const labels = {
        en: {
            shareholder: 'Shareholder Search',
            ownership: 'Ownership Concentration',
            specific: 'Compare a Shareholder',
        },
        pt: {
            shareholder: 'Pesquisa de Acionistas',
            ownership: 'Concentração de Propriedade',
            specific: 'Compare um Acionista',
        },
    };

    return (
        <div className="filters">
            <label>
                <input
                    type="radio"
                    value="shareholder"
                    checked={category === 'shareholder'}
                    onChange={handleCategoryChange}
                />
                {labels[language].shareholder}
            </label>
            <label>
                <input
                    type="radio"
                    value="ownership"
                    checked={category === 'ownership'}
                    onChange={handleCategoryChange}
                />
                {labels[language].ownership}
            </label>
            <label>
                <input
                    type="radio"
                    value="specific"
                    checked={category === 'specific'}
                    onChange={handleCategoryChange}
                />
                {labels[language].specific}
            </label>
        </div>
    );
};

export default Filters;
