const root = document.getElementById('root');

root.innerHTML = `
  <h1>Database Test</h1>
  <button id="createTable">Create Table</button>
  <button id="insertData">Insert Data</button>
  <button id="getData">Get Data</button>
  <pre id="result"></pre>
`;

document.getElementById('createTable').addEventListener('click', async () => {
  const response = await fetch(`${window.ENV.API_URL}/create-table`, { method: 'POST' });
  const data = await response.json();
  document.getElementById('result').innerText = JSON.stringify(data, null, 2);
});

document.getElementById('insertData').addEventListener('click', async () => {
  const response = await fetch(`${window.ENV.API_URL}/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Name' }),
  });
  const data = await response.json();
  document.getElementById('result').innerText = JSON.stringify(data, null, 2);
});

document.getElementById('getData').addEventListener('click', async () => {
  const response = await fetch(`${window.ENV.API_URL}/data`);
  const data = await response.json();
  document.getElementById('result').innerText = JSON.stringify(data, null, 2);
});
