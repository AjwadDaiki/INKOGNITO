# INKOGNITO

Party game multijoueur en temps réel basé sur le dessin, les rôles cachés et le vote.

## Commandes

### Développement local

```powershell
npm install
npm run dev
```

- Client Vite: `http://localhost:5173`
- Serveur Socket.IO + API: `http://localhost:3001`

### Build production

```powershell
npm install
npm run build
```

### Lancer en production

```powershell
$env:PORT=3001
npm start
```

Version shell Unix:

```bash
PORT=3001 npm start
```

## Déploiement simple

Le serveur Express sert automatiquement le build frontend depuis `dist/`.

Workflow minimal:

```bash
npm install
npm run build
PORT=3001 npm start
```

Ensuite, place un reverse proxy devant si besoin:

- domaine public vers `3001`
- WebSocket activé sur `/socket.io`
- HTTPS recommandé

## MVP réellement branché

- création et rejointe de room
- lobby avec hôte, ready, réglages et mots custom
- attribution des rôles
- dessin live synchronisé
- galerie
- discussion + point du doigt + chat
- vote secret
- résolution avec score
- fin de partie avec classement, awards et historique des rounds

## Limites actuelles

- pas de mode Chaos
- pas de sound design complet
- pas d’image de partage auto
- pas encore de système avancé de spectateur / AFK / replay
