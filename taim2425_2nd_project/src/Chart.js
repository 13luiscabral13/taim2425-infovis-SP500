import React, { useEffect, useState } from 'react';
import { AgCharts } from 'ag-charts-enterprise';
import { perShareholderPerCompany, ownershipByState, perShareholderPerSector, ownershipBySector, ownershipInGeneral } from './data_grabbers';
import './Chart.css';

const Chart = ({filter, subFilter, searchTriggered}) => {
    console.log("The Searchtrigger attribute is: ", searchTriggered);
    const [chartData, setChartData] = useState([]);
    const [chartKey, setChartKey] = useState({});
    const [chartName, setChartName] = useState({});
    const [chartTooltipContent, setChartTooltipContent] = useState({});

    async function getSearchFunction(filter, subFilter) {
        if (filter == "shareholder") {
            return await getShareholderInfo(subFilter)
        } else if (filter == "ownership") {
            return await getOwnershipInfo(subFilter)
        }
    }

    async function getShareholderInfo(subFilter) {
        let shareholderName = subFilter.identifier;
        let typeOfSearch = subFilter.subCategory;
        if (typeOfSearch == "sector") {
            setChartKey("sector");
            setChartName(shareholderName + " Investments by Sector");
            setChartTooltipContent("sectorInfo");
            return await perShareholderPerSector(shareholderName, 8);
        } else if (typeOfSearch == "company") {
            setChartKey("symbol");
            setChartName(shareholderName + " Investments by Company");
            setChartTooltipContent("companyInfo");
            return await perShareholderPerCompany(shareholderName, 8);
        }
    }

    async function getOwnershipInfo(typeOfSearch) {
        console.log("Type of search: ", typeOfSearch);
        if (typeOfSearch.subCategory == "state") {
            setChartKey("shareholder");
            setChartName("Ownership Distribution in " + typeOfSearch.identifier);
            return await ownershipByState(typeOfSearch.identifier, 8);
        } else if (typeOfSearch.subCategory == "sector") {
            setChartKey("shareholder");
            setChartName("Ownership Distribution in " + typeOfSearch.identifier);
            return await ownershipBySector(typeOfSearch.identifier, 8);
        }
        else {
            return await ownershipInGeneral(8);
        }

    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await getSearchFunction(filter, subFilter);
            console.log("Data fetched:", data);
            setChartData(data);
        };
        fetchData(); // Call the async function to fetch data
    }, [searchTriggered]);

    useEffect(() => {
        if (chartData) {
            console.log('Chart data has been updated:', chartData);
            const options = {
                container: document.getElementById("myChart"),
                data: chartData,
                title: {
                    text: chartName,
                },
                subtitle: {
                    text: "Millions USD",
                },
                series: [
                    {
                        type: "radial-column",
                        angleKey: chartKey,
                        radiusKey: "value",
                        // Place information about the company in the tooltip
                        tooltip: {
                            renderer: function ({ datum}) {
                                return {
                                    title: datum[chartKey],                            
                                    content: chartTooltipContent === "companyInfo" ? `<b>${datum.value}M<br> ${datum.fullName}</b><br>${datum.city}, ${datum.state}<br><a href="${datum.website}" target="_blank">"${datum.website}"</a>` : `<b>Investment: $${datum.value}M</b>`,                                   
                                };
                            },
                            interaction: {
                                enabled: true,
                            },
                        },      
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

    return <div id="chart-container"><div id="myChart" style={{ width: '100%', height: '650px' }} /></div>;
};

export default Chart;
