function processFile() {
    const fileInput = document.getElementById('fileInput');
    const keywordsInput = document.getElementById('keywords').value;
    const matchType = document.querySelector('input[name="matchType"]:checked').value;
    const keywords = keywordsInput.split(',').map(keyword => keyword.trim().toLowerCase());
    
    if (fileInput.files.length === 0) {
        alert("Please upload an XLSX file.");
        return;
    }
    
    const file = fileInput.files[0];
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const filteredResults = filterApplicants(json, keywords, matchType);
        displayResults(filteredResults, keywords);
        displayInsights(filteredResults);
    };
    
    reader.readAsArrayBuffer(file);
}

function filterApplicants(data, keywords, matchType) {
    return data.filter(row => {
        const text = (row.Skills || '') + ' ' + (row['Resume Text'] || '');
        const matches = keywords.map(keyword => text.toLowerCase().includes(keyword));
        
        if (matchType === 'all') {
            return matches.every(Boolean);
        } else {
            return matches.some(Boolean);
        }
    });
}

function displayResults(results, keywords) {
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    const noResultsMessage = document.getElementById('noResultsMessage');
    tableBody.innerHTML = ''; // Clear previous results
    
    if (results.length === 0) {
        noResultsMessage.style.display = 'block';
        return;
    } else {
        noResultsMessage.style.display = 'none';
    }
    
    results.forEach(row => {
        const newRow = tableBody.insertRow();
        newRow.insertCell().innerHTML = highlightKeywords(row['Job Application'] || '', keywords);
        newRow.insertCell().innerHTML = highlightKeywords(row['Stage'] || '', keywords);
        newRow.insertCell().innerHTML = highlightKeywords(row['Skills'] || '', keywords);
        newRow.insertCell().innerHTML = highlightKeywords(row['Resume Text'] || '', keywords);
    });
}

function displayInsights(results) {
    const insightsDiv = document.getElementById('dataInsights');
    const totalResults = results.length;
    insightsDiv.innerHTML = `<p><strong>Total Results:</strong> ${totalResults}</p>`;
}

function highlightKeywords(text, keywords) {
    if (!text) return '';
    keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        text = text.replace(regex, '<span style="background-color: yellow;">$1</span>');
    });
    return text;
}
