import React from 'react';

const RangeFilter = ({ onRangeFilterChange }) => {
    const changeValue = (e) => {
        const rangeValue = document.getElementById("rangeValue");
        rangeValue.innerHTML = "Number of elements: " + e.target.value;
        onRangeFilterChange(e.target.value);
    };
    return (
        <div>
            <p id="rangeValue">Number of elements: 5</p>
            <input type="range" id="rangeInput" name="rangeInput" min="0" max="10" step="1" defaultValue="5" onChange={changeValue}/>
        </div>
    );
};

export default RangeFilter;