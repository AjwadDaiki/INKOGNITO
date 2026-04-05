# 🎭 INKOGNITO

### *Draw. Suspect. Betray.*

> Un party game multijoueur de déduction sociale par le dessin.
> Sans inscription. Sans friction. Juste un lien, tes potes, et ta poker face.

---

## 📋 Table des matières

1. [Vision & Philosophie](#1-vision--philosophie)
2. [Concept Core](#2-concept-core)
3. [Modes de jeu](#3-modes-de-jeu)
4. [Flow complet d'une partie](#4-flow-complet-dune-partie)
5. [Système de mots](#5-système-de-mots)
6. [Direction artistique](#6-direction-artistique)
7. [UI/UX — Écran par écran](#7-uiux--écran-par-écran)
8. [Système de dessin](#8-système-de-dessin)
9. [Système de vote](#9-système-de-vote)
10. [Game Feel & Micro-interactions](#10-game-feel--micro-interactions)
11. [Système audio](#11-système-audio)
12. [Fonctionnalités sociales](#12-fonctionnalités-sociales)
13. [Anti-triche & Edge cases](#13-anti-triche--edge-cases)
14. [Architecture technique](#14-architecture-technique)
15. [Responsive & Mobile](#15-responsive--mobile)
16. [Accessibilité](#16-accessibilité)
17. [Roadmap & V2 Ideas](#17-roadmap--v2-ideas)

---

## 1. Vision & Philosophie

### Le pitch en une phrase

**"Gartic Phone rencontre Undercover — tout le monde dessine le même mot, sauf un imposteur qui dessine un mot *presque* identique."**

### Principes fondateurs

| Principe | Détail |
|---|---|
| **Zero friction** | Pas d'inscription, pas de téléchargement, pas de compte. Un lien = tu joues. |
| **Discord-native** | Le jeu est pensé pour être joué en vocal Discord. Le game design s'appuie sur la conversation orale entre les joueurs. |
| **Hilarité > Compétition** | L'objectif n'est pas de gagner, c'est de faire rire. Les mécaniques poussent au chaos, aux accusations absurdes, aux dessins catastrophiques. |
| **Beauté inattendue** | L'UI doit surprendre. Pas de "game lobby générique". Chaque écran doit donner l'impression d'un produit premium, pensé par des humains, pas généré par une IA. |
| **Inclusif** | Tout le monde peut jouer : on s'en fout du talent en dessin. Les pires dessins créent les meilleurs moments. |

### Références & inspirations

- **Undercover** (le jeu de cartes) → Mécanique du mot secret / mot piège
- **Gartic Phone** → Dessin simultané en navigateur, zero friction
- **Among Us** → Tension sociale, votes, discussions
- **Skribbl.io** → Simplicité du dessin en ligne
- **Jackbox Games** → Polish, humour, expérience de salon
- **Fake Artist Goes to New York** → Même concept (dessin + imposteur) en jeu de société
- **Spyfall** → Déduction sociale par indices subtils

---

## 2. Concept Core

### Mécanique fondamentale

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   6 joueurs reçoivent le mot : "GUITARE"            │
│   1 joueur (l'Undercover) reçoit : "VIOLON"         │
│                                                     │
│   Tout le monde dessine en même temps.              │
│   Tout le monde voit les dessins des autres         │
│   en temps réel pendant la phase de dessin.         │
│   Tout le monde vote pour désigner le suspect.      │
│                                                     │
│   L'Undercover doit se fondre dans la masse.        │
│   Les Civils doivent le démasquer pour marquer      │
│   des points.                                       │
│   ...sans révéler leur propre mot.                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Pourquoi c'est drôle

1. **Le paradoxe du dessin** : Tu veux dessiner assez bien pour montrer que tu connais le mot, mais pas *trop* précisément sinon l'Undercover copie ton style.
2. **Le doute permanent** : "Attends, c'est un chat ou un chien ? Il dessine le même mot que moi ou pas ?!"
3. **Les accusations vocales** : Sur Discord, les joueurs s'accusent en direct, mentent, surjouent — c'est du théâtre improvisé.
4. **Les mauvais dessinateurs** : Quelqu'un qui dessine mal ressemble automatiquement à l'Undercover, ce qui crée des faux positifs hilarants.

### Joueurs

- **Minimum** : 4 joueurs
- **Optimal** : 6-8 joueurs  
- **Maximum** : 12 joueurs

---

## 3. Modes de jeu

### 🟢 Mode Classique — "Undercover"

Le mode de base. Un mot pour les civils, un mot proche pour l'Undercover.

| Paramètre | Valeur |
|---|---|
| Undercovers | 1 (4-6 joueurs) ou 2 (7-12 joueurs) |
| Rounds | 3-5 (configurable) |
| Timer dessin | 45s (configurable : 30s / 45s / 60s / 90s) |
| Timer vote | 30s |

**Conditions de victoire :**
- La partie se joue sur **3 à 5 rounds**, sans élimination.
- Tous les joueurs restent actifs à chaque round ; les rôles sont redistribués entre les rounds.
- Le gagnant final est le joueur avec le **plus de points** à la fin de la partie.

**Barème de points (round standard) :**
- **Civil** : `+2` s'il vote pour le bon Undercover.
- **Bonus Civil** : `+1` supplémentaire pour chaque Civil si l'Undercover est le suspect majoritaire.
- **Undercover** : `+3` s'il évite d'être le suspect majoritaire.
- **Bonus bluff** : `+1` supplémentaire pour l'Undercover si un Civil est le suspect majoritaire.

---

### 🔴 Mode "Mr. White"

En plus de l'Undercover, un joueur est **Mr. White** : il ne reçoit **aucun mot**. Il doit dessiner quelque chose de convaincant... sans savoir le sujet.

| Rôle | Ce qu'il voit |
|---|---|
| Civil | Le mot principal (ex: "Pizza") |
| Undercover | Un mot proche (ex: "Burger") |
| Mr. White | `???` — Aucun mot |

**Twist Mr. White** : S'il est le **suspect majoritaire**, il a **une dernière chance** — il peut tenter de deviner le mot des civils. S'il devine correctement, il gagne `+2` points bonus. S'il n'est pas désigné, il gagne `+2` points de discrétion.

**Distribution des rôles :**

| Joueurs | Civils | Undercovers | Mr. White |
|---|---|---|---|
| 4-5 | 3-4 | 1 | 0 |
| 6-7 | 4-5 | 1 | 1 |
| 8-10 | 5-7 | 2 | 1 |
| 11-12 | 7-8 | 2 | 2 |

---

### 🟣 Mode "Chaos" (Party Mode)

Pour les groupes qui veulent juste rigoler sans prise de tête.

- **Rounds rapides** : 20s de dessin, vote instantané par réaction emoji.
- **Mots absurdes** : Paires volontairement ridicules ("Dinosaure" vs "Poulet rôti").
- **Power-ups aléatoires** :
  - 🔄 **Swap** : Ton dessin est échangé avec celui d'un autre joueur au hasard.
  - 🎨 **Daltonien** : Tes couleurs sont inversées pour les autres.
  - 🪞 **Miroir** : Ton canvas est retourné horizontalement sans que tu le saches.
  - ⏰ **Speed Round** : 10 secondes de dessin seulement.
  - 🖌️ **Gros doigts** : Ton pinceau fait x3 la taille normale.

---

### 🟡 Mode "Imposteur Silencieux"

Variante sans vocal. Les joueurs ne parlent pas — ils communiquent uniquement par le chat textuel intégré (messages courts, 50 caractères max). Idéal pour les groupes qui ne sont pas sur Discord ou pour les streams.

---

## 4. Flow complet d'une partie

```
ÉCRAN D'ACCUEIL
      │
      ├── [ Créer une partie ] ──► LOBBY (hôte)
      │                              │
      │                              ├── Partager le lien / code
      │                              ├── Configurer les options
      │                              └── Lancer la partie
      │
      └── [ Rejoindre ] ──────────► LOBBY (invité)
                                     │
                                     ▼
                              ATTRIBUTION DES RÔLES
                              (Animation de distribution)
                                     │
                                     ▼
                    ┌────── BOUCLE DE ROUND ──────┐
                    │                              │
                    │    PHASE 1 : DESSIN          │
                    │    (Timer + canvas)          │
                    │         │                    │
                    │         ▼                    │
                    │    PHASE 2 : GALERIE FINALE   │
                    │    (Freeze des dessins)       │
                    │         │                    │
                    │         ▼                    │
                    │    PHASE 3 : DISCUSSION       │
                    │    (Timer, Discord/chat)      │
                    │         │                    │
                    │         ▼                    │
                    │    PHASE 4 : VOTE             │
                    │    (Cliquer sur un suspect)   │
                    │         │                    │
                    │         ▼                    │
                    │    PHASE 5 : RÉSOLUTION       │
                    │    (Révélation + points)      │
                    │         │                    │
                    │    Fin du round               │
                    │    ├── Dernier ? → ÉCRAN FINAL│
                    │    └── Sinon → Round suivant  │
                    │                              │
                    └──────────────────────────────┘
                                     │
                                     ▼
                              ÉCRAN DE FIN
                              (Stats, replay, rejouer)
```

### Détail de chaque phase

#### Phase 1 — Dessin (30-90s)

- Chaque joueur voit **son mot** en haut de l'écran (ou `???` pour Mr. White).
- Canvas de dessin au centre avec outils (voir section Système de dessin).
- Les autres dessins sont visibles **en temps réel** dans des mini-canvases live : on voit les traits apparaître au fur et à mesure.
- **Timer circulaire** autour de l'avatar du joueur — visuellement satisfaisant, crée l'urgence.
- **Indicateur "En train de dessiner..."** : Les avatars des autres joueurs ont une petite animation de crayon qui bouge quand ils dessinent activement. Ça crée de la tension — "lui il dessine vite, il sait ce qu'il fait ?" ou "elle a pas commencé, elle est paumée ?".
- **Les 5 dernières secondes** : Le timer passe en rouge, un son de tick-tock accélère, léger shake du canvas.
- **Fin du timer** : Les crayons se lèvent, animation de "pose tes crayons" satisfaisante.

#### Phase 2 — Galerie finale (10-15s auto, extensible)

- Les dessins se figent dans leur état final et passent en grille au centre de l'écran.
- Chaque dessin est associé à l'avatar et au pseudo du joueur.
- Les joueurs peuvent **zoomer** sur un dessin en cliquant dessus (lightbox).
- **Réactions rapides** : Les joueurs peuvent envoyer des émojis-réactions sur les dessins (😂 🤔 🎨 💀 👀). Ces réactions apparaissent en overlay sur le dessin comme des bulles qui pop.
- Transition automatique vers la discussion après 10s, avec un bouton "Prêt" pour accélérer si tout le monde a vu.

#### Phase 3 — Discussion (30-60s, configurable)

- Les dessins restent visibles en miniature sur les côtés.
- Un grand timer central avec une animation liquide/organique.
- **Chat textuel** disponible en plus du Discord (pour les moments "regarde son dessin !!!" avec un lien cliquable vers le dessin).
- **Système de "Point du doigt"** : Chaque joueur peut pointer un autre joueur en temps réel (pas un vote, juste un indicateur visuel). Ça crée de la pression sociale et c'est drôle de voir tout le monde pointer quelqu'un en même temps.
- Tous les joueurs restent actifs jusqu'à la fin de la partie : pas de spectateur lié au vote.

#### Phase 4 — Vote (20-30s)

- Les dessins sont toujours visibles.
- Interface de vote : les avatars des joueurs sont disposés en **cercle** au centre de l'écran (comme une table ronde).
- Pour voter, tu **cliques/tapes sur l'avatar** du joueur que tu suspectes.
- Ton vote est **secret** jusqu'à la fin du timer.
- Tu peux **changer ton vote** tant que le timer tourne.
- Option : **Vote blanc** (tu ne votes pour personne — si tu es vraiment perdu).
- **Animation de reveal des votes** : Les votes sont révélés un par un avec un drumroll. Chaque vote apparaît comme une flèche colorée partant du votant vers sa cible. Tension maximale.
- **Égalité** : Personne n'est désigné comme suspect majoritaire. Le round passe quand même en résolution, avec points de discrétion pour l'Undercover.

#### Phase 5 — Résolution & Points

- Le **suspect majoritaire** est mis en lumière (spotlight animation), mais personne ne quitte la partie.
- **Moment de tension** : "Est-ce que c'était vraiment l'Undercover ?"
- Animation de retournement de carte : le rôle du suspect majoritaire est révélé.
- Le vrai **Undercover du round** est ensuite révélé, puis un panneau de score affiche les points gagnés par chacun.
  - ✅ **Le suspect majoritaire était l'Undercover** → Confettis, fanfare, bonus civils.
  - ❌ **Le suspect majoritaire était un Civil** → Son grave, l'écran tremble légèrement, l'Undercover gagne ses points de bluff.
  - 💀 **Le suspect majoritaire était Mr. White** → Effet spécial unique, puis il a sa chance de deviner le mot pour un bonus.
- Tous les joueurs restent dans la partie ; les rôles sont redistribués au round suivant.

---

## 5. Système de mots

### Philosophie des paires

Les paires de mots doivent respecter un **équilibre subtil** :
- Assez proches pour que les dessins se ressemblent (sinon c'est trop facile de trouver l'Undercover).
- Assez différents pour qu'un œil attentif repère les nuances.
- Idéalement drôles ou créant des situations absurdes.

### Catégories de paires

#### 🍕 Nourriture
| Mot Civil | Mot Undercover | Difficulté | Pourquoi c'est drôle |
|---|---|---|---|
| Pizza | Galette | ⭐⭐ | Les deux sont ronds et plats |
| Sushi | Onigiri | ⭐⭐⭐ | Presque le même ingrédient |
| Croissant | Bretzel | ⭐⭐ | Formes similaires en dessin |
| Hamburger | Sandwich | ⭐ | Très proche visuellement |
| Glace (cornet) | Cupcake | ⭐⭐ | Formes coniques similaires |
| Spaghetti | Ramen | ⭐⭐⭐ | Des nouilles sont des nouilles |
| Baguette | Bâton de pain | ⭐⭐⭐ | Quasi identique |
| Pancake | Crêpe | ⭐⭐⭐ | La différence est culturelle |
| Donut | Bagel | ⭐⭐ | Même forme, contexte différent |
| Popcorn | Céréales | ⭐⭐ | Petits trucs dans un bol |

#### 🐾 Animaux
| Mot Civil | Mot Undercover | Difficulté | Pourquoi c'est drôle |
|---|---|---|---|
| Chat | Tigre | ⭐ | Même forme, taille différente |
| Chien | Loup | ⭐⭐ | Presque pareil en dessin |
| Pingouin | Canard | ⭐⭐ | Oiseaux noirs et blancs |
| Tortue | Escargot | ⭐⭐ | Maison sur le dos |
| Requin | Dauphin | ⭐ | Aileron + eau |
| Abeille | Guêpe | ⭐⭐⭐ | Quasi impossible à distinguer |
| Crocodile | Lézard | ⭐⭐ | Reptiles allongés |
| Panda | Ours | ⭐⭐ | Le même animal en gros |
| Papillon | Libellule | ⭐⭐ | Insectes ailés |
| Pieuvre | Méduse | ⭐⭐ | Trucs mous dans l'eau |

#### 🏠 Objets du quotidien
| Mot Civil | Mot Undercover | Difficulté |
|---|---|---|
| Chaise | Tabouret | ⭐⭐ |
| Vélo | Trottinette | ⭐ |
| Lunettes | Jumelles | ⭐⭐ |
| Parapluie | Parasol | ⭐⭐⭐ |
| Guitare | Violon | ⭐⭐ |
| Téléphone | Télécommande | ⭐⭐ |
| Bougie | Lampe | ⭐ |
| Épée | Couteau | ⭐⭐ |
| Clé | Serrure | ⭐⭐ |
| Livre | Tablette | ⭐⭐ |

#### 🌍 Lieux & Bâtiments
| Mot Civil | Mot Undercover | Difficulté |
|---|---|---|
| Tour Eiffel | Statue de la Liberté | ⭐ |
| Pyramide | Montagne | ⭐⭐ |
| Hôpital | Pharmacie | ⭐⭐⭐ |
| École | Prison | ⭐⭐ |
| Plage | Désert | ⭐⭐ |
| Château | Église | ⭐⭐ |
| Piscine | Lac | ⭐⭐ |
| Fusée | Avion | ⭐ |
| Stade | Cirque | ⭐⭐ |
| Cinéma | Théâtre | ⭐⭐⭐ |

#### 🎮 Pop Culture & Internet (pour la gen Z)
| Mot Civil | Mot Undercover | Difficulté |
|---|---|---|
| Mario | Sonic | ⭐ |
| Batman | Zorro | ⭐⭐ |
| Pikachu | Raichu | ⭐⭐⭐ |
| Minecraft | Roblox | ⭐⭐ |
| TikTok | Instagram | ⭐⭐ |
| Fortnite | PUBG | ⭐⭐⭐ |
| Naruto | Goku | ⭐ |
| Shrek | Hulk | ⭐⭐ |
| SpongeBob | Patrick | ⭐⭐ |
| Thanos | Méchant générique | ⭐⭐⭐ |

#### 🤪 Concepts abstraits (Chaos Mode)
| Mot Civil | Mot Undercover | Difficulté |
|---|---|---|
| Amour | Amitié | ⭐⭐⭐ |
| Lundi | Vendredi | ⭐⭐ |
| Bruit | Silence | ⭐⭐⭐ |
| Rêve | Cauchemar | ⭐⭐ |
| Chaud | Froid | ⭐ |
| Hier | Demain | ⭐⭐⭐ |
| Chance | Malchance | ⭐⭐⭐ |
| Vie | Mort | ⭐⭐ |
| Rich | Pauvre | ⭐⭐ |
| Été | Hiver | ⭐ |

### Système de difficulté

L'hôte peut choisir la difficulté globale :
- **Facile** (⭐) : Mots très visuels, paires éloignées. Pour les nouveaux joueurs.
- **Normal** (⭐⭐) : Équilibre entre défi et fun.
- **Difficile** (⭐⭐⭐) : Paires très proches, mots abstraits. Pour les vétérans.
- **Aléatoire** : Mix de toutes les difficultés — le plus fun en général.

### Mots personnalisés

L'hôte peut créer ses propres paires de mots dans le lobby. Interface simple :
```
Mot principal : [__________]
Mot piège :     [__________]
```
Les paires custom sont mélangées avec les paires de base.

---

## 6. Direction artistique

### Identité visuelle — "Néon Noir Ludique"

Le jeu vit dans un univers visuel à mi-chemin entre un **bar à cocktails underground** et un **flipper arcade des années 80**. Sombre mais jamais austère, coloré mais jamais criard.

### Palette de couleurs

```
FOND PRINCIPAL
─────────────────────────────────
#0A0A0F    Noir profond (quasi-noir bleuté)
#12121A    Fond des cartes/panneaux
#1A1A2E    Fond secondaire (surfaces élevées)

ACCENT PRIMAIRE — VIOLET ÉLECTRIQUE
─────────────────────────────────
#7B2FFF    Violet principal (CTAs, highlights)
#9D5CFF    Violet clair (hover states)
#5A1FCC    Violet foncé (pressed states)
#7B2FFF15  Violet très transparent (glows, halos)

ACCENT SECONDAIRE — CYAN NÉON
─────────────────────────────────
#00F0FF    Cyan néon (accents, badges)
#00C4CC    Cyan moyen (texte secondaire)
#00F0FF20  Cyan glow (effets de lumière)

ACCENT TERTIAIRE — ROSE VIF
─────────────────────────────────
#FF2D78    Rose vif (alertes, urgence, danger)
#FF5C9A    Rose clair (hover)
#FF2D7815  Rose glow

SUCCÈS / POSITIF
─────────────────────────────────
#00FF88    Vert néon (victoire, correct)
#00CC6A    Vert moyen

TEXTE
─────────────────────────────────
#EEEEF2    Blanc cassé (texte principal)
#8888AA    Gris lavande (texte secondaire)
#555577    Gris foncé (texte désactivé)
```

### Typographie

```
TITRES / DISPLAY
─────────────────────────────────
Font :      "Clash Display" (gratuite sur Fontshare)
Fallback :  "Satoshi", sans-serif
Usage :     Titres, noms de phase, écran de fin
Style :     Bold / Semibold
Tracking :  -0.02em (serré, impactant)

CORPS / UI
─────────────────────────────────
Font :      "General Sans" (gratuite sur Fontshare)
Fallback :  "DM Sans", sans-serif
Usage :     Boutons, labels, chat, descriptions
Style :     Regular / Medium
Tracking :  0

MONO / CODES
─────────────────────────────────
Font :      "JetBrains Mono"
Usage :     Code de room, timers, stats
```

### Effets visuels signature

1. **Glow néon subtil** : Les éléments interactifs émettent une lueur douce de leur couleur. Pas un néon criard — un halo subtil, comme une LED derrière du verre dépoli.

2. **Grain de film** : Un overlay de grain très léger (opacité 3-5%) sur tout l'écran, animé subtilement. Ça casse le côté "trop propre" du digital et ajoute de la texture.

3. **Glassmorphism maîtrisé** : Les panneaux utilisent un fond semi-transparent avec backdrop-blur. Pas le glassmorphism générique de 2021 — plus subtil, plus sombre, avec des bordures fines lumineuses.

4. **Particules ambiantes** : De minuscules particules flottent lentement en arrière-plan (comme de la poussière dans un rayon de lumière). Très subtil, presque subliminal. Ajoute de la vie sans distraire.

5. **Transitions fluides** : Chaque changement de phase utilise une transition custom. Pas de fade générique — des mouvements directionnels, des reveals par masque, des effets de scale satisfaisants.

### Personnages / Avatars

Le jeu n'utilise pas de photos de profil — chaque joueur choisit un **avatar stylisé** dans le lobby.

**Style des avatars :**
- Formes géométriques simples (cercle, carré arrondi, hexagone, losange)
- Couleur unie vive choisie par le joueur
- Un **emoji/icône** au centre choisi par le joueur (🦊 👻 🎭 💀 🌙 🔥 🍕 🎮 etc.)
- L'avatar a une **bordure lumineuse** de sa couleur (effet glow)
- En jeu, l'avatar pulse doucement — il "respire"

**Avatars des rôles (visibles seulement par le joueur)** :
- Civil : badge vert discret ✓
- Undercover : badge rouge avec un masque 🎭
- Mr. White : badge blanc avec un "?" clignotant

---

## 7. UI/UX — Écran par écran

### 7.1 — Écran d'accueil

```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│            ╔══════════════════╗               │
│            ║    INKOGNITO     ║               │
│            ╚══════════════════╝               │
│          Draw. Suspect. Betray.              │
│                                              │
│                                              │
│        ┌──────────────────────┐              │
│        │  ▶  Créer une partie │              │
│        └──────────────────────┘              │
│                                              │
│        ┌──────────────────────┐              │
│        │  🔗  Rejoindre       │              │
│        └──────────────────────┘              │
│                                              │
│                                              │
│   ┌─────────┐                                │
│   │ Comment  │    v1.0                       │
│   │ jouer ?  │                               │
│   └─────────┘                                │
│                                              │
└──────────────────────────────────────────────┘
```

**Détails UX :**
- Le logo "INKOGNITO" est rendu en **lettres 3D** avec un effet de profondeur et de lumière néon violette. La lettre "O" est remplacée par un masque stylisé (🎭).
- L'arrière-plan est animé : un **dégradé mesh** sombre qui se déplace lentement (comme de la lave au ralenti), avec les particules ambiantes.
- "Créer une partie" est le CTA principal — gros bouton violet avec glow, légère animation de pulse.
- "Rejoindre" est secondaire — bouton outline, apparaît quand on a un code.
- "Comment jouer ?" ouvre un **modal tutoriel** avec des illustrations animées (pas du texte — des mini-animations qui montrent le flow en 4 étapes).
- **Easter egg** : Si tu cliques 5 fois sur le logo, les lettres se mélangent et font un petit dance.
- **Sur mobile** : Le layout est vertical, les boutons prennent toute la largeur, le logo est plus compact.

### 7.2 — Rejoindre une partie

Quand le joueur clique "Rejoindre" :

```
┌──────────────────────────────────────────────┐
│                                              │
│          Rejoindre une partie                │
│                                              │
│     ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│     │  │ │  │ │  │ │  │ │  │ │  │          │
│     └──┘ └──┘ └──┘ └──┘ └──┘ └──┘         │
│                                              │
│     OU colle le lien de la partie            │
│     ┌──────────────────────────┐             │
│     │ https://inkognito.gg/... │             │
│     └──────────────────────────┘             │
│                                              │
│        ┌──────────────────────┐              │
│        │     Rejoindre ▶      │              │
│        └──────────────────────┘              │
│                                              │
└──────────────────────────────────────────────┘
```

- **Code à 6 caractères** : Chaque case est un input individuel (comme un code 2FA). Auto-focus sur la case suivante. Supprimer revient en arrière.
- **Coller un lien** : Le champ détecte automatiquement si c'est un lien inkognito et en extrait le code.
- **Feedback instantané** : Si le code est valide, le bouton passe au vert et le joueur rejoint directement. Si invalide, shake animation + message d'erreur.
- **Raccourci Discord** : Le lien partagé sur Discord a un **embed riche** avec le nombre de joueurs dans le lobby et un bouton "Rejoindre".

### 7.3 — Lobby

C'est ici que la magie sociale commence. Le lobby doit être un espace où les joueurs s'amusent déjà AVANT que la partie ne commence.

```
┌──────────────────────────────────────────────┐
│  Code: XK4F2P  [📋 Copier]  [🔗 Partager]   │
│──────────────────────────────────────────────│
│                                              │
│  Joueurs (5/8)                               │
│                                              │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐    │
│  │ 🦊 │  │ 👻 │  │ 🎮 │  │ 💀 │  │ 🔥 │    │
│  │Alex │  │Yuki │  │Max │  │Luna│  │ ? │    │
│  │HOST │  │    │  │    │  │    │  │    │    │
│  └────┘  └────┘  └────┘  └────┘  └────┘    │
│                                              │
│  ┌──────────── Paramètres ─────────────┐     │
│  │ Mode :     [Classique ▼]            │     │
│  │ Timer :    [45 secondes ▼]          │     │
│  │ Rounds :   [3 ▼]                   │     │
│  │ Difficulté:[Aléatoire ▼]           │     │
│  │ Mots custom : [+ Ajouter]          │     │
│  └─────────────────────────────────────┘     │
│                                              │
│        ┌──────────────────────┐              │
│        │  🚀  LANCER LA PARTIE │             │
│        └──────────────────────┘              │
│  (visible uniquement par l'hôte)             │
│                                              │
│  ┌── Mini-chat ──────────────────────┐       │
│  │ Alex: on attend qui ?             │       │
│  │ Yuki: 2 sec mon frère arrive      │       │
│  │ [________________________] [Envoyer]      │
│  └───────────────────────────────────┘       │
│                                              │
└──────────────────────────────────────────────┘
```

**Détails UX :**

- **Code de room** : Affiché en gros, police mono, facile à dicter. Bouton copier avec feedback (✓ Copié !). Bouton partager ouvre le share sheet natif (mobile) ou copie le lien (desktop).
- **Avatars des joueurs** : Disposés en arc/cercle. Quand un nouveau joueur rejoint, son avatar **apparaît avec une animation de "pop"** + un petit son satisfaisant. Les avatars idle font une micro-animation de bounce aléatoire.
- **Personnalisation** : En cliquant sur son propre avatar, le joueur peut changer son emoji, sa couleur, et son pseudo (input inline, pas de modal).
- **Paramètres** : Seulement visibles/modifiables par l'hôte. Les autres joueurs voient les paramètres en read-only avec un label "Choisi par l'hôte".
- **Mini-chat** : Intégré en bas du lobby. Messages courts uniquement. Les messages restent dans le lobby et ne suivent pas en jeu.
- **"Prêt" toggle** : Chaque joueur peut se marquer "Prêt" en cliquant sur son avatar. Un cercle de progression vert apparaît autour. L'hôte ne peut lancer que quand minimum 4 joueurs sont prêts.
- **Quitter** : Bouton discret en haut à gauche. Si l'hôte quitte, un autre joueur devient hôte automatiquement.
- **Easter egg lobby** : Si un joueur tape "gg" dans le chat, des confettis tombent sur son avatar.

### 7.4 — Distribution des rôles

L'un des moments les plus importants du jeu. La distribution doit créer du **suspense et de l'excitation**.

**Séquence d'animation (3-4 secondes) :**

1. L'écran s'assombrit. Les avatars de tous les joueurs flottent au centre en cercle.
2. Des "cartes" apparaissent face cachée au centre du cercle — une par joueur. Elles tournent/flottent.
3. Chaque carte vole vers un joueur (animation fluide).
4. **Ta carte** se retourne devant toi avec un flip 3D satisfaisant.
5. Tu vois TON rôle :
   - **Civil** : Fond vert foncé, mot affiché en grand, icône ✓
   - **Undercover** : Fond rouge foncé, mot affiché en grand, icône 🎭 + message "Tu es l'Undercover. Fonds-toi dans la masse."
   - **Mr. White** : Fond blanc pur (contraste brutal avec le thème sombre), icône ❓ + message "Tu es Mr. White. Tu ne sais rien. Bonne chance."

**Important** : L'animation est la même pour tous les joueurs (pas de timing différent qui pourrait leak le rôle). Les autres joueurs voient juste leur propre carte se retourner — ils ne voient pas les cartes des autres.

**"Mémoriser" et "Continuer"** : Le joueur a le temps de lire son mot, puis clique "C'est parti" pour confirmer qu'il a compris. Le jeu attend que TOUS les joueurs aient confirmé.

### 7.5 — Écran de dessin (Phase 1)

Le cœur du jeu. C'est ici que tout se joue.

```
┌──────────────────────────────────────────────────────────┐
│  ROUND 1/3          TON MOT : GUITARE          ⏱ 0:38  │
│──────────────────────────────────────────────────────────│
│                                                          │
│  ┌─ Joueurs ──┐    ┌──────────────────────────────┐     │
│  │            │    │                              │     │
│  │  🦊 Alex   │    │                              │     │
│  │  ✏️ ...     │    │                              │     │
│  │            │    │        TON CANVAS             │     │
│  │  👻 Yuki   │    │                              │     │
│  │  ✏️ ...     │    │                              │     │
│  │            │    │     (zone de dessin)          │     │
│  │  🎮 Max    │    │                              │     │
│  │  ✏️ ...     │    │                              │     │
│  │            │    │                              │     │
│  │  💀 Luna   │    │                              │     │
│  │  💤 idle   │    │                              │     │
│  │            │    │                              │     │
│  └────────────┘    └──────────────────────────────┘     │
│                                                          │
│  ┌── Outils ─────────────────────────────────────┐      │
│  │ ✏️  🖌️  ⬜  🔵  🟢  🔴  ⬛  🎨  ↩️  🗑️       │      │
│  │ Taille: ●───────○                              │     │
│  └───────────────────────────────────────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Layout desktop :**
- Le canvas prend ~60% de l'espace au centre.
- La colonne de gauche montre qui dessine activement, avec une **miniature live basse résolution** de chaque canvas.
- Le mot est affiché en haut, toujours visible mais pas intrusif.
- Le timer est en haut à droite avec un cercle de progression.
- Les outils de dessin sont en bas dans une barre horizontale.

**Layout mobile :**
- Le canvas prend tout l'écran.
- Le mot est en haut dans une barre fine.
- Les outils sont dans un dock en bas, scrollable horizontalement.
- Les autres joueurs sont visibles dans un overlay compact à gauche, avec miniatures live accessibles en swipant.
- Le timer est en haut à droite, compact.

### 7.6 — Galerie finale (Phase 2)

```
┌──────────────────────────────────────────────────────────┐
│              GALERIE — Regardez bien...            ⏱ 12  │
│──────────────────────────────────────────────────────────│
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │          │  │          │  │          │              │
│  │  🦊 Alex │  │  👻 Yuki │  │  🎮 Max  │              │
│  │  [dessin]│  │  [dessin]│  │  [dessin]│              │
│  │          │  │          │  │          │              │
│  │ 😂 👀    │  │ 🤔       │  │ 💀 😂 😂 │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────┐  ┌──────────┐                             │
│  │          │  │          │                             │
│  │  💀 Luna │  │  🔥 Sam  │                             │
│  │  [dessin]│  │  [dessin]│                             │
│  │          │  │          │                             │
│  │ 🎨       │  │ 👀 🤔    │                             │
│  └──────────┘  └──────────┘                             │
│                                                          │
│            [ ✅ Prêt pour le vote ] (4/5)                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Détails UX :**
- Les dessins se figent dans leur version finale puis apparaissent un par un avec un léger stagger (décalage de 200ms entre chaque), comme un arrêt sur image du live.
- **Cliquer sur un dessin** = zoom plein écran (lightbox avec fond noir). Swipe gauche/droite pour naviguer entre les dessins.
- **Réactions** : Les joueurs cliquent sur des emojis rapides qui flottent au-dessus du dessin en question. Les réactions sont visibles par tous en temps réel.
- **Animations des réactions** : Les emojis pop comme des bulles — scale up + fade out avec un léger bounce. Son subtil à chaque réaction.
- **Responsive** : Sur mobile, la galerie est une grille 2 colonnes scrollable. Les réactions sont accessibles via long press.

### 7.7 — Écran de vote (Phase 4)

```
┌──────────────────────────────────────────────────────────┐
│           QUI EST L'UNDERCOVER ?                   ⏱ 22 │
│──────────────────────────────────────────────────────────│
│                                                          │
│                    ┌────┐                                │
│              ┌────┐│ 👻 │┌────┐                          │
│              │ 🦊 ││Yuki││ 🎮 │                          │
│              │Alex │└────┘│Max │                          │
│              └────┘       └────┘                          │
│                                                          │
│          ┌────┐              ┌────┐                      │
│          │ 💀 │              │ 🔥 │                      │
│          │Luna│              │Sam │                      │
│          └────┘              └────┘                      │
│                                                          │
│   ┌──────── Dessins en miniature ────────┐              │
│   │ [mini1] [mini2] [mini3] [mini4] [mini5]             │
│   └──────────────────────────────────────┘              │
│                                                          │
│           Clique sur le joueur que tu suspectes          │
│                                                          │
│   Vote actuel : 🔥 Sam    [ Changer ]                   │
│                                                          │
│          ──── ou ────                                    │
│   [ 🤷 Vote blanc — je sais vraiment pas ]              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Détails UX :**
- Les avatars sont en cercle (table ronde).
- **Hover** sur un avatar : son dessin apparaît en popup à côté (rappel visuel).
- **Cliquer** = voter. L'avatar sélectionné reçoit un ring lumineux de ta couleur.
- Tu ne vois PAS les votes des autres tant que le timer tourne.
- **Changer de vote** : Tu peux re-cliquer un autre avatar tant que le timer n'est pas fini.
- **Miniatures des dessins** en bas pour référence.

**Reveal des votes — L'animation la plus importante du jeu :**

1. L'écran se fige. Drumroll (son de tambour qui accélère).
2. Les votes sont révélés un par un : une **flèche lumineuse** part de chaque votant vers sa cible.
3. Chaque flèche a la couleur de l'avatar du votant.
4. Pause dramatique après la dernière flèche.
5. Le joueur avec le plus de votes est **mis en lumière** (spotlight).
6. Transition vers la **résolution du round** et l'affichage des points.

### 7.8 — Écran de résolution (Phase 5)

Le suspect majoritaire est au centre. Son avatar grossit, mais personne ne sort de la partie.

**Animation de retournement :**
- La "carte de rôle" apparaît face cachée au-dessus de l'avatar.
- Elle se retourne avec un flip 3D (effet de reflet lumineux sur la carte pendant le flip).
- Le résultat apparaît, puis le panneau des points du round slide in.

**Si le suspect majoritaire était l'Undercover :**
- Confettis, particules dorées, flash de lumière.
- Le tableau de score affiche immédiatement quels joueurs ont gagné `+2`, ainsi que le bonus Civil.
- Le mot civil et le mot Undercover du round sont révélés côte à côte.
- Son de fanfare/victoire satisfaisant.

**Si le suspect majoritaire était un Civil :**
- L'écran tremble légèrement (screen shake subtil).
- Le panneau de score met en avant les points de bluff de l'Undercover et les éventuels civils qui avaient quand même bien voté.
- Le mot du vrai Undercover est révélé pour clôturer proprement le round.
- Son grave, ambiance tendue.
- L'Undercover voit un petit message privé : "Tu les as embrouillés. +3 bluff. 😏"

**Mr. White — Dernière chance :**
- Si Mr. White est le suspect majoritaire, un champ de réponse apparaît immédiatement : "Quel était le mot des Civils ?"
- Il a `15 secondes` pour répondre.
- S'il a bon → il gagne `+2` points bonus avec une animation spéciale (explosion de blanc pur, tout l'écran flash).
- S'il a faux → le round se termine normalement, sans sortie de joueur.

### 7.9 — Écran de fin de partie

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              🏆 FIN DE PARTIE                            │
│                                                          │
│  ┌── Résultats ──────────────────────────────────┐      │
│  │                                                │      │
│  │  🥇 Luna — 18 pts (Civil MVP)                  │      │
│  │  🥈 Alex — 16 pts (Undercover légendaire)      │      │
│  │  🥉 Max — 13 pts                               │      │
│  │  👀 Yuki — 11 pts (souvent accusé à tort)      │      │
│  │  🤡 Sam — 8 pts (a voté blanc 2 fois)          │      │
│  │                                                │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  ┌── Awards ──────────────────────────────────────┐      │
│  │ 🎨 Meilleur dessinateur : Luna                 │      │
│  │ 🤡 Pire dessinateur : Sam                      │      │
│  │ 🕵️ Meilleur détective : Max                    │      │
│  │ 🎭 Meilleur menteur : Alex                     │      │
│  │ 🐑 Mouton du groupe : Yuki (a toujours suivi)  │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  ┌── Galerie complète ────────────────────────────┐      │
│  │ [Voir tous les dessins de la partie]            │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  ┌───────────────┐   ┌─────────────────────┐            │
│  │  🔄 Rejouer   │   │  📸 Partager (image) │            │
│  └───────────────┘   └─────────────────────┘            │
│                                                          │
│  ┌───────────────────────────────┐                       │
│  │  🏠  Retour au lobby          │                       │
│  └───────────────────────────────┘                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Détails :**

- **Awards automatiques** calculés sur les stats de la partie :
  - 🎨 **Meilleur dessinateur** : Le joueur qui a reçu le plus de réactions 🎨.
  - 🤡 **Pire dessinateur** : Le plus de réactions 💀 — c'est un honneur, pas une insulte.
  - 🕵️ **Meilleur détective** : A voté correctement le plus de fois.
  - 🎭 **Meilleur menteur** : A marqué le plus de points en tant qu'Undercover.
  - 🐑 **Mouton** : A toujours voté comme la majorité — suiveur.
  - 🎯 **Sniper** : A trouvé l'Undercover dès le premier vote.
  - 😱 **Bouc émissaire** : A été accusé à tort le plus souvent.

- **Galerie complète** : Tous les dessins de tous les rounds, organisés chronologiquement. Les mots civil/undercover sont révélés à côté de chaque dessin.

- **Partager** : Génère une image récap (comme les Spotify Wrapped) avec le podium, les awards, et les meilleurs dessins. Optimisée pour être partagée sur Discord/Twitter/Instagram Stories.

- **Rejouer** : Renvoie au lobby avec les mêmes joueurs. Les paramètres sont conservés.

---

## 8. Système de dessin

### Outils disponibles

| Outil | Icône | Description | Raccourci |
|---|---|---|---|
| Crayon | ✏️ | Trait fin, bords nets. Outil par défaut. | `P` |
| Pinceau | 🖌️ | Trait doux, bords lissés. Plus expressif. | `B` |
| Gomme | ◻️ | Efface les traits. | `E` |
| Remplissage | 🪣 | Remplit une zone fermée. | `F` |
| Forme — Cercle | ⭕ | Dessine un cercle/ellipse. | `C` |
| Forme — Carré | ⬜ | Dessine un rectangle. | `R` |
| Forme — Ligne | ➖ | Trace une ligne droite. | `L` |
| Annuler | ↩️ | Annule la dernière action. | `Ctrl+Z` |
| Rétablir | ↪️ | Rétablit l'action annulée. | `Ctrl+Y` |
| Tout effacer | 🗑️ | Vide le canvas (confirmation requise). | — |

### Palette de couleurs

16 couleurs prédéfinies, pas de color picker custom (volontairement — ça force la simplicité et la rapidité) :

```
Rangée 1 (couleurs de base) :
⬛ Noir    🟤 Marron   🔴 Rouge    🟠 Orange
🟡 Jaune   🟢 Vert     🔵 Bleu     🟣 Violet

Rangée 2 (variantes claires + neutres) :
⬜ Blanc   🩶 Gris     🩷 Rose     🧡 Pêche
🍋 Jaune c. 💚 Vert c.  🩵 Bleu c.  🪻 Lavande
```

### Taille du pinceau

Slider continu (3 tailles prédéfinies + slider libre) :
- **S** (2px) — détails fins
- **M** (8px) — usage général
- **L** (20px) — remplissage rapide

### Canvas

- **Résolution** : 600×600px (carré, identique pour tous).
- **Fond** : Blanc pur (#FFFFFF) — contraste maximal.
- **Bordure** : Arrondie (border-radius: 12px), ombre douce.
- **Rendu** : Canvas HTML5, 60fps, pressure sensitivity si disponible (tablette/stylet).
- **Diffusion live** : Les autres joueurs reçoivent un flux basse résolution reconstruit trait par trait pendant la phase de dessin.
- **Anti-aliasing** : Activé pour des traits propres.

### Interactions tactiles (mobile)

- **Un doigt** = dessiner
- **Deux doigts** = pinch-to-zoom sur le canvas
- **Double tap** = annuler
- **Long press** = pipette (sélectionner la couleur d'un pixel existant)
- **Shake** = tout effacer (avec confirmation vibratoire)

---

## 9. Système de vote

### Mécanique de vote

- **Vote secret** : Personne ne voit les votes des autres pendant le timer.
- **Vote obligatoire** : Le timer force un vote (vote blanc si pas de sélection).
- **Changement de vote** : Autorisé tant que le timer tourne.
- **Vote pour soi** : Interdit (le bouton est désactivé pour ton propre avatar).

### Résolution des votes

- **Majorité simple** : Le joueur avec le plus de votes est désigné comme **suspect majoritaire**.
- **Révélation de round** : Le rôle du suspect majoritaire puis le vrai Undercover sont révélés, et les points sont distribués.
- **Égalité** : Personne n'est désigné. Message "Le village n'a pas su se décider...". L'Undercover prend ses points de discrétion et le round se clôture.
- **Unanimité** : Si TOUS les joueurs votent pour la même personne, animation spéciale "Unanime !" avec applaudissements.

### Statistiques de vote (visibles en fin de partie)

- Qui a voté pour qui à chaque round.
- "Taux de précision" de chaque joueur.
- "Alliances" : Joueurs qui ont souvent voté de la même façon.

---

## 10. Game Feel & Micro-interactions

Les micro-interactions sont ce qui transforme un jeu correct en un jeu **addictif**. Chaque action du joueur doit avoir un feedback visuel + sonore.

### Catalogue des micro-interactions

| Action | Feedback visuel | Feedback sonore |
|---|---|---|
| Rejoindre le lobby | Avatar pop-in avec bounce | "Pop" satisfaisant |
| Se marquer "Prêt" | Ring vert autour de l'avatar + ✓ | Click doux |
| Recevoir sa carte de rôle | Flip 3D de carte | Whoosh + reveal |
| Commencer à dessiner | Premier trait laisse une traînée de particules (1 seule fois, subtil) | Scratch de crayon |
| Chaque trait de dessin | — | Son de crayon très subtil (désactivable) |
| Timer < 10s | Timer passe rouge, pulse | Tick-tock qui accélère |
| Timer = 0 | Flash blanc, canvas se fige | Buzzer doux |
| Galerie reveal | Dessins apparaissent en stagger | Swoosh par dessin |
| Envoyer une réaction | Emoji bounce + scale | Pop bulle |
| Recevoir une réaction | Emoji flotte au-dessus de ton dessin | Notification subtile |
| Voter pour quelqu'un | Ring de ta couleur autour de l'avatar | Click satisfaisant |
| Changer de vote | Ancien ring disparaît, nouveau apparaît | Swipe |
| Reveal d'un vote | Flèche lumineuse animée | Drumroll individuel |
| Révélation correcte | Confettis + flash | Fanfare / Ta-da ! |
| Révélation ratée | Screen shake + darkening | Son grave, suspense |
| Mr. White guess correct | Flash blanc total, explosion | Boom triomphant |
| Mr. White guess incorrect | Fondu vers noir | Bzzzt (échec) |
| Fin de partie | Podium avec stagger + awards | Musique de victoire |
| Cliquer "Rejouer" | Transition fluide vers lobby | Whoosh |

### Animation de transition entre phases

Chaque changement de phase utilise une transition custom :

- **Vers le dessin** : L'écran se "déroule" comme un parchemin qui s'ouvre, révélant le canvas blanc.
- **Vers la galerie** : Les dessins "volent" depuis les coins de l'écran vers leurs positions dans la grille.
- **Vers le vote** : Les dessins shrinkent en miniatures et les avatars grandissent, se plaçant en cercle.
- **Vers la résolution** : Spotlight progressif — tout s'assombrit sauf le suspect majoritaire.
- **Vers la fin** : Rideau qui se ferme puis se rouvre sur l'écran de résultats.

---

## 11. Système audio

### Philosophie audio

L'audio doit être **minimal mais impactant**. Pas de musique de fond constante (les joueurs sont sur Discord en vocal). Les sons sont des ponctuations : ils soulignent les moments clés sans envahir.

### Sound design

| Catégorie | Style | Volume relatif |
|---|---|---|
| UI (clics, hovers) | Soft, digital, satisfaisant (comme les sons iOS) | 30% |
| Transitions | Swoosh, whoosh — aériens et fluides | 50% |
| Timer warnings | Ticks progressifs, tension crescendo | 60% |
| Révélations | Dramatiques mais courts — drumroll, fanfare, crash | 80% |
| Réactions sociales | Pops, bulles, petits sons joyeux | 40% |
| Feedback négatif | Graves, courts, pas punitifs — "bzzzt" pas "ERREUR" | 50% |

### Contrôle du volume

- **Master volume** : Slider global dans les settings.
- **Volume SFX** : Séparé du master.
- **Mute rapide** : Bouton mute en un clic dans le header (icône 🔇/🔊).
- **Son des dessins** : Toggle séparé pour les sons de crayon (certains trouvent ça ASMR, d'autres irritant).

---

## 12. Fonctionnalités sociales

### Système de réactions

Réactions disponibles (pendant la galerie ET pendant la discussion) :

| Emoji | Signification implicite |
|---|---|
| 😂 | "C'est trop drôle" |
| 🤔 | "Hmm, suspect..." |
| 🎨 | "Beau dessin" |
| 💀 | "C'est catastrophique (affectueusement)" |
| 👀 | "Je te regarde..." |
| 🧠 | "200 IQ play" |
| 🤡 | "T'es un clown" |
| 🔥 | "Chaud, chaud, chaud" |

### Système de "Point du doigt"

Pendant la phase de discussion :
- Chaque joueur peut pointer un autre joueur en cliquant sur son avatar.
- Un **doigt accusateur animé** apparaît, partant de ton avatar vers ta cible.
- C'est visible par tous en temps réel.
- Tu peux retirer ton doigt ou le changer.
- Ce n'est PAS un vote — c'est juste un indicateur social pour alimenter la discussion.
- Stats de fin de partie : "Joueur le plus pointé du doigt".

### Chat textuel intégré

- Disponible dans le lobby ET en jeu.
- Messages limités à 100 caractères (pour garder ça punchy).
- Pas de spam : cooldown de 2 secondes entre les messages.
- Les messages s'affichent en overlay semi-transparent en bas de l'écran.
- Les joueurs passés en spectateur (AFK / déco) peuvent toujours envoyer des messages, mais leurs messages ont une opacité réduite et un badge 👻.
- **Commandes spéciales dans le chat** :
  - `/gg` → Confettis sur ton avatar
  - `/sus [pseudo]` → Animation "SUSSY" au-dessus de l'avatar ciblé (fun, pas de conséquence)
  - `/rip` → Pierre tombale comique sur ton avatar

### Image de partage de fin de partie

Générée automatiquement — un "résumé visuel" de la partie :

```
┌──────────────────────────────────┐
│  INKOGNITO — Résultats           │
│                                  │
│  🏆 Luna (3 victoires)          │
│                                  │
│  Meilleurs dessins :             │
│  [dessin1]  [dessin2]  [dessin3] │
│                                  │
│  Awards :                        │
│  🎨 Luna  🕵️ Max  🎭 Alex       │
│                                  │
│  inkognito.gg                    │
└──────────────────────────────────┘
```

Format : 1080×1080 (carré, optimisé Instagram/Discord). Les joueurs peuvent télécharger l'image ou la copier.

---

## 13. Anti-triche & Edge cases

### Scénarios problématiques et solutions

| Problème | Solution |
|---|---|
| Un joueur partage son mot sur Discord | On ne peut pas empêcher ça — c'est un jeu de confiance entre potes. Un disclaimer "Pas de spoil !" au moment de la distribution suffit. |
| Un joueur quitte en pleine partie | Son avatar passe en mode "déconnecté" (grisé). S'il revient dans les 30s, il reprend sa place. Sinon, son round en cours est figé, son vote passe en blanc, et il peut revenir au round suivant sans pénaliser tout le lobby. |
| L'hôte quitte | Le joueur le plus ancien dans le lobby devient le nouvel hôte. Notification à tous. |
| Timer expiré sans dessin | Le canvas blanc est soumis tel quel. C'est drôle en soi : "Il a rien dessiné, c'est forcément lui !" |
| Tous les joueurs votent blanc | Personne n'est désigné. L'Undercover prend ses points de discrétion, puis round suivant. |
| Undercover démasqué au premier round | La partie continue avec les rounds restants — les civils ont juste pris de l'avance au score. En multi-round, les rôles sont redistribués à chaque round. |
| Connexion lente / lag | Le dessin est rendu localement puis streamé en temps réel par paquets de traits compressés. Un snapshot final est aussi envoyé pour resynchroniser les clients et sécuriser la galerie. |
| Écran trop petit | Voir section Responsive. Le canvas s'adapte mais reste carré. |

### Système anti-AFK

- Si un joueur n'a aucune interaction pendant 2 phases consécutives, un popup "Es-tu encore là ?" apparaît.
- S'il ne répond pas, il est mis en mode spectateur automatiquement.
- Les autres joueurs sont notifiés : "🦊 Alex est AFK".

---

## 14. Architecture technique

### Stack recommandée

```
FRONTEND
─────────────────────────────────
Framework :     React (Vite) ou Next.js
Dessin :        Canvas HTML5 (vanilla, pas de lib)
State :         Zustand (léger, simple)
Styling :       Tailwind CSS + CSS custom properties
Animations :    Framer Motion
Sons :          Howler.js
Temps réel :    Socket.IO (client)

BACKEND
─────────────────────────────────
Runtime :       Node.js
Framework :     Express ou Fastify
WebSocket :     Socket.IO (server)
State :         In-memory (Redis optionnel pour scale)
Base de données : Aucune en V1 (pas de comptes, pas de persistence)
Hébergement :   Railway / Render / Fly.io

INFRA
─────────────────────────────────
CDN :           Cloudflare (assets statiques)
Domaine :       inkognito.gg (ou .io, .fun)
SSL :           Let's Encrypt (automatique)
Monitoring :    Sentry (erreurs frontend)
```

### Architecture WebSocket

```
CLIENT A ──┐
CLIENT B ──┤
CLIENT C ──┼──► SERVEUR (Socket.IO) ──► Room State (in-memory)
CLIENT D ──┤
CLIENT E ──┘

Événements principaux :
──────────────────────

Client → Server :
  join_room(code, pseudo, avatar)
  player_ready()
  drawing_stroke(stroke_batch)
  submit_drawing(snapshot)
  cast_vote(target_player_id)
  send_reaction(target_player_id, emoji)
  point_finger(target_player_id)
  chat_message(text)

Server → Client :
  room_update(players, settings)
  game_start(role, word)
  phase_change(phase, data)
  drawing_stream(player_id, stroke_batch)
  drawing_activity(player_id, is_active)
  vote_result(suspect_player_id, revealed_roles, round_points)
  reaction_received(from, to, emoji)
  finger_pointed(from, to)
  game_end(results, awards)
```

### Gestion des rooms

- Chaque room a un **code unique de 6 caractères** (alphanumérique, sans ambiguïté : pas de 0/O, I/l/1).
- Les rooms sont créées en mémoire et détruites 5 minutes après la fin de partie ou quand tous les joueurs quittent.
- Limite : 12 joueurs par room.
- **Pas de matchmaking** — c'est un jeu entre potes, on rejoint par code/lien.

### Optimisation du dessin

- Le dessin est **streamé en temps réel**, mais sous forme de **paquets de traits vectoriels** (pas d'image complète à chaque frame).
- Les traits sont batchés toutes les `50-100ms` pour limiter le bruit réseau sans casser l'impression de live.
- Un snapshot final compressé (PNG ou WebP, ~50-100KB) est envoyé à la fin du timer pour la galerie et les reconnexions.
- Les miniatures en galerie sont des versions redimensionnées (200×200px) pour le chargement rapide.

---

## 15. Responsive & Mobile

### Breakpoints

| Breakpoint | Largeur | Layout |
|---|---|---|
| Mobile S | < 375px | Compact, stack vertical, canvas 280×280 |
| Mobile M | 375-428px | Standard mobile, canvas 340×340 |
| Mobile L | 428-768px | Grand mobile / petite tablette, canvas 400×400 |
| Tablet | 768-1024px | Layout hybride, sidebar + canvas |
| Desktop | 1024-1440px | Layout complet, sidebar + canvas + panels |
| Desktop XL | > 1440px | Layout étendu, espace supplémentaire |

### Adaptations mobile critiques

**Canvas de dessin :**
- Le canvas prend toute la largeur disponible moins les marges.
- Les outils sont dans un dock fixe en bas (comme les apps de dessin mobile).
- Le mot est dans un header sticky fin en haut.
- Les joueurs sont dans un overlay rétractable (drawer depuis la gauche) avec miniatures live.

**Galerie :**
- Grille 2 colonnes (au lieu de 3-5 sur desktop).
- Scroll vertical.
- Tap pour zoom plein écran.

**Vote :**
- Les avatars sont dans un carrousel horizontal scrollable au lieu d'un cercle.
- Les dessins sont accessibles via un swipe vers le haut.

**Général :**
- Tous les boutons ont une zone de tap minimum de 44×44px.
- Pas de hover effects (inutiles sur mobile) — remplacés par des tap effects.
- Haptic feedback sur les actions clés (vote, réaction, timer fin).

---

## 16. Accessibilité

### Standards visés : WCAG 2.1 AA

| Critère | Implémentation |
|---|---|
| Contraste | Tous les textes respectent un ratio de 4.5:1 minimum. Les couleurs néon sont utilisées pour les décorations, pas pour le texte informatif. |
| Navigation clavier | Toutes les actions sont accessibles au clavier (Tab, Enter, Espace, flèches). |
| Screen readers | Aria-labels sur tous les boutons et zones interactives. Les dessins ont un alt-text "Dessin de [pseudo]". |
| Daltonisme | Les rôles ne sont pas codés uniquement par couleur — icônes et labels textuels en complément. |
| Épilepsie | Aucun flash rapide (> 3 Hz). Les animations de confettis sont en douceur. Option "Réduire les animations" dans les settings. |
| Taille du texte | Minimum 14px. Respect des préférences système de taille de texte. |
| Motricité réduite | Le dessin fonctionne avec des gestes simples. Pas d'action nécessitant du double-clic rapide. |

### Paramètres d'accessibilité (dans les settings)

- **Réduire les animations** : Désactive confettis, particules, shake. Garde les transitions essentielles.
- **Mode contraste élevé** : Augmente les contrastes, épaissit les bordures.
- **Taille du texte** : Petit / Normal / Grand / Très grand.
- **Sons** : Volume master + toggle par catégorie.

---

## 17. Roadmap & V2 Ideas

### V1 — MVP (ce document)

- Mode Classique + Mr. White
- 4-12 joueurs
- Dessin + vote + chat
- Responsive mobile/desktop
- Pas de comptes, pas de persistence

### V1.5 — Polish

- Mode Chaos (power-ups)
- Mots custom de l'hôte
- Image de partage fin de partie
- Awards de fin de partie
- Sound design complet
- Tutoriel interactif

### V2 — Expansion

- **Comptes optionnels** : Pseudo persistant, stats historiques, ELO ranking
- **Matchmaking public** : Jouer avec des inconnus (rooms publiques)
- **Personnalisation avancée** : Cadres d'avatar, titres, emotes custom
- **Spectateur/Stream mode** : Vue OBS-friendly avec overlay, délai de 30s pour éviter le snipe
- **Mode Tournoi** : Saisons, tableaux de score, finales en BO3/BO5
- **API de mots** : Intégration de bases de données de mots externes (Datamuse, etc.)
- **Mode "Imposteur Vocal"** : Au lieu de dessiner, les joueurs décrivent leur mot oralement (enregistrement audio). L'Undercover doit décrire sans connaître le vrai mot.
- **Mode "Sculpture 3D"** : Remplacer le canvas 2D par un outil de sculpture voxel (comme MagicaVoxel mais en browser).
- **Intégration Discord Rich Presence** : Status Discord qui montre la room en cours avec un bouton "Rejoindre".
- **Bot Discord** : Commande `/inkognito` pour créer une partie directement depuis Discord.
- **Skins de canvas** : Canvas thématiques (parchemin, tableau noir, post-it, nappe de restaurant).
- **Musiques de fond thématiques** : Jazz lounge, synthwave, lo-fi — sélectionnables par l'hôte.
- **Replay système** : Revoir toute la partie comme un replay animé (accéléré, avec les dessins qui se tracent en time-lapse).
- **Partenariats avec des streamers** : Overlay Twitch personnalisé, mode audience où les viewers votent en parallèle.

---

## Annexe A — Lexique

| Terme | Définition |
|---|---|
| **Civil** | Joueur normal qui connaît le mot principal. |
| **Undercover** | Joueur qui a un mot différent mais proche — il doit se fondre dans la masse. |
| **Mr. White** | Joueur qui ne connaît aucun mot — il improvise. |
| **Round** | Un cycle complet : dessin live → galerie finale → discussion → vote → résolution + points. |
| **Room / Lobby** | L'espace d'attente avant le lancement d'une partie. |
| **Code de room** | Identifiant unique à 6 caractères pour rejoindre une partie. |
| **Phase** | Une étape au sein d'un round (dessin, galerie finale, discussion, vote, résolution). |
| **Award** | Récompense humoristique attribuée en fin de partie basée sur les stats. |

## Annexe B — Inspirations visuelles (moodboard textuel)

**Ambiance générale :**
- L'intérieur d'un bar à cocktails éclairé au néon violet et cyan
- Un flipper arcade des années 80 — chrome, reflets, couleurs saturées sur fond noir
- L'esthétique des génériques de James Bond — silhouettes, géométrie, mystère
- Les écrans de titre des jeux Persona — typographie audacieuse, contraste violent

**Références UI spécifiques :**
- **Jackbox Games** : La polish des transitions, les écrans de résultats festifs
- **Among Us** : La simplicité des avatars, le système de vote
- **Gartic Phone** : Le flow sans friction du dessin multijoueur
- **Figma** : La fluidité du canvas et des curseurs multijoueurs
- **Notion** : La propreté de l'interface, les micro-animations subtiles
- **Discord** : L'ambiance sombre confortable, le chat intégré

---

*Document rédigé pour le développement d'INKOGNITO v1.*
*Dernière mise à jour : Avril 2026.*
