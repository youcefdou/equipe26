import React, { useState, useEffect } from 'react';
import { RotateCw, RefreshCw, Home, Trophy, HelpCircle, ArrowLeft, Play } from 'lucide-react';

// ============= PATRONS DE CONCEPTION =============

// 1. FACTORY PATTERN - Création de zones avec contraintes
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

// Classes de zones (Strategy Pattern pour validation)
class Zone {
  constructor(cells) {
    this.cells = cells;
    this.type = 'none';
  }
  
  validate(grid) {
    return true;
  }
}

class EqualZone extends Zone {
  constructor(cells) {
    super(cells);
    this.type = 'equal';
  }
  
  validate(grid) {
    const values = this.cells.map(([r, c]) => grid[r]?.[c]).filter(v => v !== null);
    if (values.length === 0) return true;
    return values.every(v => v === values[0]);
  }
}

class DistinctZone extends Zone {
  constructor(cells) {
    super(cells);
    this.type = 'distinct';
  }
  
  validate(grid) {
    const values = this.cells.map(([r, c]) => grid[r]?.[c]).filter(v => v !== null);
    return new Set(values).size === values.length;
  }
}

class SummativeZone extends Zone {
  constructor(cells, target) {
    super(cells);
    this.type = 'summative';
    this.target = target;
  }
  
  validate(grid) {
    const values = this.cells.map(([r, c]) => grid[r]?.[c]).filter(v => v !== null);
    if (values.length !== this.cells.length) return true;
    return values.reduce((a, b) => a + b, 0) === this.target;
  }
}

// 2. SINGLETON PATTERN - Gestionnaire de jeu unique
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

// 3. OBSERVER PATTERN - Notifications d'événements
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
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// ============= PRINCIPES SOLID =============

// S - Single Responsibility Principle
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

// ============= NIVEAUX DE JEU =============

const LEVELS = [
  {
    id: 1,
    name: "Niveau 1",
    size: 3,
    zones: [
      // Zone bleue (=) : cases [0,1] et [0,2]
      { type: 'equal', cells: [[0,1], [0,2]], color: 'bg-blue-300' },
      // Zone verte (≠) : cases [1,0], [2,0], [2,1]
      { type: 'distinct', cells: [[1,0], [2,0], [2,1]], color: 'bg-green-300' },
      // Zone rouge (Σ=8) : cases [1,1], [1,2], [2,2]
      { type: 'summative', cells: [[1,1], [1,2], [2,2]], target: 8, color: 'bg-red-300' },
      // Case neutre : [0,0]
      { type: 'none', cells: [[0,0]], color: 'bg-gray-100' }
    ],
    shapes: [
      // Forme 1: Carré 2x2 [2,5,1,4]
      { id: 1, cells: [[0,0], [0,1], [1,0], [1,1]], values: [2, 5, 1, 4] },
      // Forme 2: Ligne verticale [5,2,2]
      { id: 2, cells: [[0,0], [1,0], [2,0]], values: [5, 2, 2] },
      // Forme 3: Ligne verticale [2,3]
      { id: 3, cells: [[0,0], [1,0]], values: [2, 3] }
    ],
    solution: [
      { shapeId: 2, position: [0, 0], rotation: 0 },
      { shapeId: 1, position: [0, 1], rotation: 0 },
      { shapeId: 3, position: [1, 2], rotation: 0 }
    ],
    hint: "Zone bleue = : même chiffre | Zone verte ≠ : tous différents | Zone rouge Σ=8 : somme = 8"
  },
  {
    id: 2,
    name: "Niveau 2",
    size: 4,
    zones: [
      // Zone bleue (=) : cases [0,0], [0,1], [0,2]
      { type: 'equal', cells: [[0,0], [0,1], [0,2]], color: 'bg-blue-300' },
      // Zone verte (≠) : cases [1,1], [1,2], [2,2]
      { type: 'distinct', cells: [[1,1], [1,2], [2,2]], color: 'bg-green-300' },
      // Zone rouge (Σ=6) : cases [2,1], [3,1]
      { type: 'summative', cells: [[2,1], [3,1]], target: 6, color: 'bg-red-300' },
      // Cases neutres : toutes les autres
      { type: 'none', cells: [[0,3], [1,0], [1,3], [2,0], [2,3], [3,0], [3,2], [3,3]], color: 'bg-gray-100' }
    ],
    shapes: [
      // Forme 1: L [2,2,3]
      { id: 1, cells: [[0,0], [0,1], [1,0]], values: [2, 2, 3] },
      // Forme 2: Ligne 3 cases [2,1,5]
      { id: 2, cells: [[0,0], [1,0], [2,0]], values: [2, 1, 5] },
      // Forme 3: Case unique [3]
      { id: 3, cells: [[0,0]], values: [3] },
      // Forme 4: Carré 2x2 [9,2,5,4]
      { id: 4, cells: [[0,0], [0,1], [1,0], [1,1]], values: [9, 2, 5, 4] },
      // Forme 5: Ligne 4 cases [3,8,2,1]
      { id: 5, cells: [[0,0], [1,0], [2,0], [3,0]], values: [3, 8, 2, 1] },
      // Forme 6: Case unique [6]
      { id: 6, cells: [[0,0]], values: [6] }
    ],
    solution: [
      { shapeId: 1, position: [0, 0], rotation: 0 },
      { shapeId: 2, position: [0, 2], rotation: 0 },
      { shapeId: 3, position: [1, 0], rotation: 0 },
      { shapeId: 4, position: [2, 2], rotation: 0 },
      { shapeId: 5, position: [0, 3], rotation: 90 },
      { shapeId: 6, position: [2, 1], rotation: 0 }
    ],
    hint: "Zone bleue = : même chiffre | Zone verte ≠ : tous différents | Zone rouge Σ=6 : somme = 6"
  }
];

