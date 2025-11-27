

// 'Or' Frequency Pie Charts
async function fetchOrData(question_name) {
  const res = await fetch(`/api/orstats?question=${question_name}`);
  if (!res.ok) {
    console.error(`Failed to fetch OR data for ${question_name}`, res.status);
    return [];
  }
  return await res.json();
}

function createPieChart(canvasId, labels, data) {
  const backgroundColors = ['#fc0fc0', '#ffff33', '#ff69b4', '#fff200', '#ffb6c1'];

  const ctx = document.getElementById(canvasId).getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderColor: 'white'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'white',
            font: { family: 'Poppins', size: 14 },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          bodyFont: { family: 'Poppins', size: 14 },
          titleFont: { family: 'Poppins', size: 14, weight: '400' }
        }
      }
    }
  });
}

async function renderPieChart(question_name, canvasId) {
  const data = await fetchOrData(question_name);
  if (!data || data.length === 0) return;

  const labels = data.map(item => item.option_chosen);
  const counts = data.map(item => parseInt(item.option_count, 10));
  createPieChart(canvasId, labels, counts);
}

// Most Played, Most Guessed
async function renderTopPlayedList() {
  const res = await fetch('/api/top5songs');
  if (!res.ok) return console.error('Failed to fetch top 5 played songs');
  const songs = await res.json();

  const container = document.querySelector('#topPlayedList');
  container.innerHTML = '';

  const list = document.createElement('ol');
  list.style.paddingLeft = '30px';
  songs.forEach(song => {
    const li = document.createElement('li');
    li.textContent = `${song.title} (${song.play_count} plays)`; // no album
    list.appendChild(li);
  });
  container.appendChild(list);
}

