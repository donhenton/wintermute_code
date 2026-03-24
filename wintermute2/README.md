# wintermute v2

word sculpture transmission system — dom edition

three registers: own voice / document fragment / literary fragment

---

## setup

```bash
npm install
cp .env.example .env
# add your ANTHROPIC_API_KEY to .env
npm run dev
```

open `http://localhost:3000`

---

## deploy to railway

1. push to github
2. new project on railway.app → deploy from github
3. add environment variable: `ANTHROPIC_API_KEY`
4. deploys automatically

---

## structure

```
wintermute/
├── backend/
│   ├── server.js        # entry point
│   ├── wintermute.js    # claude api — three transmission modes
│   ├── memory.js        # rolling transmission history
│   ├── sculptor.js      # parse output into cluster descriptors
│   ├── pulse.js         # jittered heartbeat + mode selection
│   └── socket.js        # websocket broadcast
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── void.css     # breathing background
│   │   └── cluster.css  # word cluster styles
│   └── js/
│       ├── signal.js    # websocket client
│       └── sculpture.js # dom cluster lifecycle + composer
├── package.json
├── railway.json
└── .env.example
```

---

## tuning

`pulse.js` — `BASE_INTERVAL`, `JITTER`, `SILENCE_CHANCE` for transmission frequency

`pulse.js` — `MODE_WEIGHTS` for ratio of voice / document / literary

`sculptor.js` — mass and decay curves for how long clusters live

`sculpture.js` — `MAX_CLUSTERS`, `CULL_TARGET` for density

`wintermute.js` — the system prompt is everything

---

*the sculpture exists in time. you catch a moment of it.*
