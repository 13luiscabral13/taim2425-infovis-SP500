import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJSON } from 'react-leaflet';
import React, { useEffect, useRef, useState } from 'react';
import geojsonData from './gz_2010_us_040_00_20m.json';
import { ownershipByState } from './data_grabbers';
import { getCurrentLanguage } from './NavBar';

var geojson;


const ChoroplethMapComp = ({ geojsonData }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      dragging: true,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false,
      touchZoom: false
    }).setView([37.8, -96], 4); // Centered on the USA

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const getColor = (d) => {
      return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
          d > 200 ? '#E31A1C' :
            d > 100 ? '#FC4E2A' :
              d > 50 ? '#FD8D3C' :
                d > 20 ? '#FEB24C' :
                  d > 10 ? '#FED976' :
                    '#FFEDA0';
    };

    const style = (feature) => {
      return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    };


    L.geoJson(geojsonData, { style }).addTo(map);

    var info = L.control();

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
      const languageSelect = getCurrentLanguage()
      
      const updateContainer = () => {
          if (languageSelect.value === 'en') {
            this._div.innerHTML = props ? ('<h4>' + props.LSAD + '</h4>') : '<h4> Hover over a state </h4>';
          } else if (languageSelect.value === 'pt') {
            this._div.innerHTML = props ? ('<h4>' + props.LSAD + '</h4>') : '<h4> Passe o rato sobre um estado </h4>';
          }
      };

      languageSelect.addEventListener('change', () => {
        updateContainer();
      });

      updateContainer();
    };

    info.addTo(map);
    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });

      layer.bringToFront();
      info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      const infoBox = document.getElementsByClassName('info-box')[0];
      infoBox.remove();
      info.update();
    }

    function changeColor(e) {
      e.target.setStyle({
        fillColor: '#FF0000', // Change color to red or any color of your choice
        weight: 5,
        fillOpacity: 0.2
      });
    }

    function addInfoBox(e) {
      const infoContainer = document.getElementById('informationBox');
      const { NAME, LSAD, CENSUSAREA } = e.target.feature.properties;
      const infoBox = document.createElement('div');
      infoBox.className = 'info-box';

      ownershipByState(e.target.feature.properties.LSAD, 10)
        .then(total_shares_value => {
          if (getCurrentLanguage().value==="en") {
            if (total_shares_value.holders) {
              infoBox.innerHTML = `
          <p><strong>State Name:</strong> ${NAME}</p>
          <p><strong>State Symbol:</strong> ${LSAD}</p>
          <p><strong>State Area:</strong> ${CENSUSAREA}</p>
          <p><strong>Total Shares Value:</strong> ${total_shares_value.shares_value}</p>
          <p><strong>Top Holder:</strong> ${total_shares_value.holders[0].shareholder}</p>
        `;
            }
            else {
              infoBox.innerHTML = `
          <p><strong>State Name:</strong> ${NAME}</p>
          <p><strong>State Symbol:</strong> ${LSAD}</p>
          <p><strong>State Area:</strong> ${CENSUSAREA}</p>
          <p><strong>Total Shares Value:</strong> No Financial Data Available</p>
          <p><strong>Top Holder:</strong> No Financial Data Available</p> `;
            }
          }
          else if (getCurrentLanguage().value==="pt") {
            if (total_shares_value.holders) {
              infoBox.innerHTML = `
          <p><strong>Nome do Estado:</strong> ${NAME}</p>
          <p><strong>Símbolo do Estado:</strong> ${LSAD}</p>
          <p><strong>Área do Estado:</strong> ${CENSUSAREA}</p>
          <p><strong>Valor Total das Ações:</strong> ${total_shares_value.shares_value}</p>
          <p><strong>Maior Acionista:</strong> ${total_shares_value.holders[0].shareholder}</p>
        `;
            }
            else {
              infoBox.innerHTML = `
          <p><strong>Nome do Estado:</strong> ${NAME}</p>
          <p><strong>Símbolo do Estado:</strong> ${LSAD}</p>
          <p><strong>Área do Estado:</strong> ${CENSUSAREA}</p>
          <p><strong>Valor Total das Ações:</strong> Sem informação disponível</p>
          <p><strong>Maior Acionista:</strong> Sem informação disponível</p> `;
            }
          }
          })

      infoContainer.style.display = "flex";
      infoContainer.style.justifyContent = "space-between";
      infoBox.style.border = "1px solid";
      infoBox.style.borderRadius = "10px";
      infoBox.style.padding = "10px";
      infoBox.style.width = "300px";
      infoBox.style.height = "auto"
      infoBox.style.borderColor = "#0096C7";
      infoBox.style.backgroundColor = "rgba(0, 150, 199, 0.2)";
      infoBox.style.opacity = "1.0";

      infoContainer.appendChild(infoBox);
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: (e) => {
          highlightFeature(e)
          changeColor(e)
          addInfoBox(e)
        },
        mouseout: resetHighlight,
      });
    }

    geojson = L.geoJson(geojsonData, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, [geojsonData]);

  return <div ref={mapRef} style={{ height: '650px', width: '80%' }} />;
};



const ChoroplethMap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(geojsonData);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <div style={{ display: 'flex' }}><ChoroplethMapComp geojsonData={data} />
    <div id="informationBox"></div>
  </div>
};

export default ChoroplethMap;