async function renderTopGuessedSection() {
  const res = await fetch('/api/top-guessed-songs');
  if (!res.ok) return console.error('Failed to fetch top guessed songs');
  const songs = await res.json();

  const container = document.querySelector('#topGuessedContainer');
  container.innerHTML = '';

  const isMobile = window.innerWidth <= 600;

  if (isMobile) {
    // Single column for mobile
    const ol = document.createElement('ol');
    ol.style.paddingLeft = '30px';

    songs.forEach((s, idx) => {
      const li = document.createElement('li');
      li.textContent = `${s.song} (${s.count} guesses)`;
      ol.appendChild(li);
    });

    container.appendChild(ol);
  } else {
    // Two columns for desktop
    const col1 = document.createElement('ol');
    const col2 = document.createElement('ol');
    col1.style.paddingLeft = col2.style.paddingLeft = '30px';

    songs.slice(0, 5).forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s.song} (${s.count} guesses)`;
      col1.appendChild(li);
    });

    songs.slice(5, 10).forEach((s, idx) => {
      const li = document.createElement('li');
      li.textContent = `${s.song} (${s.count} guesses)`;
      col2.appendChild(li);
    });

    col2.setAttribute('start', 6); // start numbering at 6
    container.appendChild(col1);
    container.appendChild(col2);
  }
}


// Album Bar Chart 
async function fetchAlbumDistribution() {
  const res = await fetch('/api/album-distribution');
  if (!res.ok) {
    console.error('Failed to fetch album distribution');
    return [];
  }
  return res.json();
}

async function createAlbumBarChart() {
  const data = await fetchAlbumDistribution();
  if (!data || data.length === 0) return;

  const ctx = document.getElementById('albumBarChart').getContext('2d');

  // Map specific album names to custom colors
  const albumColors = {
    'Entertainment': '#c8a2ff',       // lilac
    'Fandom': '#66ff66',              // green
    'Intellectual Property': '#ff6666', // red
    'Greatest Hits': '#ff9900',       // orange
    'Double Dare': '#ffff33',         // yellow
    'Black Light': '#4b0082',         // deep purple
    'Cluster': '#ff69b1'              // pink
  };

  // Default palette for other albums
  const defaultColors = ['#fc0fc0', '#66ccff', '#ffcc66', '#66ffff', '#ff66b2'];


  const backgroundColors = data.map((d, i) => {
    return albumColors[d.album_name] || defaultColors[i % defaultColors.length];
  });


  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.album_name),
      datasets: [{
        label: 'Total Surprise Song Plays',
        data: data.map(d => d.play_count),
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: 'white', font: { family: 'Poppins', size: 14 } },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          ticks: { color: 'white', font: { family: 'Poppins', size: 16 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: 'Poppins', size: 14, weight: '400' },
          bodyFont: { family: 'Poppins', size: 14 },
          callbacks: {
            label: context => `${context.raw} plays`
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'right',
          color: 'white',
          font: { family: 'Poppins', size: 14, weight: '500' },
          formatter: val => val
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// songs played by city
const cityDropdown = document.getElementById("cityDropdown");
const citySongsContainer = document.getElementById("citySongsContainer");

// Populate dropdown with past cities
async function populateCityDropdown() {
  try {
    const res = await fetch("/api/cities");
    const cities = await res.json();

    // Add a default placeholder option
    cityDropdown.innerHTML = `<option value="">Select a city</option>`;

    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityDropdown.appendChild(option);
    });

    // Automatically select the first real option (index 1)
    if (cities.length > 0) {
      cityDropdown.selectedIndex = 1;
      cityDropdown.dispatchEvent(new Event('change')); // Auto-load songs for that city
    }

  } catch (err) {
    console.error("Error fetching cities", err);
  }
}

// Render songs for selected city
cityDropdown.addEventListener("change", async () => {
  const selectedCity = cityDropdown.value;
  if (!selectedCity) return;

  try {
    const response = await fetch(`/api/songs-by-city?city=${encodeURIComponent(selectedCity)}`);
    const songs = await response.json();

    citySongsContainer.innerHTML = ""; // Clear previous cards

    if (songs.length === 0 || songs.every(song => !song.title)) {
      const message = document.createElement("div");
      message.textContent = "No surprise songs were played at this show.";
      message.style.padding = "10px";
      message.style.fontStyle = "italic";
      citySongsContainer.appendChild(message);
      return;
    }

    songs.forEach(song => {
      if (!song.title) return; // skip null rows

      const card = document.createElement("div");
      card.className = "song-card";

      const title = document.createElement("div");
      title.textContent = song.title;
      title.style.fontWeight = "700";
      title.style.marginBottom = "6px";

      const albumLabel = document.createElement("div");
      albumLabel.textContent = song.album;
      albumLabel.style.fontSize = "0.85em";
      albumLabel.style.opacity = "0.8";

      card.appendChild(title);
      card.appendChild(albumLabel);

      const albumColors = {
        "Greatest Hits": "#FFA500",
        "Double Dare": "#2950de",
        "Black Light": "#800080",
        "Cluster": "#FFC0CB",
        "Entertainment": "#C8A2FF",
        "Fandom": "#17a812",
        "Intellectual Property": "#a81212",
        "Other": "#e800af",
        "Airplane Conversations": "#444"
      };

      card.style.backgroundColor = albumColors[song.album] || albumColors["Other"];
      card.style.borderColor = albumColors[song.album] || "#888";

      citySongsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching songs by city", err);
  }
});

// Call dropdown population on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  populateCityDropdown();
});

// Unplayed Songs section 
async function fetchUnplayedSongs(album) {
  const res = await fetch(`/api/unplayed-songs?album=${encodeURIComponent(album)}`);
  if (!res.ok) {
    console.error("Failed to fetch unplayed songs");
    return [];
  }
  return await res.json();
}

async function renderUnplayedSongs() {
  const container = document.getElementById('unplayedSongsContainer');
  const album = document.getElementById('albumSelect').value;

  container.innerHTML = '';

  if (!album) return;

  const songs = await fetchUnplayedSongs(album);

  if (songs.length === 0) {
    container.innerHTML = `<p class="no-results">All songs from this album have been played!</p>`;
    return;
  }

  songs.forEach(song => {
    const card = document.createElement('div');
    card.className = "song-card";
    card.innerHTML = `
      <div>${song.title}</div>
      <div class="album-label">${album}</div>
    `;
    container.appendChild(card);
  });
}

document.getElementById('albumSelect').addEventListener('change', renderUnplayedSongs);




document.addEventListener('DOMContentLoaded', () => {
  // Collapse buttons
  document.querySelectorAll('.collapse-btn').forEach(button => {
    const content = button.nextElementSibling;
    //content.style.display = 'none';

    button.addEventListener('click', () => {
      const isOpen = content.style.display !== 'none';
      content.style.display = isOpen ? 'none' : ''; // '' restores CSS default
      button.classList.toggle('active', !isOpen);
    });

  });

  // Render lists and charts
  renderPieChart('q1', 'chartQ1');
  renderPieChart('q2', 'chartQ2');
  renderPieChart('q6', 'chartQ6');
  renderPieChart('q7', 'chartQ7');

  renderTopPlayedList();        // Section 2
  createAlbumBarChart();         // Section 2 chart
  renderTopGuessedSection();     // Section 3

  const albumSelect = document.getElementById("albumSelect");
  albumSelect.selectedIndex = 1;
  albumSelect.dispatchEvent(new Event('change'));
});


// resize charts on window resize 
window.addEventListener('resize', () => {
  document.querySelectorAll('canvas').forEach(canvas => {
    if (canvas.chart) canvas.chart.resize();
  });
});
