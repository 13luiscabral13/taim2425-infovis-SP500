import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJSON } from 'react-leaflet';
import React, { useEffect, useRef, useState } from 'react';
import geojsonData from './gz_2010_us_040_00_20m.json';


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
      this._div.innerHTML = props ? ('<h4>' + props.NAME + '</h4>') : '<h4> Hover over a state </h4>';
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
      info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }
    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
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

  return <div ref={mapRef} style={{ height: '400px', width: '80%' }} />;
};



const ChoroplethMap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(geojsonData);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <ChoroplethMapComp geojsonData={data} />
};

export default ChoroplethMap;