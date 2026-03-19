// memory.js
// Rolling window of recent transmissions
// Fed back into Claude so it reads its own recent output before generating next

const WINDOW_SIZE = 6;
const history = [];

export function remember(text) {
  history.push(text);
  if (history.length > WINDOW_SIZE) history.shift();
}

export function recall() {
  return [...history];
}

export function flush() {
  history.length = 0;
}
