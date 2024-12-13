import React, { useEffect, useState } from 'react';
import { AgCharts } from 'ag-charts-enterprise';
import { perShareholderPerCompany, ownershipByState, perShareholderPerSector, ownershipBySector, ownershipInGeneral, perShareholderPerSectorPerCompany, specificShareholderOwnershipPerSector, specificShareholderOwnershipPerState, specificShareholderOwnershipInGeneral } from './data_grabbers';
import './Chart.css';
import { getCurrentLanguage } from './NavBar';

const Chart = ({ filter, subFilter, searchTriggered, range, language }) => {
    const [chartData, setChartData] = useState([]);
    const [chartKey, setChartKey] = useState({});
    const [chartName, setChartName] = useState({});
    const [chartTooltipContent, setChartTooltipContent] = useState({});
    const [reloadTrigger, setReloadTrigger] = useState(0); // State to trigger reloading
    const [goBackButton, setGoBackButton] = useState(false);
    const [chartSubtitle, setChartSubtitle] = useState("");
    console.log("language: " + language)

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

    // Update labels dynamically based on the selected language
    const labels = {
        en: {
            back: 'Back to Sector',
        },
        pt: {
            back: 'Voltar ao Setor',
        },
    };

    async function getSpecificInfo(subFilter, range) {
        if (subFilter.subCategory == "state") {
            let actualState = subFilter.specificity;
            let abbreviation = subFilter.specificity;
            if (subFilter.specificity.includes(":")) {
                actualState = subFilter.specificity.split(": ")[1];
                abbreviation = subFilter.specificity.split(": ")[0];
            }
            console.log(abbreviation)
            let data = await specificShareholderOwnershipPerState(subFilter.searchQuery || subFilter.shareholder, abbreviation, range);   
            if (data && data[0]) {
                console.log("Data:", data);
                data[0].outlier = true;
                let chartArray = [...data[1], data[0]];
                let rank = data[2] + 1;
                if (rank == 1) {
                    rank = "";
                }
                else{
                    if (language==='en'){
                        if (rank == 2) {
                            rank = "2nd ";
                        } else if (rank == 3) {
                            rank = "3rd ";
                        } else {
                            rank = rank + "th ";
                        }
                    }
                    else if(language==='pt'){
                        rank = rank + "º "
                    }
                }
                if(language==='en') {
                    setChartKey("shareholder");
                    setChartName((subFilter.searchQuery || subFilter.shareholder) + " Investments in " + actualState + " Compared to the Top " + range + " Holders");
                    setChartSubtitle((subFilter.searchQuery || subFilter.shareholder) + " is the " + rank + "largest holder in " + actualState);
                    setChartTooltipContent("stateInfo");
                }
                else if(language==='pt') {
                    console.log("get specific info 1")
                    setChartKey("shareholder");
                    if(range==1)
                        setChartName(" Investimentos do(a) " + (subFilter.searchQuery || subFilter.shareholder) + " em " + actualState + " Comparados com os do Maior Acionista");
                    else
                        setChartName(" Investimentos do(a) " + (subFilter.searchQuery || subFilter.shareholder) + " em " + actualState + " Comparados com os dos " + range + " Maiores Acionistas");
                    setChartSubtitle((subFilter.searchQuery || subFilter.shareholder) + " é o " + rank + "maior acionista em " + actualState);
                    setChartTooltipContent("stateInfo");
                }
                return chartArray;
            }
        }
        else if (subFilter.subCategory == "sector") {
            let data = await specificShareholderOwnershipPerSector(subFilter.searchQuery || subFilter.shareholder, subFilter.specificity, range);
            if (data) {
                console.log("Data:", data);
                data[0].outlier = true;
                let chartArray = [...data[1], data[0]];
                let rank = data[2] + 1;
                if (rank == 1) {
                    rank = "";
                }
                else{
                    if (language==='en'){
                        if (rank == 2) {
                            rank = "2nd ";
                        } else if (rank == 3) {
                            rank = "3rd ";
                        } else {
                            rank = rank + "th ";
                        }
                    }
                    else if(language==='pt'){
                        rank = rank + "º "
                    }
                }
                if(language==='en'){
                    setChartKey("shareholder");
                    setChartName((subFilter.searchQuery || subFilter.shareholder) + " Investments in " + subFilter.specificity + " Compared to the Top " + range + " Holders");
                    setChartSubtitle((subFilter.searchQuery || subFilter.shareholder) + " is the " + rank + "largest holder in the " + subFilter.specificity + " sector");
                    setChartTooltipContent("sectorInfo");
                }
                else if(language==='pt'){
                    console.log("get specific info 2")
                    setChartKey("shareholder");
                    if(range==1)
                        setChartName("Investimentos do(a) " + (subFilter.searchQuery || subFilter.shareholder) + " em " + subFilter.specificity + " Comparados com os do Maior Acionista");
                    else
                    setChartName("Investimentos do(a) " + (subFilter.searchQuery || subFilter.shareholder) + " em " + subFilter.specificity + " Comparados com os dos " + range + " Maiores Acionistas");
                    setChartSubtitle((subFilter.searchQuery || subFilter.shareholder) + " é o " + rank + "maior acionista no setor de " + subFilter.specificity);
                    setChartTooltipContent("sectorInfo");
                }
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
                }
                else{
                    if (language==='en'){
                        if (rank == 2) {
                            rank = "2nd ";
                        } else if (rank == 3) {
                            rank = "3rd ";
                        } else {
                            rank = rank + "th ";
                        }
                    }
                    else if(language==='pt'){
                        rank = rank + "º "
                    }
                }
                if(language==='en'){
                    setChartKey("shareholder");
                    setChartName(subFilter.shareholder + " Investments in the SP500 Compared to the Top " + range + " Holders");
                    setChartSubtitle(subFilter.shareholder + " is the " + rank + "largest holder in the SP500");
                    setChartTooltipContent("generalInfo");
                }
                else if(language==='pt'){
                    console.log("get specific info 3")
                    setChartKey("shareholder");
                    if(range==1)
                        setChartName("Investimentos do(a)" + subFilter.shareholder + " no SP500 Comparados com os do Maior Acionista");
                    else
                        setChartName("Investimentos do(a) " + (subFilter.searchQuery || subFilter.shareholder) + " no SP500 Comparados com os dos " + range + " Maiores Acionistas");
                    setChartSubtitle(subFilter.shareholder + " é o " + rank + "maior acionista no SP500");
                    setChartTooltipContent("generalInfo");
                }
                return chartArray;
            }
        }
    }

    async function getShareholderInfo(subFilter, range) {
        let shareholderName = subFilter.identifier;
        let typeOfSearch = subFilter.subCategory;
        if (typeOfSearch == "sector" && !subFilter.additional) {
            if(language==='en'){
                setChartKey("sector");
                setChartName(shareholderName + " Investments by Sector");
                setChartTooltipContent("sectorInfo");
                if(range==1)
                    setChartSubtitle("The Sector " + shareholderName + " Invests the Most");
                else
                    setChartSubtitle("The " + range + " Sectors " + shareholderName + " Invests the Most");
            }
            else if(language==='pt'){
                console.log("get shareholder info 1")
                setChartKey("sector");
                setChartName("Investimentos do(a) " + shareholderName + " por Setor");
                setChartTooltipContent("sectorInfo");
                if(range==1)
                    setChartSubtitle("O Setor em que o(a) " + shareholderName + " Investe Mais");
                else
                    setChartSubtitle("Os " + range + " Setores em que o(a) " + shareholderName + " Investe Mais");
            }
            return await perShareholderPerSector(shareholderName, range);
        } else if (typeOfSearch == "company") {
            if(language==='en'){
                setChartKey("symbol");
                setChartName(shareholderName + " Investments by Company");
                setChartTooltipContent("companyInfo");
                if(range==1)
                    setChartSubtitle("The Company " + shareholderName + " Invests the Most");
                else
                    setChartSubtitle("The " + range + " Companies " + shareholderName + " Invests the Most");
            }
            else if(language==='pt'){
                console.log("get shareholder info 2")
                setChartKey("symbol");
                setChartName("Investimentos do(a) " + shareholderName + " por Empresa");
                setChartTooltipContent("companyInfo");
                if(range==1)
                    setChartSubtitle("A Empresa em que o(a) " + shareholderName + " Investe Mais");
                else
                    setChartSubtitle("As " + range + " Empresas em que o(a) " + shareholderName + " Investe Mais");
            }
            return await perShareholderPerCompany(shareholderName, range);
        }
        else {
            if(language==='en'){
                setChartKey("symbol");
                setChartName(shareholderName + " Investments by Company in " + subFilter.additional);
                setChartTooltipContent("companyInfo");
                if(range==1)
                    setChartSubtitle("The Company " + shareholderName + " Invests the Most in the " + subFilter.additional + " sector");
                else
                    setChartSubtitle("The " + range + " Companies " + shareholderName + " Invests the Most in the " + subFilter.additional + " sector");
            }
            else if(language==='pt'){
                console.log("get shareholder info 3")
                setChartKey("symbol");
                setChartName("Investimentos do(a) " + shareholderName + " por Empresa no setor " + subFilter.additional);
                setChartTooltipContent("companyInfo");
                if(range==1)
                    setChartSubtitle("A Empresa em que o(a) " + shareholderName + " Investe Mais no setor " + subFilter.additional);
                else
                    setChartSubtitle("As " + range + " Empresas em que o(a) " + shareholderName + " Investe Mais no setor " + subFilter.additional);
            }
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
            if(language==='en'){
                setChartKey("shareholder");
                setChartName("Ownership Distribution in " + actualState);
                setChartSubtitle("The Top " + range + " Holders in " + actualState);
                setChartTooltipContent("stateInfo");
            }
            else if(language==='pt'){
                console.log("get ownership info 1")
                setChartKey("shareholder");
                setChartName("Distribuição de Propriedade em " + actualState);
                if(range==1)
                    setChartSubtitle("O Maior Acionista em " + actualState);
                else
                    setChartSubtitle("Os " + range + " Maiores Acionistas em " + actualState);
                setChartTooltipContent("stateInfo");
            }
            let stateData = await ownershipByState(abbreviation, range);
            return stateData.holders;
        } else if (typeOfSearch.subCategory == "sector") {
            if(language==='en'){
                setChartKey("shareholder");
                setChartName("Ownership Distribution in " + typeOfSearch.identifier);
                setChartSubtitle("The Top " + range + " Holders in the " + typeOfSearch.identifier + " sector");
                setChartTooltipContent("sectorInfo");
            }
            else if(language==='pt'){
                console.log("get ownership info 2")
                setChartKey("shareholder");
                setChartName("Distribuição de Propriedade em " + typeOfSearch.identifier);
                if(range==1)
                    setChartSubtitle("O Maior Acionista no setor " + typeOfSearch.identifier);
                else
                    setChartSubtitle("Os " + range + " Maiores Acionistas no setor " + typeOfSearch.identifier);
                setChartTooltipContent("sectorInfo");
            }
            return await ownershipBySector(typeOfSearch.identifier, range);
        }
        else {
            if(language==='en'){
                setChartKey("shareholder");
                setChartName("Ownership Distribution Across SP500");
                setChartSubtitle("The Top " + range + " Holders in the SP500");
                setChartTooltipContent("generalInfo");
            }
            else if(language==='pt'){
                console.log("RANGE: " + range)
                setChartKey("shareholder");
                setChartName("Distribuição de Propriedade no SP500");
                if(range==1){
                    setChartSubtitle("O Maior Acionista no SP500");}
                else{
                    setChartSubtitle("Os " + range + " Maiores Acionistas no SP500");}
                setChartTooltipContent("generalInfo");
            }
            return await ownershipInGeneral(range);
        }

    }

    function manipulateValues(value){
        let stringNumber = value.toString()
        let reversedNumberString = stringNumber.split('').reverse().join('');
        let reversedNumberStringSeparated = '';

        for (let i = 0; i < reversedNumberString.length; i++) {
            reversedNumberStringSeparated += reversedNumberString[i];
            if (i % 3 === 2 && i < reversedNumberString.length - 1) {
                reversedNumberStringSeparated += ',';
            }
        }
        
        return reversedNumberStringSeparated.split('').reverse().join('');
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
    }, [language, searchTriggered, reloadTrigger]);

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
                                const value = manipulateValues(datum.value)
                                console.log(typeof value)
                                return {
                                    title: datum[chartKey],                                    
                                    content: chartTooltipContent === "companyInfo" ? `<b>${datum.value}<br> ${datum.fullName}</b><br>${datum.city}, ${datum.state}<br><a href="${datum.website}" target="_blank">"${datum.website}"</a>` : `<b>Investment: $${datum.value}</b>`,
                                };
                            },
                            interaction: {
                                enabled: true,
                            },
                        },
                        listeners: {
                            nodeClick: (event: any) => {
                                if (filter == "shareholder" && subFilter.subCategory == "sector") {
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
        {goBackButton && <button id="go-back-button" onClick={() => goBack(filter, subFilter)}>{labels[language].back}</button>}
        <div id="myChart" style={{ width: '100%', height: '650px' }} /></div>;
};

export default Chart;
