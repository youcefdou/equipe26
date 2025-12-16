# equipe26
# Fit & Figure


---

## Rapport de projet

**Cours :** INF-1011  
**Université du Québec à Trois-Rivières**

**Présenté par :** Youcef doudou

**Date :16 Décembre 2024

---

## Table des matières

1. [Manuel d'utilisation](#1-manuel-dutilisation)
   - 1.1 [Présentation du jeu](#11-présentation-du-jeu)
   - 1.2 [Objectif du jeu](#12-objectif-du-jeu)
   - 1.3 [Les trois types de zones](#13-les-trois-types-de-zones)
   - 1.4 [Comment jouer](#14-comment-jouer)
   - 1.5 [Contrôles et interface](#15-contrôles-et-interface)
   - 1.6 [Fonctionnalités supplémentaires](#16-fonctionnalités-supplémentaires)
   - 1.7 [Conseils stratégiques](#17-conseils-stratégiques)
2. [Application des principes SOLID](#2-application-des-principes-solid)
3. [Patrons de conception GoF utilisés](#3-patrons-de-conception-gof-utilisés)
4. [Conclusion](#4-conclusion)
5. [Installation et compilation](#5-installation-et-compilation)

---

## 1. Manuel d'utilisation

### 1.1 Présentation du jeu

Fit & Figure est un jeu de puzzle logique combinant réflexion spatiale et raisonnement mathématique. Le joueur doit placer des formes numérotées sur une grille tout en respectant trois types de contraintes de zones.

### 1.2 Objectif du jeu

Remplir complètement la grille avec toutes les formes disponibles tout en respectant les contraintes de chaque zone colorée.

### 1.3 Les trois types de zones

#### 1.3.1 Zones égales (=)

**Représentation :** Cases de couleur bleue

**Contrainte :** Toutes les cases d'une zone égale doivent contenir le même chiffre.

**Exemple :** Si une zone bleue contient 3 cases, elles doivent toutes contenir le chiffre 4.

#### 1.3.2 Zones distinctes (≠)

**Représentation :** Cases de couleur verte

**Contrainte :** Chaque case d'une zone distincte doit contenir un chiffre différent.

**Exemple :** Une zone verte de 4 cases doit contenir les chiffres 1, 2, 3 et 4 dans n'importe quel ordre.

#### 1.3.3 Zones sommatives (Σ)

**Représentation :** Cases de couleur rouge avec une valeur cible affichée

**Contrainte :** La somme des chiffres dans une zone sommative doit égaler la valeur cible indiquée.

**Exemple :** Une zone marquée 'Σ=10' peut contenir les chiffres 2, 3 et 5 (2+3+5=10).

### 1.4 Comment jouer

1. **Sélectionner une forme :** Cliquez sur une forme dans le panneau latéral droit pour la sélectionner.

2. **Rotation (optionnel) :** Utilisez le bouton de rotation (icône circulaire) pour pivoter la forme de 90 degrés.

3. **Placement :** Cliquez sur la grille à l'endroit où vous souhaitez placer la forme.

4. **Retirer une forme :** Cliquez sur une forme déjà placée pour la retirer, ou utilisez le clic droit pour la retirer et la pivoter.

5. **Vérification :** Une fois toutes les formes placées, la grille est automatiquement vérifiée. Vous pouvez aussi utiliser le bouton 'Vérifier'.

### 1.5 Contrôles et interface

| Action | Description |
|--------|-------------|
| **Clic gauche** | Sur la grille : placer la forme sélectionnée ou retirer une forme déjà placée |
| **Clic droit** | Sur une forme placée : retirer et pivoter la forme simultanément |
| **Bouton Rotation** | Pivoter une forme non placée de 90 degrés |
| **Bouton Vérifier** | Vérifier manuellement si la solution est correcte |
| **Bouton Solution** | Afficher la solution complète du niveau |
| **Bouton Recommencer** | Réinitialiser le niveau actuel |

### 1.6 Fonctionnalités supplémentaires

- **Tutoriel interactif :** Accessible depuis le menu principal, explique les règles étape par étape.
- **Tableau d'honneur :** Affiche vos meilleurs temps pour chaque niveau complété.
- **Chronomètre :** Mesure votre temps pour chaque niveau (affiché en haut de l'écran).
- **Progression sauvegardée :** Vos niveaux complétés et scores sont conservés automatiquement.

### 1.7 Conseils stratégiques

- Analysez d'abord toutes les contraintes avant de placer les formes.
- Commencez par les zones les plus restrictives (zones sommatives avec peu de cases).
- Placez les grandes formes en premier pour optimiser l'espace.
- N'hésitez pas à recommencer si vous êtes bloqué.

---

## 2. Application des principes SOLID

Les cinq principes SOLID ont été rigoureusement appliqués dans l'architecture de Fit & Figure pour garantir un code maintenable, extensible et testable.

### 2.1 Single Responsibility Principle (SRP) - Principe de responsabilité unique

**Définition :** Une classe ne doit avoir qu'une seule raison de changer, c'est-à-dire qu'elle ne doit avoir qu'une seule responsabilité.

**Application dans le projet :**

La classe `GridValidator` a une seule responsabilité : valider la grille selon les contraintes des zones. Elle ne gère ni l'interface utilisateur, ni la logique de placement des formes.

**Code :**

```javascript
class GridValidator {
  constructor(zones) {
    this.zones = zones;
  }
  
  validateAll(grid) {
    return this.zones.every(zone => zone.validate(grid));
  }
  
  getInvalidZones(grid) {
    return this.zones.filter(zone => !zone.validate(grid));
  }
}
```

**Avantages :**
- Code focalisé et facile à comprendre
- Facilite les tests unitaires
- Modifications isolées à une seule classe

---

### 2.2 Open/Closed Principle (OCP) - Principe ouvert/fermé

**Définition :** Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.

**Application dans le projet :**

La hiérarchie de classes `Zone` permet d'ajouter de nouveaux types de zones (`EqualZone`, `DistinctZone`, `SummativeZone`) sans modifier le code existant. Chaque type de zone implémente sa propre logique de validation.

**Code :**

```javascript
class Zone {
  constructor(cells) { this.cells = cells; }
  validate(grid) { return true; }
}

class EqualZone extends Zone {
  validate(grid) {
    const values = this.cells.map(([r,c]) => grid[r]?.[c])
                            .filter(v => v !== null);
    return values.every(v => v === values[0]);
  }
}

class DistinctZone extends Zone {
  validate(grid) {
    const values = this.cells.map(([r,c]) => grid[r]?.[c])
                            .filter(v => v !== null);
    return new Set(values).size === values.length;
  }
}

class SummativeZone extends Zone {
  constructor(cells, target) {
    super(cells);
    this.target = target;
  }
  
  validate(grid) {
    const values = this.cells.map(([r,c]) => grid[r]?.[c])
                            .filter(v => v !== null);
    if (values.length !== this.cells.length) return true;
    return values.reduce((a, b) => a + b, 0) === this.target;
  }
}
```

**Avantages :**
- Ajout de nouveaux types de zones sans risque de régression
- Code existant protégé contre les modifications
- Extensibilité maximale

---

### 2.3 Liskov Substitution Principle (LSP) - Principe de substitution de Liskov

**Définition :** Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le comportement du programme.

**Application dans le projet :**

Toutes les sous-classes de `Zone` (`EqualZone`, `DistinctZone`, `SummativeZone`) peuvent être utilisées de manière interchangeable par `GridValidator`. Chaque sous-classe respecte le contrat de la méthode `validate(grid)` qui retourne toujours un booléen, garantissant la substitution.

**Exemple d'utilisation :**

```javascript
const zones = [
  new EqualZone([[0,0], [0,1]]),
  new DistinctZone([[1,0], [1,1], [1,2]]),
  new SummativeZone([[2,0], [2,1]], 10)
];

const validator = new GridValidator(zones);
// Toutes les zones sont traitées de manière uniforme
validator.validateAll(grid);
```

**Avantages :**
- Polymorphisme respecté
- Interchangeabilité des sous-classes
- Prédictibilité du comportement

---

### 2.4 Interface Segregation Principle (ISP) - Principe de ségrégation des interfaces

**Définition :** Les clients ne doivent pas dépendre d'interfaces qu'ils n'utilisent pas.

**Application dans le projet :**

Chaque classe de zone (`EqualZone`, `DistinctZone`, `SummativeZone`) n'implémente que la méthode `validate()` dont elle a besoin. La classe `SummativeZone` ajoute un attribut `target` spécifique à son besoin, sans forcer les autres zones à l'implémenter.

**Structure :**

```javascript
// Zone de base - interface minimale
class Zone {
  validate(grid) { ... }
}

// SummativeZone ajoute uniquement ce dont elle a besoin
class SummativeZone extends Zone {
  constructor(cells, target) {
    super(cells);
    this.target = target; // Attribut spécifique
  }
}
```

**Avantages :**
- Pas de méthodes ou attributs inutiles
- Classes légères et focalisées
- Dépendances minimales

---

### 2.5 Dependency Inversion Principle (DIP) - Principe d'inversion des dépendances

**Définition :** Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.

**Application dans le projet :**

`GridValidator` dépend de l'abstraction `Zone` et non des implémentations concrètes (`EqualZone`, `DistinctZone`). Cela permet d'ajouter de nouveaux types de zones sans modifier `GridValidator`.

**Code :**

```javascript
class GridValidator {
  constructor(zones) {
    this.zones = zones; // Dépend de l'abstraction Zone
  }
  
  validateAll(grid) {
    // Traite toutes les zones de manière uniforme
    return this.zones.every(zone => zone.validate(grid));
  }
}

// Utilisation
const zones = [
  ZoneFactory.createZone('equal', [[0,0], [0,1]]),
  ZoneFactory.createZone('distinct', [[1,0], [1,1]]),
  ZoneFactory.createZone('summative', [[2,0], [2,1]], 10)
];
const validator = new GridValidator(zones);
```

**Avantages :**
- Découplage entre modules
- Flexibilité pour ajouter de nouveaux types
- Testabilité accrue (injection de dépendances)

---

## 3. Patrons de conception GoF utilisés

Trois patrons de conception du Gang of Four (GoF) ont été implémentés dans le projet pour structurer le code de manière élégante et maintenable.

### 3.1 Factory Pattern (Patron Fabrique)

**Type :** Patron de création

**Objectif :** Encapsuler la logique de création d'objets complexes.

**Application dans le projet :**

La classe `ZoneFactory` centralise la création des différents types de zones (égales, distinctes, sommatives). Elle décide quel type de zone instancier en fonction du paramètre `type` fourni.

**Code :**

```javascript
class ZoneFactory {
  static createZone(type, cells, target = null) {
    switch(type) {
      case 'equal':
        return new EqualZone(cells);
      case 'distinct':
        return new DistinctZone(cells);
      case 'summative':
        return new SummativeZone(cells, target);
      default:
        return new Zone(cells);
    }
  }
}

// Utilisation
const zone1 = ZoneFactory.createZone('equal', [[0,0], [0,1]]);
const zone2 = ZoneFactory.createZone('distinct', [[1,0], [1,1], [1,2]]);
const zone3 = ZoneFactory.createZone('summative', [[2,0], [2,1]], 10);
```

**Avantages :**
- Centralisation de la logique de création
- Facilite l'ajout de nouveaux types de zones
- Réduit le couplage entre le code client et les classes concrètes
- Respect du principe Open/Closed

**Diagramme conceptuel :**

```
        ZoneFactory
             |
    +--------+--------+
    |        |        |
EqualZone  DistinctZone  SummativeZone
```

---

### 3.2 Singleton Pattern (Patron Singleton)

**Type :** Patron de création

**Objectif :** Garantir qu'une classe n'a qu'une seule instance et fournir un point d'accès global à cette instance.

**Application dans le projet :**

La classe `GameManager` implémente le patron Singleton pour gérer l'état global du jeu (score, niveaux complétés, meilleurs temps). Une seule instance existe pour toute l'application.

**Code :**

```javascript
class GameManager {
  static instance = null;
  
  constructor() {
    if (GameManager.instance) {
      return GameManager.instance;
    }
    this.currentLevel = 0;
    this.score = 0;
    this.completedLevels = [];
    this.bestTimes = {};
    GameManager.instance = this;
  }
  
  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  
  completeLevel(level, time) {
    if (!this.completedLevels.includes(level)) {
      this.completedLevels.push(level);
      this.score += 100;
    }
    if (!this.bestTimes[level] || time < this.bestTimes[level]) {
      this.bestTimes[level] = time;
    }
  }
  
  getLeaderboard() {
    return Object.entries(this.bestTimes)
      .map(([level, time]) => ({ level: parseInt(level), time }))
      .sort((a, b) => a.time - b.time);
  }
}

// Utilisation
const gameManager = GameManager.getInstance();
gameManager.completeLevel(0, 120);
```

**Avantages :**
- Contrôle strict sur l'instanciation
- Point d'accès global à l'état du jeu
- Évite la duplication de données de jeu
- Garantit la cohérence des données à travers l'application

**Caractéristiques :**
- Une seule instance pour toute l'application
- Accès global via `getInstance()`
- Gestion centralisée du score et de la progression

---

### 3.3 Observer Pattern (Patron Observateur)

**Type :** Patron de comportement

**Objectif :** Définir une dépendance un-à-plusieurs entre objets de sorte que lorsqu'un objet change d'état, tous ses dépendants soient notifiés automatiquement.

**Application dans le projet :**

La classe `GameEventSystem` implémente le patron Observer pour gérer les événements du jeu (complétion de niveau, erreurs, etc.). Les composants peuvent s'abonner à des événements spécifiques et être notifiés automatiquement.

**Code :**

```javascript
class GameEventSystem {
  constructor() {
    this.listeners = {};
  }
  
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
}

// Utilisation
const eventSystem = new GameEventSystem();

// S'abonner à un événement
eventSystem.subscribe('levelComplete', (data) => {
  console.log(`Niveau ${data.level} complété!`);
});

// Notifier les abonnés
eventSystem.notify('levelComplete', { level: 1 });
```

**Avantages :**
- Découplage entre les composants émetteurs et récepteurs d'événements
- Facilite l'ajout de nouveaux abonnés sans modifier le code existant
- Permet une communication asynchrone entre les composants
- Extensibilité : nouveaux événements ajoutables facilement

**Scénarios d'utilisation dans le jeu :**
- Notification de complétion de niveau
- Gestion des erreurs de placement
- Mise à jour du score
- Changements d'état du jeu

---

## 4. Conclusion

Ce projet Fit & Figure démontre l'application rigoureuse des principes SOLID et de patrons de conception GoF dans le développement d'une application React moderne. L'architecture mise en place garantit un code maintenable, extensible et testable.

**Les principes SOLID** assurent que chaque classe a une responsabilité claire et unique, que le code est ouvert à l'extension mais fermé à la modification, et que les dépendances sont inversées pour maximiser la flexibilité.

**Les patrons GoF** (Factory, Singleton, Observer) structurent le code de manière élégante et facilitent l'ajout de nouvelles fonctionnalités sans compromettre l'intégrité de l'architecture existante.

Ce rapport illustre comment les bonnes pratiques de génie logiciel peuvent être appliquées concrètement dans un projet ludique et fonctionnel, démontrant que rigueur technique et créativité ne sont pas incompatibles.

### Points clés de l'architecture :

✅ **Séparation des responsabilités** : Chaque classe a un rôle clair et défini

✅ **Extensibilité** : Nouveaux types de zones et fonctionnalités facilement ajoutables

✅ **Maintenabilité** : Code structuré et documenté pour faciliter les modifications

✅ **Testabilité** : Architecture permettant des tests unitaires efficaces

✅ **Réutilisabilité** : Composants réutilisables dans d'autres contextes

---

## 5. Installation et compilation

### Prérequis

- Node.js (version 14 ou supérieure)
- npm (version 6 ou supérieure)

### Installation

1. Cloner le dépôt :
```bash
git clone <url-du-depot>
cd fit-and-figure
```

2. Installer les dépendances :
```bash
npm install
```

### Lancement

#### Mode développement
```bash
npm start
```
L'application s'ouvrira automatiquement dans votre navigateur sur `http://localhost:3000`

#### Compilation pour production
```bash
npm run build
```
Les fichiers optimisés seront générés dans le dossier `build/`

### Technologies utilisées

- **React 18.2.0** : Bibliothèque JavaScript pour l'interface utilisateur
- **React Scripts 5.0.1** : Configuration et scripts de build
- **Lucide React 0.263.1** : Bibliothèque d'icônes
- **Tailwind CSS** : Framework CSS pour le style

---

## Auteurs

- **Youcef doudou**

**Cours :** INF-1011 - Université du Québec à Trois-Rivières

**Date :** Décembre 2024

