import React, { useState, useEffect } from 'react';
import { getCurrentLanguage } from './NavBar';

const RangeFilter = ({ onRangeFilterChange, language }) => {
    console.log("language: " + language )

    // Update labels dynamically based on the selected language
    const labels = {
        en: {
            number_elements: 'Number of elements : 10',
        },
        pt: {
            number_elements: 'Número de elementos: 10',
        },
    };

    const changeValue = (e) => {
        const rangeValue = document.getElementById("rangeValue");
        rangeValue.innerHTML = "Number of elements: " + e.target.value;
        onRangeFilterChange(e.target.value);
    };
    return (
        <div>
            <p id="rangeValue">{labels[language].number_elements}</p>
            <input type="range" id="rangeInput" name="rangeInput" min="0" max="20" step="1" defaultValue="10" onChange={changeValue}/>
        </div>
    );
};

export default RangeFilter;