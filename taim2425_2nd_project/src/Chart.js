import React, { useEffect, useState } from 'react';
import { AgCharts } from 'ag-charts-enterprise';
import { perShareholderPerCompany, ownershipByState, perShareholderPerSector, ownershipBySector, ownershipInGeneral, perShareholderPerSectorPerCompany, specificShareholderOwnershipPerSector, specificShareholderOwnershipPerState, specificShareholderOwnershipInGeneral } from './data_grabbers';
import './Chart.css';

const Chart = ({ filter, subFilter, searchTriggered, range }) => {
    const [chartData, setChartData] = useState([]);
    const [chartKey, setChartKey] = useState({});
    const [chartName, setChartName] = useState({});
    const [chartTooltipContent, setChartTooltipContent] = useState({});
    const [reloadTrigger, setReloadTrigger] = useState(0); // State to trigger reloading
    const [goBackButton, setGoBackButton] = useState(false);
    const [chartSubtitle, setChartSubtitle] = useState("");

    async function getSearchFunction(filter, subFilter, range) {
        if (filter == "shareholder") {
            return await getShareholderInfo(subFilter, range)
        } else if (filter == "ownership") {
            return await getOwnershipInfo(subFilter, range)
        }
        else {
            return await getSpecificInfo(subFilter, range)
        }
    }

    async function getSpecificInfo(subFilter, range) {
        if (subFilter.subCategory == "state") {
            let actualState = subFilter.specificity;
            let abbreviation = subFilter.specificity;
            if (subFilter.specificity.includes(":")) {
                actualState = subFilter.specificity.split(": ")[1];
                abbreviation = subFilter.specificity.split(": ")[0];
            }
            let data = await specificShareholderOwnershipPerState(subFilter.searchQuery, abbreviation, range);   
            if (data && data[0]) {
                console.log("Data:", data);
                data[0].outlier = true;
                let chartArray = [...data[1], data[0]];
                let rank = data[2] + 1;
                if (rank == 1) {
                    rank = "";
                } else if (rank == 2) {
                    rank = "2nd ";
                } else if (rank == 3) {
                    rank = "3rd ";
                } else {
                    rank = rank + "th ";
                }
                setChartKey("shareholder");
                setChartName(subFilter.searchQuery + " Investments in " + actualState + " Compared to the Top " + range + " Holders");
                setChartSubtitle(subFilter.searchQuery + " is the " + rank + "largest holder in " + actualState);
                setChartTooltipContent("stateInfo");
                return chartArray;
            }
        }
        else if (subFilter.subCategory == "sector") {
            let data = await specificShareholderOwnershipPerSector(subFilter.searchQuery, subFilter.specificity, range);
            if (data) {
                console.log("Data:", data);
                data[0].outlier = true;
                let chartArray = [...data[1], data[0]];
                let rank = data[2] + 1;
                if (rank == 1) {
                    rank = "";
                } else if (rank == 2) {
                    rank = "2nd ";
                } else if (rank == 3) {
                    rank = "3rd ";
                } else {
                    rank = rank + "th ";
                }
                setChartKey("shareholder");
                setChartName(subFilter.searchQuery + " Investments in " + subFilter.specificity + " Compared to the Top " + range + " Holders");
                setChartSubtitle(subFilter.searchQuery + " is the " + rank + "largest holder in the " + subFilter.specificity + " sector");
                setChartTooltipContent("sectorInfo");
                return chartArray;
            }
        }
        else {
            console.log("Claling general function with:", subFilter.shareholder, range);
            let data = await specificShareholderOwnershipInGeneral(subFilter.shareholder, range);
            if (data) {
                console.log("Data:", data);
                data[0].outlier = true;
                let chartArray = [...data[1], data[0]];
                let rank = data[2] + 1;
                if (rank == 1) {
                    rank = "";
                } else if (rank == 2) {
                    rank = "2nd ";
                } else if (rank == 3) {
                    rank = "3rd ";
                } else {
                    rank = rank + "th ";
                }
                setChartKey("shareholder");
                setChartName(subFilter.shareholder + " Investments in the SP500 Compared to the Top " + range + " Holders");
                setChartSubtitle(subFilter.shareholder + " is the " + rank + "largest holder in the SP500");
                setChartTooltipContent("generalInfo");
                return chartArray;
            }
        }
    }

    async function getShareholderInfo(subFilter, range) {
        let shareholderName = subFilter.identifier;
        let typeOfSearch = subFilter.subCategory;
        if (typeOfSearch == "sector" && !subFilter.additional) {
            setChartKey("sector");
            setChartName(shareholderName + " Investments by Sector");
            setChartTooltipContent("sectorInfo");
            setChartSubtitle("The " + range + " Sectors " + shareholderName + " Invests the Most");
            return await perShareholderPerSector(shareholderName, range);
        } else if (typeOfSearch == "company") {
            setChartKey("symbol");
            setChartName(shareholderName + " Investments by Company");
            setChartTooltipContent("companyInfo");
            setChartSubtitle("The " + range + " Companies " + shareholderName + " Invests the Most");
            return await perShareholderPerCompany(shareholderName, range);
        }
        else {
            setChartKey("symbol");
            setChartName(shareholderName + " Investments by Company in " + subFilter.additional);
            setChartTooltipContent("companyInfo");
            setChartSubtitle("The " + range + " Companies " + shareholderName + " Invests the Most in the " + subFilter.additional + " sector");
            return await perShareholderPerSectorPerCompany(shareholderName, subFilter.additional, range);
        }
    }

    async function getOwnershipInfo(typeOfSearch, range) {
        if (typeOfSearch.subCategory == "state") {
            let actualState = typeOfSearch.identifier;
            let abbreviation = typeOfSearch.identifier;
            if (typeOfSearch.identifier.includes(":")) {
                actualState = typeOfSearch.identifier.split(": ")[1];
                abbreviation = typeOfSearch.identifier.split(": ")[0];
            }
            setChartKey("shareholder");
            setChartName("Ownership Distribution in " + actualState);
            setChartSubtitle("The Top " + range + " Holders in " + actualState);
            setChartTooltipContent("stateInfo");
            let stateData = await ownershipByState(abbreviation, range);
            return stateData.holders;
        } else if (typeOfSearch.subCategory == "sector") {
            setChartKey("shareholder");
            setChartName("Ownership Distribution in " + typeOfSearch.identifier);
            setChartSubtitle("The Top " + range + " Holders in the " + typeOfSearch.identifier + " sector");
            setChartTooltipContent("sectorInfo");
            return await ownershipBySector(typeOfSearch.identifier, range);
        }
        else {
            setChartKey("shareholder");
            setChartName("Ownership Distribution Across SP500");
            setChartSubtitle("The Top " + range + " Holders in the SP500");
            setChartTooltipContent("generalInfo");
            return await ownershipInGeneral(range);
        }

    }

    useEffect(() => {
        const fetchData = async () => {
            const data = await getSearchFunction(filter, subFilter, range);
            console.log("The data being set is:", data);
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
                    text: chartSubtitle,
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
                    { type: 'radius-number', innerRadiusRatio: 0.4, label: { enabled: false } },
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
