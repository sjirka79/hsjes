# HSJES Calendar

Kalendář nad diskuzemi pro [Flarum](https://flarum.org). Diskuze s datem se stává událostí — vidíš ji v měsíčním kalendáři i v seznamu nadcházejících akcí.

Vyvinuto pro spolek HSJES, ale funguje obecně.

## Funkce

- ☑ Checkbox „Vytvořit událost" přímo v composeru nové diskuze
- Datum začátku (povinné) a konce (volitelné), Flatpickr s českou lokalizací, krok 15 minut
- Stránka `/calendar` v sidebaru — měsíční pohled (FullCalendar), přepínač na seznam, mobile-first chování
- Akce v kalendáři jsou obarvené podle prvního tagu diskuze
- Klik na akci otevře odpovídající Flarum diskuzi
- Editace / odstranění data přes Controls menu diskuze („Upravit datum")
- Časová zóna napevno `Europe/Prague`

## Požadavky

- Flarum ^1.8
- Standardní extension `flarum/tags` (kvůli barvám podle tagů; není povinné, ale doporučené)

## Instalace (až bude na Packagistu)

```bash
composer require hsjes/flarum-calendar
php flarum migrate
php flarum cache:clear
```

Pak povolit v adminu (Extensions → HSJES Calendar).

## Lokální vývoj a testování (než bude publikované)

V `composer.json` Flarumu přidat:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "/cesta/k/hsjes",
      "options": { "symlink": true }
    }
  ],
  "require": {
    "hsjes/flarum-calendar": "*"
  }
}
```

Pak:

```bash
composer update hsjes/flarum-calendar
php flarum migrate
php flarum cache:clear
```

### Build frontendu

```bash
cd js
npm install
npm run build      # produkce
npm run dev        # watch mode pro vývoj
```

`js/dist/forum.js` a `js/dist/admin.js` jsou kompilované soubory commitované v repu — Flarum je servíruje přes asset pipeline.

## API

```
GET  /api/calendar?filter[from]=2026-05-01&filter[to]=2026-06-01
POST /api/discussions
{
  "data": {
    "type": "discussions",
    "attributes": {
      "title": "Schůze členů",
      "content": "...",
      "startsAt": "2026-05-15T18:00:00",
      "endsAt":   "2026-05-15T20:00:00"
    }
  }
}
PATCH /api/discussions/{id}
  attributes.startsAt = null   → smaže event
  attributes.startsAt = "..."  → vytvoří/aktualizuje
```

Endpoint `/api/calendar` respektuje viditelnost diskuzí (`whereVisibleTo`), takže skryté tagy a private diskuze se v kalendáři neobjeví uživatelům, kteří k nim nemají přístup.

## Datový model

Tabulka `discussion_events` je 1:1 vůči `discussions` (FK s `ON DELETE CASCADE`). Smazání diskuze tedy automaticky smaže její event.

```
discussion_events
  id              unsigned int, PK
  discussion_id   unsigned int, FK → discussions.id, UNIQUE
  starts_at       datetime
  ends_at         datetime, nullable
  all_day         bool, default false  (zatím nevyužito)
  created_at, updated_at
```

## Oprávnění

Žádné nové permissions. Kdo může založit diskuzi v daném tagu, ten u ní může i nastavit datum. Editace data sleduje `discussion.canRename()` (stejná logika jako přejmenování diskuze).

## Licence

MIT
