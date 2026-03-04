# MarketCrack

Pressure-test your business idea or company with 22 dimensions of McKinsey-style analysis — powered by live web research.

## Deploy to Vercel (3 steps)

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "init"
gh repo create marketcrack --public --push
```

**2. Import in Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repo
- Framework: Next.js (auto-detected)

**3. Add environment variable**
In Vercel project settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-...
```

Deploy. Done.

## Run locally
```bash
npm install
cp .env.example .env.local
# add your key to .env.local
npm run dev
```

## Architecture

```
/app
  /api/analyze/route.ts   ← Server-side API route (API key never exposed)
  /components/MarketCrack.tsx  ← Client UI
  layout.tsx
  page.tsx
  globals.css
```

The API key lives only in Vercel environment variables — never in the browser.
All Anthropic calls go through `/api/analyze` server route.
Web search is handled by Claude's built-in `web_search` tool.

## What it analyzes

22 dimensions including:
- Problem validation
- Why now (timing)
- ICP (ideal customer profile)
- TAM / SAM / SOM
- Competitive landscape
- Differentiation & moat
- AI substitutability
- Go-to-market
- Unit economics
- Business model clarity
- Regulatory landscape
- Build vs buy vs partner
- Team fit
- Traction signals
- Exit potential
- Porter's Five Forces
- Risks & critical assumptions
- What would need to be true
- Bull / base / bear scenarios
- Investor narrative
- Next 90 days
- Weighted scorecard
