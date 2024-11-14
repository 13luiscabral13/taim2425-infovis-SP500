import React, { useEffect, useState } from 'react';
import { AgCharts } from 'ag-charts-enterprise';
import { perShareholderPerCompany, ownershipByState, perShareholderPerSector, ownershipBySector, ownershipInGeneral, perShareholderPerSectorPerCompany } from './data_grabbers';
import './Chart.css';

const Chart = ({ filter, subFilter, searchTriggered, range }) => {
    const [chartData, setChartData] = useState([]);
    const [chartKey, setChartKey] = useState({});
    const [chartName, setChartName] = useState({});
    const [chartTooltipContent, setChartTooltipContent] = useState({});
    const [reloadTrigger, setReloadTrigger] = useState(0); // State to trigger reloading
    const [goBackButton, setGoBackButton] = useState(false);


    async function getSearchFunction(filter, subFilter, range) {
        if (filter == "shareholder") {
            return await getShareholderInfo(subFilter, range)
        } else if (filter == "ownership") {
            return await getOwnershipInfo(subFilter, range)
        }
    }

    async function getShareholderInfo(subFilter, range) {
        let shareholderName = subFilter.identifier;
        let typeOfSearch = subFilter.subCategory;
        if (typeOfSearch == "sector" && !subFilter.additional) {
            setChartKey("sector");
            setChartName(shareholderName + " Investments by Sector");
            setChartTooltipContent("sectorInfo");
            return await perShareholderPerSector(shareholderName, range);
        } else if (typeOfSearch == "company") {
            setChartKey("symbol");
            setChartName(shareholderName + " Investments by Company");
            setChartTooltipContent("companyInfo");
            return await perShareholderPerCompany(shareholderName, range);
        }
        else {
            setChartKey("symbol");
            setChartName(shareholderName + " Investments by Company in " + subFilter.additional);
            setChartTooltipContent("companyInfo");
            return await perShareholderPerSectorPerCompany(shareholderName, subFilter.additional, range);
        }
    }

    async function getOwnershipInfo(typeOfSearch, range) {
        if (typeOfSearch.subCategory == "state") {
            let actualState = typeOfSearch.identifier.split(": ")[1];
            let abbreviation = typeOfSearch.identifier.split(": ")[0];
            setChartKey("shareholder");
            setChartName("Ownership Distribution in " + actualState);
            let stateData = await ownershipByState(abbreviation, range);
            return stateData.holders;
        } else if (typeOfSearch.subCategory == "sector") {
            setChartKey("shareholder");
            setChartName("Ownership Distribution in " + typeOfSearch.identifier);
            return await ownershipBySector(typeOfSearch.identifier, range);
        }
        else {
            setChartKey("shareholder");
            setChartName("Ownership Distribution Across SP500");
            return await ownershipInGeneral(range);
        }

    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await getSearchFunction(filter, subFilter, range);
            setChartData(data);
            if (subFilter) {
             subFilter.additional = null;
            }
        };
        fetchData(); // Call the async function to fetch data
    }, [searchTriggered, reloadTrigger]);

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
                            renderer: function ({ datum }) {
                                return {
                                    title: datum[chartKey],
                                    content: chartTooltipContent === "companyInfo" ? `<b>${datum.value}M<br> ${datum.fullName}</b><br>${datum.city}, ${datum.state}<br><a href="${datum.website}" target="_blank">"${datum.website}"</a>` : `<b>Investment: $${datum.value}M</b>`,
                                };
                            },
                            interaction: {
                                enabled: true,
                            },
                        },
                        listeners: {
                            nodeClick: (event: any) => {
                                if (filter == "shareholder" && subFilter.subCategory == "sector") {
                                    console.log("Filter:", filter, "Subfilter:", subFilter, "Datum:", event.datum);
                                    subFilter.additional = event.datum[chartKey];
                                    setReloadTrigger(prev => prev + 1); // Update state to trigger reload
                                    // Reload the Chart component with the new filter and sub-filter
                                    setGoBackButton(true);
                                }
                            },
                        },
                    }
                ],
                axes: [
                    { type: 'angle-category', groupPaddingInner: 0.5, paddingInner: 0.5, },
                    { type: 'radius-number', innerRadiusRatio: 0.4, label: {enabled: false} },
                ],

            };

            AgCharts.create(options); // Create chart only after data is set
            if (document.getElementById("myChart").childElementCount > 1) {
                document.getElementById("myChart").removeChild(document.getElementById("myChart").firstChild);
            }
        }
    }, [chartData]); // Run this effect only when chartData changes

    function goBack(filter, subFilter) {
        setGoBackButton(false);
        subFilter.additional = null;
        getSearchFunction(filter, subFilter);
        setReloadTrigger(prev => prev + 1); // Update state to trigger reload
    }

    // Ensure #myChart only has one child element

    return <div id="chart-container">
        {goBackButton && <button id="go-back-button" onClick={() => goBack(filter, subFilter)}>Back to Sector</button>}
        <div id="myChart" style={{ width: '100%', height: '650px' }} /></div>;
};

export default Chart;
