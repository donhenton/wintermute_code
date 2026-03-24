# wintermute v2

word sculpture transmission system — dom edition

three registers: own voice / document fragment / literary fragment

you should cd in wintermute2 folder as that is where npm run dev should

be run from

The API key is at:
 
Go to platform.anthropic.com — this is the API platform where you manage your keys, billing, and usage.  Sign up with your email or Google account.


\---

## setup

```bash
npm install
cp .env.example .env
# add your ANTHROPIC\_API\_KEY to .env
npm run dev
```

open `http://localhost:3000`

\---

## deploy to railway

1. push to github
2. new project on railway.app → deploy from github
3. add environment variable: `ANTHROPIC\_API\_KEY`
4. deploys automatically

\---

## structure

```
wintermute2/
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

\---

## tuning

`pulse.js` — `BASE\_INTERVAL`, `JITTER`, `SILENCE\_CHANCE` for transmission frequency

`pulse.js` — `MODE\_WEIGHTS` for ratio of voice / document / literary

`sculptor.js` — mass and decay curves for how long clusters live

`sculpture.js` — `MAX\_CLUSTERS`, `CULL\_TARGET` for density

`wintermute.js` — the system prompt is everything

\---

*the sculpture exists in time. you catch a moment of it.*

