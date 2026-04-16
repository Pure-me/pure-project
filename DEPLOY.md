# Pure Project — Deployment Gids voor pureexcellence.be

## Snel starten (lokaal testen)

```bash
cd pure-project
npm install
node scripts/seed.js        # Genereert demo data + eerste account
npm run dev                 # Start op http://localhost:3000
```

Login: joltenfreiter@gmail.com / admin123

---

## Productie deployment op pureexcellence.be

### Optie 1: Vercel (aanbevolen — gratis tier beschikbaar)

1. Maak een gratis account op vercel.com
2. Installeer Vercel CLI: `npm i -g vercel`
3. Vanuit de `pure-project` map:
   ```bash
   vercel deploy --prod
   ```
4. In Vercel dashboard → Settings → Domains → Voeg `pureexcellence.be` toe
5. Voeg environment variables toe in Vercel:
   - `JWT_SECRET` = een lange willekeurige string (bijv. genereer via `openssl rand -hex 32`)

> **Opmerking:** Op Vercel werkt het JSON file database systeem niet in productie (serverless).
> Voor productie is een PostgreSQL database aangeraden (zie Optie 2).

---

### Optie 2: VPS / Server (bijv. Hetzner, DigitalOcean)

#### Vereisten:
- Node.js 18+ op de server
- PM2 voor process management
- Nginx als reverse proxy

#### Stappen:

```bash
# Op de server:
git clone [jouw-repo] pure-project
cd pure-project
npm install
npm run build

# Stel environment variabelen in:
export JWT_SECRET="jouw-geheime-sleutel-hier"
export NODE_ENV="production"

# Seed de database (eerste keer):
node scripts/seed.js

# Start met PM2:
npm install -g pm2
pm2 start npm --name "pure-project" -- start
pm2 save
pm2 startup
```

#### Nginx configuratie:
```nginx
server {
    server_name pureexcellence.be www.pureexcellence.be;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL met Let's Encrypt:
```bash
certbot --nginx -d pureexcellence.be -d www.pureexcellence.be
```

---

## Upgrade naar PostgreSQL (voor grote teams)

1. Installeer: `npm install pg @types/pg`
2. Vervang de `src/lib/db.ts` JSON-functies door PostgreSQL queries
3. Verbindingsstring in `.env`: `DATABASE_URL=postgresql://user:pass@host:5432/pureproject`

---

## Environment Variables

Maak een `.env.local` aan in de root van `pure-project`:

```env
JWT_SECRET=verander-dit-naar-een-veilige-sleutel-van-minstens-32-tekens
NODE_ENV=production
```

---

## Platform overzicht

| Module | URL | Beschrijving |
|--------|-----|--------------|
| Dashboard | /dashboard | Overzicht + AI assistent |
| Projecten | /dashboard/projects | Alle projecten beheren |
| Taken | /dashboard/tasks | Taken, acties, maatregelen |
| Kwaliteit | /dashboard/quality | ISO 9001 kwaliteitsitems |
| BCM | /dashboard/bcm | Risico's en herstelplannen |

---

## Roadmap (volgende versies)

- [ ] Documentenbeheer module (upload, versioning)
- [ ] Teamleden uitnodigen per e-mail
- [ ] Automatische e-mailnotificaties
- [ ] Gantt-chart weergave voor projecten
- [ ] Rapportgeneratie (PDF export)
- [ ] Mobile app (React Native)
- [ ] Real-time samenwerking (WebSockets)
- [ ] Integraties: Outlook, Teams, Google Workspace
- [ ] White-label / multi-tenant voor klanten
