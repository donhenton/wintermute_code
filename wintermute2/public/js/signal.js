// signal.js
// WebSocket client — passive receiver, reconnects on drop

import { spawnCluster } from './sculpture.js';

function connect() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${protocol}://${location.host}`);

  ws.addEventListener('open', () => {
    console.log('signal: connected');
  });

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'transmission' && data.cluster) {
        spawnCluster(data.cluster);
      }
    } catch (e) {
      // malformed payload — ignore
    }
  });

  ws.addEventListener('close', () => {
    console.log('signal: disconnected — reconnecting in 5s');
    setTimeout(connect, 5000);
  });

  ws.addEventListener('error', () => {
    // error fires before close — close handler reconnects
  });
}

connect();
