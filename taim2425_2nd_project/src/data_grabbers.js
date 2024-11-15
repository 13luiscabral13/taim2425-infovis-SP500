/*
export function getLogo(company) {
    const db = new sqlite3.Database('sp500.db');
    
    return new Promise((resolve, reject) => {
        db.get('SELECT hotlink FROM company WHERE name = ?', [company], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                const hotlink = row.hotlink;
                resolve(`<img src="https://img.logo.dev/${hotlink}?token=pk_MlGd8p4FQpWW8IXQCtEv6g"/>`);
            } else {
                reject('Company not found');
            }
        });
    });
}
*/


export async function perShareholderPerCompany(shareholder, topX) {
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/shareholder_per_company.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Extract investments and sort by investment value
        if (!data[shareholder]) {
            throw new Error('Shareholder not found in data');
        }

        console.log("Shareholder main data: ", data[shareholder]);
        const investments = data[shareholder]
            .map(([symbol, value, fullName, city, website, state]) => ({
                symbol,
                value: parseFloat(value.replace(/[$,]/g, '')),
                fullName,
                city,
                website,
                state
            }))
            .sort((a, b) => b.value - a.value);

        return investments.slice(0, topX);
    } catch (error) {
        console.error('Error in perShareholderPerCompany:', error);
        return [];
    }
}

