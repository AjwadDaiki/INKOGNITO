# Serveur INKOGNITO

Le serveur est un backend Express + Socket.IO.

## Fichier principal

- [index.ts](C:\Users\Daiki\Desktop\inko\server\index.ts)

## Port par defaut

Le serveur ecoute par defaut sur :

- `3001`

Health check :

- `http://localhost:3001/health`

## Lancer en developpement

Depuis la racine du projet :

```powershell
npm install
npm run dev:server
```

## Lancer le projet complet

Depuis la racine du projet :

```powershell
npm install
npm run dev
```

Cela lance :

- le serveur avec `tsx watch server/index.ts`
- le client Vite en parallele

## Build serveur

Depuis la racine du projet :

```powershell
npm run build:server
```

Le resultat est genere dans `server-dist/`.

## Lancer le serveur build

```powershell
$env:PORT=3001
npm start
```

## Changer le port

Le serveur lit `PORT` :

```powershell
$env:PORT=3002
npm run dev:server
```

ou en production :

```powershell
$env:PORT=3002
npm start
```

## Si `3001` est deja pris

Trouver le process :

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen
```

Tuer le process :

```powershell
Stop-Process -Id <PID> -Force
```

## Notes utiles

- Le frontend build est servi automatiquement depuis `dist/` si ce dossier existe.
- Socket.IO passe par `/socket.io`.
- Le serveur accepte les requetes JSON jusqu'a `1mb`.
