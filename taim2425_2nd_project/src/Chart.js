import React, { useEffect, useState } from 'react';
import { AgCharts } from 'ag-charts-enterprise';
import { perShareholderPerCompany, ownershipByState} from './data_grabbers';
import './Chart.css';

const Chart = () => {
    const [chartData, setChartData] = useState([]);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await perShareholderPerCompany("Brown Advisory  Inc.", 8);
            setChartData(data);
        };

        fetchData(); // Call the async function to fetch data
    }, []); // Empty dependency array to ensure it only runs once on mount

    useEffect(() => {
        if (chartData.length > 0) {
            const options = {
                container: document.getElementById("myChart"),
                data: chartData,
                title: {
                    text: "Revenue by Product Category",
                },
                subtitle: {
                    text: "Millions USD",
                },
                series: [
                    {
                        type: "radial-column",
                        angleKey: "symbol", 
                        radiusKey: "value", 
                    }
                ],
                axes: [
                    { type: 'angle-category', groupPaddingInner: 0.5, paddingInner: 0.5 },
                    { type: 'radius-number', innerRadiusRatio: 0.4 },
                ],
            };

            AgCharts.create(options); // Create chart only after data is set
            if (document.getElementById("myChart").childElementCount > 1) {
                document.getElementById("myChart").removeChild(document.getElementById("myChart").firstChild);
            }
        }
    }, [chartData]); // Run this effect only when chartData changes
    
    // Ensure #myChart only has one child element
    
    return <div id="chart-container"><div id="myChart" style={{ width: '100%', height: '750px' }}/></div>;
};

export default Chart;
