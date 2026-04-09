# INKOGNITO

Party game multijoueur en temps reel base sur le dessin, les roles caches et le vote.

## Lancer le projet

### Installation

```powershell
npm install
```

### Developpement complet

Lance le client Vite et le serveur Socket.IO ensemble :

```powershell
npm run dev
```

En general :

- client : `http://localhost:5173`
- serveur : `http://localhost:3001`

Si `5173` est deja pris, Vite prendra un autre port (`5174`, `5175`, etc.).  
Ouvre l'URL affichee dans le terminal.

## Lancer separement

### Client uniquement

```powershell
npm run dev:client
```

### Serveur uniquement

```powershell
npm run dev:server
```

Le serveur utilise par defaut :

- port `3001`
- endpoint health : `http://localhost:3001/health`

## Build

```powershell
npm run build
```

## Preview du build frontend

```powershell
npm run preview
```

Attention : `preview.html` est une maquette statique.  
Ce n'est pas l'application React. Pour voir les vraies modifs, utilise `npm run dev` ou `npm run preview`.

## Production

```powershell
$env:PORT=3001
npm start
```

Equivalent bash :

```bash
PORT=3001 npm start
```

## Si un port est deja pris

### Fermer les vieux process Node

Exemple PowerShell :

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen
Stop-Process -Id <PID> -Force
```

Exemple pour plusieurs ports :

```powershell
Stop-Process -Id 21752,14916,15152,18636 -Force
```

## Documentation serveur

Voir aussi :

- [server/README.md](C:\Users\Daiki\Desktop\inko\server\README.md)