export async function specificShareholderOwnershipPerState(shareholder, state, topX) {
    // Same as ownershipByState but with a specific shareholder's info being returned as the first element and the topX holders being returned in the second element of the tuple
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/ownership_concentration_by_state.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Find the object where state matches the provided state
        const stateData = data.find(item => item.state === state);

        // If no matching state is found, return an empty array
        if (!stateData) {
            console.error(`State "${state}" not found in the data`);
            return [];
        }

        // Sort the top holders by value, cleaning the value from "$" and commas
        const sortedHolders = stateData.top_holders
            .map(holder => ({
                shareholder: holder.name,
                value: parseFloat(holder.value.replace(/[$,]/g, '')) // Remove $ and commas, then convert to float
            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order

        // Find the specific shareholder's info
        const specificShareholder = sortedHolders.find(holder => holder.shareholder === shareholder);

        if (!specificShareholder) {
            console.error(`Shareholder "${shareholder}" not found in the data for state "${state}"`);
            return [null, sortedHolders.slice(0, topX), false];
        }

        // Determine if the specific shareholder is in the top X
        const specificShareholderIndex = sortedHolders.findIndex(holder => holder.shareholder === shareholder);
        console.log("specificShareholderIndex: ", specificShareholderIndex);
        const isShareholderInTopX = specificShareholderIndex < topX;
        
        if (isShareholderInTopX) {
            // If the shareholder is in the top X, remove the shareholder from the list
            sortedHolders.splice(specificShareholderIndex, 1);
        }

        return [specificShareholder, sortedHolders.slice(0, topX), specificShareholderIndex];
    } catch (error) {
        console.error('Error in ownershipByState:', error);
        return [];
    }
}

export async function specificShareholderOwnershipPerSector(shareholder, sector, topX) {
    // Same as ownershipBySector but with a specific shareholder's info being returned as the first element and the topX holders being returned in the second element of the tuple
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/ownership_concentration_by_sector.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Find the object where sector matches the provided sector
        const sectorData = data.find(item => item.sector === sector);

        // If no matching sector is found, return an empty array
        if (!sectorData) {
            console.error(`Sector "${sector}" not found in the data`);
            return [];
        }

        // Sort the top holders by value, cleaning the value from "$" and commas
        const sortedHolders = sectorData.top_holders
            .map(holder => ({
                shareholder: holder.name,
                value: parseFloat(holder.value.replace(/[$,]/g, '')) // Remove $ and commas, then convert to float
            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order

        // Find the specific shareholder's info
        const specificShareholder = sortedHolders.find(holder => holder.shareholder === shareholder);

        if (!specificShareholder) {
            console.error(`Shareholder "${shareholder}" not found in the data for sector "${sector}"`);
            return [null, sortedHolders.slice(0, topX), false];
        }

        // Determine if the specific shareholder is in the top X
        const specificShareholderIndex = sortedHolders.findIndex(holder => holder.shareholder === shareholder);
        console.log("specificShareholderIndex: ", specificShareholderIndex);
        const isShareholderInTopX = specificShareholderIndex < topX;

        if (isShareholderInTopX) {
            // If the shareholder is in the top X, remove the shareholder from the list
            sortedHolders.splice(specificShareholderIndex, 1);
        }

        return [specificShareholder, sortedHolders.slice(0, topX), specificShareholderIndex];

    } catch (error) {
        console.error('Error in ownershipBySector:', error);
        return [];
    }
}

export async function specificShareholderOwnershipInGeneral(shareholder, topX) {
    // Same as ownershipInGeneral but with a specific shareholder's info being returned as the first element and the topX holders being returned in the second element of the tuple
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/ownership_concentration.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }
        
        const data = await response.json();

        // Sort the top holders by value, cleaning the value from "$" and commas
        console.log("Data to be fixed: ", data.top_holders);
        const sortedHolders = data.top_holders
            .map(holder => ({
                shareholder: holder.name,
                value: parseFloat(holder.value.replace(/[$,]/g, '')) // Remove $ and commas, then convert to float

            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order

        // Find the specific shareholder's info
        const specificShareholder = sortedHolders.find(holder => holder.shareholder === shareholder);

        if (!specificShareholder) {
            console.error(`Shareholder "${shareholder}" not found in the data`);
            return [null, sortedHolders.slice(0, topX), false];
        }

        // Determine if the specific shareholder is in the top X
        const specificShareholderIndex = sortedHolders.findIndex(holder => holder.shareholder === shareholder);
        console.log("specificShareholderIndex: ", specificShareholderIndex);
        const isShareholderInTopX = specificShareholderIndex < topX;

        if (isShareholderInTopX) {
            // If the shareholder is in the top X, remove the shareholder from the list
            sortedHolders.splice(specificShareholderIndex, 1);
        }

        return [specificShareholder, sortedHolders.slice(0, topX), specificShareholderIndex];
    } catch (error) {
        console.error('Error in ownershipInGeneral:', error);
        return [];
    }
}


export async function perShareholderPerSector(shareholder, topX) {
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/shareholder_per_sector.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Check if the shareholder exists in the data
        if (!data[shareholder]) {
            throw new Error('Shareholder not found in data');
        }

        // Extract investments and sort by investment value
        const investments = data[shareholder]
            .map(([sector, value, fullName, city, state, website]) => ({
                sector,
                value: parseFloat(value.replace(/[$,]/g, '')),
                fullName,
                city,
                state,
                website
            }))
            .sort((a, b) => b.value - a.value);

        // Return the top X investments
        return investments.slice(0, topX);
    } catch (error) {
        console.error('Error in perShareholderPerSector:', error);
        return [];
    }
}

export async function perShareholderPerSectorPerCompany(shareholder, sector, topX) {
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/shareholder_per_sector_per_company.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Check if the shareholder and sector exist in the data
        if (!data[shareholder] || !data[shareholder][sector]) {
            throw new Error('Shareholder or sector not found in data');
        }

        // Extract investments and sort by investment value
        const investments = data[shareholder][sector]
            .map(([symbol, value, fullName, city, state, website]) => ({
                symbol,
                value: parseFloat(value.replace(/[$,]/g, '')),
                fullName,
                city,
                state,
                website
            }))
            .sort((a, b) => b.value - a.value);

        // Return the top X investments
        return investments.slice(0, topX);
    } catch (error) {
        console.error('Error in perShareholderPerSectorPerCompany:', error);
        return [];
    }
}


export async function ownershipBySector(sector, topX) {
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/ownership_concentration_by_sector.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Find the object where sector matches the provided sector
        const sectorData = data.find(item => item.sector === sector);

        // If no matching sector is found, return an empty array
        if (!sectorData) {
            console.error(`Sector "${sector}" not found in the data`);
            return [];
        }

        // Sort the top holders by value, cleaning the value from "$" and commas
        const sortedHolders = sectorData.top_holders
            .map(holder => ({
                shareholder: holder.name,
                value: parseFloat(holder.value.replace(/[$,]/g, '')) // Remove $ and commas, then convert to float
            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order

        // Return the top X holders
        return sortedHolders.slice(0, topX);
    } catch (error) {
        console.error('Error in ownershipBySector:', error);
        return [];
    }
}

export async function ownershipByState(state, topX) {
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/ownership_concentration_by_state.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Find the object where state matches the provided state
        const stateData = data.find(item => item.state === state);

        // If no matching state is found, return an empty array
        if (!stateData) {
            console.error(`State "${state}" not found in the data`);
            return [];
        }

        // Sort the top holders by value, cleaning the value from "$" and commas
        const sortedHolders = stateData.top_holders
            .map(holder => ({
                shareholder: holder.name,
                value: parseFloat(holder.value.replace(/[$,]/g, '')) // Remove $ and commas, then convert to float
            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order

        return {
            holders: sortedHolders.slice(0, topX),
            shares_value: stateData.total_shares_value
        }


    } catch (error) {
        console.error('Error in ownershipByState:', error);
        return [];
    }
}

export async function ownershipInGeneral(topX) {
    try {
        // Fetch the JSON file from the public directory
        const response = await fetch('/ownership_concentration.json');
        if (!response.ok) {
            throw new Error('Failed to fetch the data');
        }

        const data = await response.json();

        // Sort the top holders by value, cleaning the value from "$" and commas
        const sortedHolders = data.top_holders
            .map(holder => ({
                shareholder: holder.name,
                value: parseFloat(holder.value.replace(/[$,]/g, '')) // Remove $ and commas, then convert to float
            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order

        // Return the top X holders
        return sortedHolders.slice(0, topX);
    } catch (error) {
        console.error('Error in ownershipInGeneral:', error);
        return [];
    }
}


