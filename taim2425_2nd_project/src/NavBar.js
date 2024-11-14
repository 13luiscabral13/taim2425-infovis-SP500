import React from 'react';
import './NavBar.css';

function NavBar({ setCurrentPage }) {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">Where's The Wealth?</a>
            </div>
            <ul className="navbar-links">
                <button onClick={() => setCurrentPage('MapView')}>MapView</button>
                <button onClick={() => setCurrentPage('ChartView')}>ChartView</button>
            </ul>
        </nav>
    );
};

export default NavBar;

