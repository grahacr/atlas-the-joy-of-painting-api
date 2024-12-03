// front end scripting for displaying results
function searchPaintings() {
    const subject = document.getElementById('subject').value;
    const colorElements = document.getElementById('color').selectedOptions;
    const matchType = document.getElementById('matchType').value;

    const colors = Array.from(colorElements).map(option => option.value).join(',');
    let query = `subject=${subject}&color=${colors}&matchType=${matchType}`;
    console.log('sending query:', query);

    fetch(`/api/paintings?${query}`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data);
            displayResults(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function displayResults(paintings) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    if (!paintings || paintings.length === 0) {
        resultsContainer.innerHTML = '<p>No paintings found.</p>';
        return;
    }
    paintings.forEach(painting => {
        const card = document.createElement('div');
        card.classList.add('col-md-4', 'mb-4');
        card.innerHTML = `
        <div class="card">
            <img src="${painting.image}" alt="${painting.painting_title}" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title">${painting.painting_title}</h5>
                <p class="card-text"><strong>Episode:</strong> ${painting.episode_id}</p>
                <p class="card-text"><strong>Subjects:</strong> ${painting.subjects}</p>
                <p class="card-text"><strong>Colors:</strong> ${painting.colors}</p>
            </div>
        </div>
        `;
        resultsContainer.appendChild(card);
    });
}
