// ===== Collapsible Section Logic =====
document.querySelectorAll('.collapse-btn').forEach(button => {
  const content = button.nextElementSibling;
  content.style.display = 'none'; // ensure starts collapsed

  button.addEventListener('click', () => {
    const isOpen = content.style.display === 'flex';
    content.style.display = isOpen ? 'none' : 'flex';
    button.classList.toggle('active', !isOpen);
  });
});


// ===== Fetch & Render OR Question Pie Charts =====
async function fetchOrData(question_name) {
  const res = await fetch(`/api/orstats?question=${question_name}`);
  if (!res.ok) {
    console.error(`Failed to fetch OR data for ${question_name}`, res.status);
    return [];
  }
  return await res.json();
}

function createPieChart(canvasId, labels, data) {
  const backgroundColors = ['#fc0fc0', '#ffff33', '#ff69b4', '#fff200', '#ffb6c1']; // pink/yellow palette

  const ctx = document.getElementById(canvasId).getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
        borderColor: 'white'  // optional: a thin white border between slices
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom', // put legend below chart
          labels: {
            color: 'white', // legend text color
            font: {
              family: 'Poppins',
              size: 14,
              weight: '400'
            },
            padding: 15, // spacing between items
            usePointStyle: true, // small circles instead of boxes
            pointStyle: 'circle'
          }
        },
        tooltip: {
          bodyFont: {
            family: 'Poppins',
            size: 14
          },
          titleFont: {
            family: 'Poppins',
            weight: '400',
            size: 14
          }
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

async function renderTop5Songs() {
  const res = await fetch('/api/top5songs');
  if (!res.ok) {
    console.error('Failed to fetch top 5 songs');
    return;
  }
  const songs = await res.json();

  const container = document.querySelector('#songFrequencyChart');
  container.innerHTML = ''; // clear any previous content

  const list = document.createElement('ol');
  list.style.paddingLeft = '20px';

  songs.forEach(song => {
    const item = document.createElement('li');
    item.style.marginBottom = '8px';
    item.style.color = 'white';
    item.style.fontFamily = 'Poppins, sans-serif';
    item.textContent = `${song.title} — ${song.album} (${song.play_count})`;
    list.appendChild(item);
  });

  container.appendChild(list);
}

// Call this on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  renderPieChart('q1', 'chartQ1');
  renderPieChart('q2', 'chartQ2');
  renderPieChart('q6', 'chartQ6');
  renderPieChart('q7', 'chartQ7');
  renderTop5Songs(); // render the top 5 list
});


// Optional: resize charts on window resize
window.addEventListener('resize', () => {
  document.querySelectorAll('canvas').forEach(canvas => {
    if (canvas.chart) canvas.chart.resize();
  });
});
