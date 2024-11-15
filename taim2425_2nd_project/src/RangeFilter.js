import React from 'react';

const RangeFilter = ({ onRangeFilterChange }) => {
    const changeValue = (e) => {
        const rangeValue = document.getElementById("rangeValue");
        rangeValue.innerHTML = "Number of elements: " + e.target.value;
        onRangeFilterChange(e.target.value);
    };
    return (
        <div>
            <p id="rangeValue">Number of elements: 10</p>
            <input type="range" id="rangeInput" name="rangeInput" min="0" max="20" step="1" defaultValue="10" onChange={changeValue}/>
        </div>
    );
};

export default RangeFilter;