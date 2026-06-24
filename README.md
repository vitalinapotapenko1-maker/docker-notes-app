# Docker Multi-Service Application — Poznámkový blok

## Opis architektúry

Tento projekt demonštruje nasadenie trojvrstvovej webovej aplikácie pomocou systému Docker.

- **Frontend (FE):** Nginx 1.27, ktorý slúži statické HTML/JS súbory. Komunikuje s backendom cez HTTP API.
- **Backend (BE):** Flask (Python 3.12) REST API. Spracováva autentifikáciu (bcrypt hash hesiel) a CRUD operácie s poznámkami.
- **Databáza (DB):** PostgreSQL 16. Uchováva údaje používateľov a poznámok.

Každá služba beží vo vlastnom Docker kontajneri.

## Použité technológie

- Docker, Docker Compose
- Backend: Python 3.12, Flask 3.1, Flask-SQLAlchemy, bcrypt, PyJWT
- Frontend: HTML, CSS, JavaScript (Fetch API), Nginx 1.27-alpine
- Databáza: PostgreSQL 16-alpine

## Siete a Volumes

**Siete:**
- `fe-network` — prepája Frontend a Backend.
- `be-network` — prepája Backend a Databázu. Databáza nie je priamo dostupná z frontendovej siete.

Komunikácia medzi kontajnermi je realizovaná pomocou názvov služieb.

**Volumes:**
- `postgres_data` — pomenovaný Docker volume, ktorý zabezpečuje, že údaje v PostgreSQL prežijú reštart alebo odstránenie kontajnerov.

## Postup spustenia

**Požiadavky:** Nainštalovaný Docker a Docker Compose.

**Spustenie:**

Otvorte terminál v koreňovom priečinku projektu a spustite:

    docker-compose up --build -d

Alebo na Windows dvojklikom na `start-app.bat`.

**Zastavenie:**

    docker-compose down

Alebo na Windows dvojklikom na `end-app.bat`.

**Používanie:**

1. Otvorte aplikáciu v prehliadači.
2. Zaregistrujte sa (meno min. 3 znaky, heslo min. 4 znaky).
3. Prihláste sa zadanými údajmi.
4. Vytvárajte, upravujte a mazajte poznámky.

## URL aplikácie

Po spustení je aplikácia dostupná na: **http://localhost:8080**