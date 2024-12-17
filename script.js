// front end scripting for displaying results
let currentPage = 1;
const itemsPerPage = 16;

function searchPaintings(page = 1) {
  currentPage = page;
  console.log('current page:', currentPage);
  
  const subject = document.getElementById('subject').value.trim();
  const colorElements = document.getElementById('color').selectedOptions;
  const matchType = document.getElementById('matchType').value || 'all';
  let colors = '';
  if (colorElements.length > 0) {
    colors = Array.from(colorElements).map(option => option.value).join(',');
  }
  if (!subject && !colors) {
    console.error('No subjects or colors selected');
    return;
  }
    
  let query = '';
  if (subject) query += `subject=${encodeURIComponent(subject)}&`;
  if (colors) query += `color=${encodeURIComponent(colors)}&`;
  query += `matchType=${encodeURIComponent(matchType)}&page=${currentPage}&limit=${itemsPerPage}`;
  console.log('sending query:', query);
    
  fetch(`/api/paintings?${query}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Fetched data:", data);
      displayResults(data.paintings);
      setupPagination(data.totalPages, data.currentPage);
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
  
  function setupPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('li');
      button.className = 'page-item';
      button.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const page = this.querySelector('a').getAttribute('data-page');
        const pageNumber = parseInt(page);
        console.log('parse page:', pageNumber);
        if (isNaN(pageNumber)) {
          console.error('Invalid page number:', page);
          return;
        }
        searchPaintings(pageNumber);
      });
      pagination.appendChild(button);
    }
    updatePagination(currentPage);
  }
  
  function updatePagination(currentPage) {
    const pagination = document.getElementById('pagination');
    const buttons = pagination.querySelectorAll('.page-item');

    Array.from(buttons).forEach(button => {
      button.classList.remove('active');
    });
   
    const currentPageButton = pagination.querySelector(`a[data-page="${currentPage}"]`);
    if (currentPageButton) {
      currentPageButton.classList.add('active');
    }
  }

  function clearFilters() {
    document.getElementById('subject').selectedIndex = 0;
    document.getElementById('color').selectedIndex = 0;
    document.getElementById('matchType').selectedIndex = 0;

    document.getElementById('results').style.display = 'none';
    document.getElementById('pagination').innerHTML = '';
  }

  
  document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector('.btn-primary');
    searchButton.addEventListener('click', () => {
      const subject = document.getElementById('subject').value.trim();
      const colorElements = document.getElementById('color').selectedOptions;

      if (!subject && colorElements.length === 0) {
        alert('Please select at least one filter before searching');
        return;
      }
      searchPaintings(1);
    });
  });
