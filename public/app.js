// public/app.js

// Elements
const uploadBtn        = document.getElementById('upload-btn');
const fileInput        = document.getElementById('file-input');
const jobsList         = document.getElementById('jobs-list');
const resultsContainer = document.getElementById('results-container');

// Track the <li> for each filename
const jobs = {};

// Open WebSocket first
const socket = new WebSocket(`ws://${location.host}/ws`);
socket.onopen    = () => console.log('🟢 WS connected');
socket.onerror   = err => console.error('🔴 WS error', err);
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('[Debug] data:',data)
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
    resultsContainer.appendChild(div);
  }
};

// Upload handler
uploadBtn.addEventListener('click', () => {
  const files = Array.from(fileInput.files);
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
