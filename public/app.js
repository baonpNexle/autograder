// public/app.js

// Elements
const uploadBtn        = document.getElementById('upload-btn');
const fileInput        = document.getElementById('file-input');
const jobsList         = document.getElementById('jobs-list');
const resultsContainer = document.getElementById('results-container');
const analytContainer  = document.getElementById('analytics-container')

// Track the <li> for each filename
const jobs = {};

const MAX_FILE_SIZE = 2 * 1024 * 1024; //2MB max file size in bytes

// Open WebSocket first
const socket = new WebSocket(`ws://${location.host}/ws`);
socket.onopen    = () => console.log('🟢 WS connected');
socket.onerror   = err => console.error('🔴 WS error', err);
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('⬅️ WS message:', data);

  const { file, status, passed, actual, expected } = data;

  // If this is the first event for that file, create its <li>
  if (!jobs[file]) {
    const li = document.createElement('li');
    li.id = `job-${file}`;
    li.innerHTML = `<span class="font-medium">${file}</span>: <span>${status}</span>`;
    jobsList.appendChild(li);
    jobs[file] = li;
  } else {
    // Otherwise just update its status text
    const badge = jobs[file].querySelector('span:nth-child(2)');
    badge.textContent = status;
  }

  // When complete, append a result block
  if (status === 'complete') {
    const div = document.createElement('div');
    div.className = 'p-4 border rounded';

    if (passed) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { x: 0.5, y: 0.7 }
      });
      div.innerHTML = `<p class="text-green-600">✔️ ${file} ts pmo Skibidy</p>`;
    } else {
      div.innerHTML = `
        <p class="text-red-600">❌ ${file} failed</p>
        <pre class="bg-gray-100 p-2 mt-2"><code>${actual}</code></pre>
        <pre class="bg-gray-100 p-2 mt-2"><code>${expected}</code></pre>
      `;
    }
    resultsContainer.prepend(div);
  }
};

// Upload handler
uploadBtn.addEventListener('click', () => {
  const files = Array.from(fileInput.files);
  const tooBig = files.filter(f => f.size > MAX_FILE_SIZE);
  if (tooBig.length) {
    alert(`Cannot upload; these exceed 2 MB:\n• ${tooBig.map(f=>f.name).join('\n• ')}`);
    return;
  }
  if (!files.length) return alert('Please select .c file(s)');

  // Show them as pending *immediately*
  files.forEach(file => {
    if (!jobs[file.name]) {
      const li = document.createElement('li');
      li.id = `job-${file.name}`;
      li.innerHTML = `<span class="font-medium">${file.name}</span>: <span>pending</span>`;
      jobsList.appendChild(li);
      jobs[file.name] = li;
    }
  });

  // Build FormData and send
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  fetch('/enqueue', { method: 'POST', body: formData })
    .then(res => {
      if (!res.ok) throw new Error('Upload failed');
      console.log('➡️ Files enqueued');
    })
    .catch(err => console.error(err));
});

;(function(){
  // stubbed stats
  const analyticsData = { mean: 75, std: 10 };

  // render text
  const meanEl = document.createElement('p');
  meanEl.textContent = `Mean: ${analyticsData.mean}`;
  meanEl.className = 'text-lg text-gray-800';
  const stdEl  = document.createElement('p');
  stdEl.textContent  = `Std Dev: ${analyticsData.std}`;
  stdEl.className   = 'text-lg text-gray-800';

  const statsWrapper = document.createElement('div');
  statsWrapper.className = 'flex items-center space-x-6';
  const textWrapper  = document.createElement('div');
  textWrapper.append(meanEl, stdEl);

  // insert text into analytics container
  statsWrapper.append(textWrapper);

  // create canvas for chart
  const canvas = document.createElement('canvas');
  canvas.id    = 'analytics-chart';
  canvas.width = 300;
  canvas.height= 150;
  statsWrapper.append(canvas);

  analytContainer.append(statsWrapper);

  // build labels & normal-pdf values
  const labels = Array.from({length:151}, (_,i) => i);
  const values = labels.map(x => {
    const μ = analyticsData.mean, σ = analyticsData.std;
    return (1/(σ*Math.sqrt(2*Math.PI))) *
      Math.exp(-((x-μ)**2)/(2*σ*σ));
  });

  // render chart
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Normal Distribution',
        data: values,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
})();