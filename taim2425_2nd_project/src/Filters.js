import React, { useState } from 'react';
import './Filters.css';

const Filters = ({ onFilterChange }) => {
    const [category, setCategory] = useState('');

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        onFilterChange({ category: e.target.value });
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
                Shareholder Search
            </label>
            <label>
                <input
                    type="radio"
                    value="ownership"
                    checked={category === 'ownership'}
                    onChange={handleCategoryChange}
                />
                Ownership Concentration
            </label>
        </div>
    );
};

export default Filters;
