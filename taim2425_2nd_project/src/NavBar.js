import React, { useRef, useEffect, useState } from 'react';
import './NavBar.css';

function NavBar({ setCurrentPage }) { 

    // Update labels dynamically based on the selected language
    const labels = {
        en: {
            wealth: "Where's the Wealth?",
            map: 'MapView',
            chart: 'ChartView'
        },
        pt: {
            wealth: 'Onde Está a Riqueza?',
            map: 'Visualização de Mapa',
            chart: 'Visualização de Gráficos'
        },
    };

    const languageSelect = getCurrentLanguage() || { value: "en" };
    const [language, setLanguage] = useState(languageSelect.value); // Default language   
    const navbarContent = (
        <nav className="navbar">
            <div className="navbar-logo">
                <a href="/">{labels[language].wealth}</a>
            </div>
            <ul className="navbar-links">
                <select className="language-select">
                    <option value="en">en</option>
                    <option value="pt">pt</option>
                </select>
                <button onClick={() => setCurrentPage('MapView')}>{labels[language].map}</button>
                <button onClick={() => setCurrentPage('ChartView')}>{labels[language].chart}</button>
            </ul>
        </nav>
    );
  
    useEffect(() => {
      const languageSelect = getCurrentLanguage(); // Get the language select element
  
      const handleLanguageChange = () => {
          setLanguage(languageSelect.value); // Update language state when the selection changes
      };
  
      languageSelect.addEventListener('change', () => {
          handleLanguageChange()
      });
  
      return () => {
          languageSelect.removeEventListener('change', handleLanguageChange); // Cleanup
      };
  }, []);

    return navbarContent;
};

export function getCurrentLanguage() {
    const language = document.getElementsByClassName("language-select")
    return language[0]
}

export default NavBar;

