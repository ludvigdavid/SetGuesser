# Pokéguesser

Learn which set a card belongs to. Drag the card onto one of six sets below it (or tap one), and you get a green or red flash. Swipe left to skip.

Version 1 includes the home screen, **Free play** with **Vintage** sets (Base Set to Neo Destiny, plus Legendary Collection), drag-or-tap answer buttons, swipe left to skip, large card images, haptics, settings (holos only), score, streak and a saved best streak.

## Run it on your iPhone (no Mac needed)

1. Install **Node.js** (LTS) on your PC: https://nodejs.org
2. Install **Expo Go** on your iPhone from the App Store.
3. Unzip this folder, open a terminal in it and run:
   ```
   npm install
   npx expo start
   ```
4. A QR code appears in the terminal. Scan it with the iPhone **Camera** app and it opens in Expo Go.
   - The PC and the phone need to be on the same Wi-Fi. If it won't connect, run `npx expo start --tunnel` instead.
5. If Expo Go says the project's SDK version isn't supported, update Expo Go from the App Store.

Changes you make to the code reload on the phone automatically.

## Card data

Cards and images come from the Pokémon TCG API (https://pokemontcg.io), so the phone needs internet. Each set is downloaded once and kept on the phone for a week.

Optional: a free API key gives higher rate limits. Copy `.env.example` to `.env`, paste the key after `=`, then restart `npx expo start`.

## Where things are

| File | What it does |
|---|---|
| `src/data/sets.ts` | Eras and sets (API set ids). Add sets to an era here to enable it |
| `src/data/api.ts` | Fetching and caching cards |
| `src/game/round.ts` | Picks the card and the 6 answer options (look-alike sets first) |
| `src/components/CardView.tsx` | The card image with rounded corners |
| `src/components/SettingsSheet.tsx` | Settings panel |
| `src/screens/PlayScreen.tsx` | The game: card, answer buttons, flash, score |
| `src/screens/HomeScreen.tsx` | Era and mode picker |
| `src/theme.ts` | Colours, fonts, the sticker style |

## Things to check on a real phone

- **Card size:** set by `cardW` in `PlayScreen.tsx`.
- **Card size vs buttons:** `CHROME_H` in `PlayScreen.tsx` is the space kept for everything except the card. Lower it for a bigger card.

## Publishing later

To put it on the App Store you need an Apple Developer account. Builds can be made in the cloud with EAS (`npx eas-cli@latest build -p ios`), so no Mac is needed. This app isn't affiliated with Nintendo or The Pokémon Company; keep official logos out of the name and icon.

## Feature requests (Google Form)

Tapping **Request** on a "Soon" mode sends an anonymous response to a Google Form you own. Every tap counts, so players can tap again to show they really want it.

1. Create a form at forms.google.com with one **Short answer** question, e.g. "Feature".
2. Click ⋮ → **Get pre-filled link**, type `test` in the answer, click **Get link** and copy it.
   It looks like `https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456789=test`.
3. In `src/feedback.ts`, set `FORM_ID` to the long id and `ENTRY_ID` to the number after `entry.`.
4. See the counts in the form's **Responses** tab (or link it to a Google Sheet).

## Built-in card data (faster start)

Run this once (needs internet, takes a few minutes) to save every set's card list into the app:

```
npm run cards
```

Games then start instantly and swipe mode/Collection work even when the card database is down; only the card pictures are downloaded. Prices are a snapshot from when you ran it, so run it again now and then to refresh prices or after adding new sets. Sets that fail are kept from the previous run; run the command again to retry them.

## Website for GitHub Pages

```
npm run build:web
```

This creates a `web-build` folder. Upload everything inside it (including `.nojekyll`) to the `pokeguesser` repository.