// ============= COMPOSANT PRINCIPAL =============

export default function FitAndFigure() {
  const [gameState, setGameState] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [grid, setGrid] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [message, setMessage] = useState('');
  const [zones, setZones] = useState([]);
  const [validator, setValidator] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const gameManager = GameManager.getInstance();
  const eventSystem = new GameEventSystem();
  
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, startTime]);
  
  useEffect(() => {
    if (gameState === 'playing') {
      loadLevel(LEVELS[currentLevel]);
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [gameState, currentLevel]);
  
  const loadLevel = (level) => {
    const newGrid = Array(level.size).fill(null).map(() => Array(level.size).fill(null));
    setGrid(newGrid);
    setShapes(level.shapes.map(s => ({ ...s, placed: false, rotation: 0 })));
    
    const zoneObjects = level.zones.map(z => 
      ZoneFactory.createZone(z.type, z.cells, z.target)
    );
    setZones(level.zones);
    setValidator(new GridValidator(zoneObjects));
    setMessage('');
    setSelectedShape(null);
  };
  
  const rotateShape = (shapeId) => {
    setShapes(shapes.map(s => {
      if (s.id === shapeId && !s.placed) {
        const maxRow = Math.max(...s.cells.map(([r, c]) => r));
        const maxCol = Math.max(...s.cells.map(([r, c]) => c));
        const rotatedCells = s.cells.map(([r, c]) => [c, maxRow - r]);
        return { ...s, cells: rotatedCells, rotation: (s.rotation + 90) % 360 };
      }
      return s;
    }));
  };
  
  const placeShape = (shapeId, row, col) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape || shape.placed) return;
    
    const newGrid = grid.map(r => [...r]);
    let canPlace = true;
    
    shape.cells.forEach(([r, c], idx) => {
      const newRow = row + r;
      const newCol = col + c;
      if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid.length) {
        canPlace = false;
      } else if (newGrid[newRow][newCol] !== null) {
        canPlace = false;
      }
    });
    
    if (canPlace) {
      shape.cells.forEach(([r, c], idx) => {
        newGrid[row + r][col + c] = shape.values[idx];
      });
      
      setGrid(newGrid);
      const updatedShapes = shapes.map(s => s.id === shapeId ? { ...s, placed: true, position: [row, col] } : s);
      setShapes(updatedShapes);
      setSelectedShape(null);
      setMessage('');
      
      console.log('Forme placée:', shapeId, 'à la position', [row, col]);
      
      setTimeout(() => {
        checkCompletion(newGrid);
      }, 100);
    } else {
      setMessage('⚠️ Impossible de placer ici ! La forme dépasse ou chevauche une autre.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  
  const checkCompletion = (currentGrid) => {
    let filledCells = 0;
    for (let i = 0; i < currentGrid.length; i++) {
      for (let j = 0; j < currentGrid[i].length; j++) {
        if (currentGrid[i][j] !== null) filledCells++;
      }
    }
    
    const totalCells = currentGrid.length * currentGrid.length;
    console.log('Cases remplies:', filledCells, '/', totalCells);
    
    if (filledCells === totalCells) {
      console.log('Grille complète! Validation...');
      const level = LEVELS[currentLevel];
      const zoneObjects = level.zones.map(z => 
        ZoneFactory.createZone(z.type, z.cells, z.target)
      );
      const newValidator = new GridValidator(zoneObjects);
      
      console.log('Grille actuelle:', currentGrid);
      
      const isValid = newValidator.validateAll(currentGrid);
      console.log('Grille valide?', isValid);
      
      if (isValid) {
        gameManager.completeLevel(currentLevel, elapsedTime);
        setMessage('🎉 Félicitations ! Toutes les contraintes sont respectées !');
        setTimeout(() => {
          setGameState('won');
          eventSystem.notify('levelComplete', { level: currentLevel });
        }, 1500);
      } else {
        const invalidZones = newValidator.getInvalidZones(currentGrid);
        console.log('Zones invalides:', invalidZones);
        
        level.zones.forEach((zoneConfig, idx) => {
          const zone = zoneObjects[idx];
          const values = zoneConfig.cells.map(([r, c]) => currentGrid[r][c]);
          console.log(`Zone ${idx} (${zone.type}):`, values, 'Valide?', zone.validate(currentGrid));
        });
        
        const zoneTypes = invalidZones.map(z => {
          if (z.type === 'equal') return 'Zone égale (=)';
          if (z.type === 'distinct') return 'Zone distincte (≠)';
          if (z.type === 'summative') return `Zone sommative (Σ=${z.target})`;
          return 'Zone';
        });
        
        if (zoneTypes.length > 0) {
          setMessage(`❌ Solution incorrecte ! Problème avec : ${zoneTypes.join(', ')}`);
        } else {
          setMessage('❌ Solution incorrecte ! Vérifiez toutes les contraintes.');
        }
      }
    } else {
      console.log('Pas encore toutes les formes placées');
    }
  };
  
  const removeShape = (shapeId) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape || !shape.placed) return;
    
    const newGrid = grid.map(r => [...r]);
    
    shape.cells.forEach(([r, c]) => {
      const gridRow = shape.position[0] + r;
      const gridCol = shape.position[1] + c;
      if (gridRow >= 0 && gridRow < grid.length && gridCol >= 0 && gridCol < grid.length) {
        newGrid[gridRow][gridCol] = null;
      }
    });
    
    setGrid(newGrid);
    setShapes(shapes.map(s => s.id === shapeId ? { ...s, placed: false, position: null } : s));
    setMessage('');
  };
  
  const getShapeAtPosition = (row, col) => {
    return shapes.find(shape => {
      if (!shape.placed || !shape.position) return false;
      return shape.cells.some(([r, c]) => {
        return shape.position[0] + r === row && shape.position[1] + c === col;
      });
    });
  };
  
  const handleCellClick = (row, col) => {
    const shapeAtCell = getShapeAtPosition(row, col);
    
    if (shapeAtCell) {
      removeShape(shapeAtCell.id);
    } else if (selectedShape) {
      placeShape(selectedShape, row, col);
    }
  };
  
  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();
    const shapeAtCell = getShapeAtPosition(row, col);
    
    if (shapeAtCell) {
      removeShape(shapeAtCell.id);
      rotateShape(shapeAtCell.id);
      setSelectedShape(shapeAtCell.id);
    }
  };
  
  const showSolution = () => {
    const level = LEVELS[currentLevel];
    if (!level.solution) {
      setMessage('❌ Aucune solution disponible pour ce niveau.');
      return;
    }
    
    const newGrid = Array(level.size).fill(null).map(() => Array(level.size).fill(null));
    
    const newShapes = shapes.map(shape => {
      const solutionStep = level.solution.find(s => s.shapeId === shape.id);
      if (solutionStep) {
        let currentCells = [...shape.cells];
        const rotations = solutionStep.rotation / 90;
        for (let i = 0; i < rotations; i++) {
          const maxRow = Math.max(...currentCells.map(([r, c]) => r));
          currentCells = currentCells.map(([r, c]) => [c, maxRow - r]);
        }
        
        currentCells.forEach(([r, c], idx) => {
          const row = solutionStep.position[0] + r;
          const col = solutionStep.position[1] + c;
          newGrid[row][col] = shape.values[idx];
        });
        
        return {
          ...shape,
          cells: currentCells,
          placed: true,
          position: solutionStep.position,
          rotation: solutionStep.rotation
        };
      }
      return shape;
    });
    
    setGrid(newGrid);
    setShapes(newShapes);
    setSelectedShape(null);
    setMessage('💡 Solution affichée ! Étudiez-la pour comprendre la logique.');
    
    setTimeout(() => checkCompletion(newGrid), 1000);
  };
  
  const resetLevel = () => {
    loadLevel(LEVELS[currentLevel]);
    setStartTime(Date.now());
    setElapsedTime(0);
  };
  
  const getZoneColor = (row, col) => {
    const zone = zones.find(z => z.cells.some(([r, c]) => r === row && c === col));
    return zone?.color || 'bg-white';
  };
  
  const getZoneLabel = (row, col) => {
    const zone = zones.find(z => z.cells.some(([r, c]) => r === row && c === col));
    if (zone?.type === 'summative' && zone.cells[0][0] === row && zone.cells[0][1] === col) {
      return `Σ=${zone.target}`;
    }
    if (zone?.type === 'equal' && zone.cells[0][0] === row && zone.cells[0][1] === col) {
      return '=';
    }
    if (zone?.type === 'distinct' && zone.cells[0][0] === row && zone.cells[0][1] === col) {
      return '≠';
    }
    return null;
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-indigo-600 mb-2">Fit & Figure</h1>
            <p className="text-gray-600">Jeu de logique et réflexion spatiale</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setGameState('playing')}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-lg"
            >
              <Play size={24} />
              Jouer
            </button>
            
            <button 
              onClick={() => setGameState('leaderboard')}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Trophy size={20} />
              Tableau d'honneur
            </button>
            
            <button 
              onClick={() => {
                setGameState('tutorial');
                setTutorialStep(0);
              }}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <HelpCircle size={20} />
              Tutoriel
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2">Règles du jeu :</h3>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• <strong>=</strong> : Zones égales (même chiffre)</li>
              <li>• <strong>≠</strong> : Zones distinctes (chiffres différents)</li>
              <li>• <strong>Σ</strong> : Zones sommatives (somme cible)</li>
            </ul>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Score total : {gameManager.score}</p>
            <p>Niveaux complétés : {gameManager.completedLevels.length}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (gameState === 'leaderboard') {
    const leaderboard = gameManager.getLeaderboard();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-green-600 flex items-center gap-2">
              <Trophy size={32} />
              Tableau d'honneur
            </h2>
            <button
              onClick={() => setGameState('menu')}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Aucun niveau complété pour le moment</p>
              <p className="text-gray-500">Jouez pour apparaître dans le classement !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.level} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Niveau {entry.level + 1}</p>
                      <p className="text-sm text-gray-600">{LEVELS[entry.level]?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatTime(entry.time)}</p>
                    <p className="text-xs text-gray-500">Meilleur temps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Score total</p>
                <p className="text-2xl font-bold text-green-600">{gameManager.score} pts</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Niveaux complétés</p>
                <p className="text-2xl font-bold text-green-600">{gameManager.completedLevels.length}/{LEVELS.length}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Retour au menu
          </button>
        </div>
      </div>
    );
  }
  
  if (gameState === 'tutorial') {
    const tutorialSteps = [
      {
        title: "Bienvenue dans Fit & Figure !",
        content: "Ce jeu de logique combine réflexion spatiale et raisonnement mathématique. Vous devez placer des formes numérotées sur une grille en respectant des contraintes.",
        image: "🎮"
      },
      {
        title: "Zones égales (=)",
        content: "Toutes les cases d'une zone égale doivent contenir le même chiffre. Par exemple, si une zone bleue a 3 cases, elles doivent toutes contenir le chiffre 4.",
        image: "🟦"
      },
      {
        title: "Zones distinctes (≠)",
        content: "Chaque case d'une zone distincte doit contenir un chiffre différent. Par exemple, une zone verte de 4 cases doit contenir 1, 2, 3 et 4 dans n'importe quel ordre.",
        image: "🟩"
      },
      {
        title: "Zones sommatives (Σ)",
        content: "La somme des chiffres dans une zone sommative doit égaler la valeur cible affichée. Par exemple, une zone marquée 'Σ=10' peut contenir 2, 3 et 5.",
        image: "🟨"
      },
      {
        title: "Comment jouer",
        content: "1) Sélectionnez une forme dans le panneau latéral\n2) Utilisez le bouton de rotation si nécessaire\n3) Cliquez sur la grille pour placer la forme\n4) Répétez jusqu'à remplir toute la grille",
        image: "🎯"
      },
      {
        title: "Conseils",
        content: "• Analysez d'abord toutes les contraintes\n• Commencez par les zones les plus restrictives\n• Placez les grandes formes en premier\n• N'hésitez pas à recommencer si nécessaire",
        image: "💡"
      }
    ];
    
    const step = tutorialSteps[tutorialStep];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
              <HelpCircle size={32} />
              Tutoriel
            </h2>
            <button
              onClick={() => setGameState('menu')}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-12 mx-1 rounded-full transition ${
                    index === tutorialStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{step.image}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
            <p className="text-gray-600 text-lg whitespace-pre-line">{step.content}</p>
          </div>
          
          <div className="flex gap-4">
            {tutorialStep > 0 && (
              <button
                onClick={() => setTutorialStep(tutorialStep - 1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Précédent
              </button>
            )}
            
            {tutorialStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={() => setGameState('playing')}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Commencer à jouer !
              </button>
            )}
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Retour au menu
          </button>
        </div>
      </div>
    );
  }
  
  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Victoire !</h2>
          <p className="text-gray-600 mb-4">Vous avez terminé le niveau {currentLevel + 1}</p>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Temps</p>
            <p className="text-3xl font-bold text-green-600">{formatTime(elapsedTime)}</p>
          </div>
          
          <div className="space-y-3">
            {currentLevel < LEVELS.length - 1 && (
              <button
                onClick={() => {
                  setCurrentLevel(currentLevel + 1);
                  setGameState('playing');
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Niveau suivant
              </button>
            )}
            
            <button
              onClick={() => {
                setGameState('playing');
                resetLevel();
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Rejouer
            </button>
            
            <button
              onClick={() => setGameState('menu')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Menu principal
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-indigo-600">Niveau {currentLevel + 1}</h2>
            <p className="text-sm text-gray-600">{LEVELS[currentLevel].name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Temps</p>
              <p className="text-lg font-bold text-indigo-600">{formatTime(elapsedTime)}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => checkCompletion(grid)}
                className="p-2 bg-green-200 rounded-lg hover:bg-green-300 transition flex items-center gap-1 px-3"
                title="Vérifier la solution"
              >
                <Trophy size={20} />
                <span className="text-sm font-semibold">Vérifier</span>
              </button>
              <button
                onClick={showSolution}
                className="p-2 bg-yellow-200 rounded-lg hover:bg-yellow-300 transition flex items-center gap-1 px-3"
                title="Voir la solution"
              >
                <HelpCircle size={20} />
                <span className="text-sm font-semibold">Solution</span>
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                title="Menu"
              >
                <Home size={20} />
              </button>
              <button
                onClick={resetLevel}
                className="p-2 bg-indigo-200 rounded-lg hover:bg-indigo-300 transition"
                title="Recommencer"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg mb-4 text-center font-semibold ${
            message.includes('Félicitations') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
            {LEVELS[currentLevel].hint && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                <p className="text-sm text-green-800 font-semibold">
                  💡 {LEVELS[currentLevel].hint}
                </p>
              </div>
            )}
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>⌨️ Contrôles :</strong> Clic gauche pour retirer | Clic droit pour pivoter et retirer
              </p>
            </div>
            
            <div className="inline-grid gap-1" style={{
              gridTemplateColumns: `repeat(${grid.length}, 60px)`
            }}>
              {grid.map((row, r) => row.map((cell, c) => {
                const shapeAtCell = getShapeAtPosition(r, c);
                const isPlacedShape = cell !== null;
                
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleCellRightClick(e, r, c)}
                    className={`w-14 h-14 border-2 rounded flex items-center justify-center font-bold text-xl transition relative ${
                      isPlacedShape 
                        ? 'border-indigo-500 cursor-pointer hover:border-red-500 hover:bg-red-50' 
                        : selectedShape 
                          ? 'border-gray-300 cursor-pointer hover:border-indigo-400' 
                          : 'border-gray-300'
                    } ${getZoneColor(r, c)}`}
                    title={isPlacedShape ? 'Cliquez pour retirer | Clic droit pour pivoter et retirer' : selectedShape ? 'Cliquez pour placer' : ''}
                  >
                    {cell !== null && cell}
                    {getZoneLabel(r, c) && (
                      <span className="absolute top-0 right-1 text-xs font-semibold opacity-50">
                        {getZoneLabel(r, c)}
                      </span>
                    )}
                    {isPlacedShape && (
                      <span className="absolute bottom-0 right-1 text-xs font-bold text-indigo-600 opacity-70">
                        ×
                      </span>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Formes disponibles</h3>
            
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-800">
                <strong>📋 Légende :</strong><br/>
                = : Même chiffre partout<br/>
                ≠ : Tous différents<br/>
                Σ=X : Somme = X
              </p>
            </div>
            
            <div className="space-y-4">
              {shapes.filter(s => !s.placed).map(shape => (
                <div key={shape.id} className="border-2 border-gray-300 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Forme {shape.id}</span>
                    <button
                      onClick={() => rotateShape(shape.id)}
                      className="p-1 bg-indigo-100 rounded hover:bg-indigo-200 transition"
                      title="Rotation"
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSelectedShape(selectedShape === shape.id ? null : shape.id)}
                    className={`w-full p-2 rounded transition ${
                      selectedShape === shape.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="inline-grid gap-1" style={{
                      gridTemplateColumns: `repeat(${Math.max(...shape.cells.map(([r,c]) => c)) + 1}, 30px)`,
                      gridTemplateRows: `repeat(${Math.max(...shape.cells.map(([r,c]) => r)) + 1}, 30px)`
                    }}>
                      {Array.from({ length: (Math.max(...shape.cells.map(([r,c]) => r)) + 1) * (Math.max(...shape.cells.map(([r,c]) => c)) + 1) }).map((_, index) => {
                        const row = Math.floor(index / (Math.max(...shape.cells.map(([r,c]) => c)) + 1));
                        const col = index % (Math.max(...shape.cells.map(([r,c]) => c)) + 1);
                        const cellIndex = shape.cells.findIndex(([r, c]) => r === row && c === col);
                        
                        if (cellIndex !== -1) {
                          return (
                            <div key={index} className="w-7 h-7 bg-indigo-300 rounded flex items-center justify-center text-xs font-bold">
                              {shape.values[cellIndex]}
                            </div>
                          );
                        }
                        return <div key={index} className="w-7 h-7"></div>;
                      })}
                    </div>
                  </button>
                </div>
              ))}
            </div>
            
            {shapes.filter(s => !s.placed).length === 0 && (
              <div className="text-center py-4">
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <p className="font-bold text-green-800 text-lg mb-2">✅ Toutes les formes sont placées !</p>
                  <p className="text-sm text-green-700">Vérification en cours...</p>
                </div>
              </div>
            )}
            
            {shapes.filter(s => s.placed).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Formes placées</h3>
                <div className="space-y-2">
                  {shapes.filter(s => s.placed).map(shape => (
                    <div key={shape.id} className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                      <span className="font-semibold text-sm text-green-700">Forme {shape.id}</span>
                      <button
                        onClick={() => removeShape(shape.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-semibold"
                        title="Retirer la forme"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
