import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import WalletButton from './WalletButton';
import Leaderboard from './Leaderboard';
import { checkDevilBorisNFT, useSubmitScore, useClaimTokens, useMintDevilBoris } from '../hooks/useOneChain';
import { explorerTxUrl, publicAssetUrl } from '../lib/onechain';

// ═══════════════════════════════════════
// BORKA - GameFi on OneChain OCT
// A platformer where nothing is as it seems
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GRAVITY = 900;
const JUMP_FORCE = -440;
const MOVE_SPEED = 230;
const MAX_FALL_SPEED = 900;
const MAX_JUMPS = 2;

const SKINS = {
  default: {
    id: 'default',
    name: 'Classic Borka',
    body: '#4ab8e8',
    bodyDark: '#3a8ab8',
    horn: '#8B4513',
    iris: '#2a7aa8',
    unlocked: true,
    nftRequired: false,
  },
  fire: {
    id: 'fire',
    name: 'Fire Borka',
    body: '#ff6b35',
    bodyDark: '#cc4a1a',
    horn: '#cc1144',
    iris: '#ff3300',
    unlocked: true,
    nftRequired: false,
  },
  ice: {
    id: 'ice',
    name: 'Ice Borka',
    body: '#a8d8ea',
    bodyDark: '#4a90d9',
    horn: '#4a90d9',
    iris: '#00bfff',
    unlocked: true,
    nftRequired: false,
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow Borka',
    body: '#3d3d3d',
    bodyDark: '#1a1a1a',
    horn: '#666666',
    iris: '#9b59b6',
    unlocked: true,
    nftRequired: false,
  },
  devil: {
    id: 'devil',
    name: 'Devil Borka',
    body: '#cc0000',
    bodyDark: '#800000',
    horn: '#8b0000',
    iris: '#ff0000',
    unlocked: false,
    nftRequired: true,
  },
};

// ═══════════════════════════════════════
// LEVEL DEFINITIONS
// ═══════════════════════════════════════

const LEVELS = [
  // L1 "Easy?"
  {
    name: 'Easy?',
    bg: '#0d0d1a',
    story: 'Start here... or not.',
    playerStart: [50, 400],
    goal: { x: 720, y: 150, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 800, h: 40, color: '#5C3D1E' },
      { x: 200, y: 380, w: 120, h: 20, color: '#8B6340' },
      { x: 400, y: 300, w: 120, h: 20, color: '#8B6340' },
      { x: 600, y: 220, w: 150, h: 20, color: '#8B6340' },
    ],
    traps: [
      {
        type: 'floor_drop',
        platformIdx: 0,
        triggerXMin: 300,
        triggerXMax: 500,
        delay: 0.5,
        dropTimer: 0,
        dropped: false,
        dropSpeed: 400,
      },
    ],
    coins: [
      { x: 100, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 260, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 460, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 660, y: 180, r: 10, collected: false, bobOffset: 0 },
      { x: 350, y: 400, r: 10, collected: false, bobOffset: 0 },
      { x: 550, y: 320, r: 10, collected: false, bobOffset: 0 },
      { x: 700, y: 240, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L2 "Watch Your Step"
  {
    name: 'Watch Your Step',
    bg: '#0a1a0a',
    story: 'Spikes ahead.',
    playerStart: [50, 400],
    goal: { x: 720, y: 100, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 200, h: 40, color: '#5C3D1E' },
      { x: 250, y: 380, w: 150, h: 20, color: '#8B6340' },
      { x: 450, y: 300, w: 150, h: 20, color: '#8B6340' },
      { x: 650, y: 180, w: 150, h: 20, color: '#8B6340' },
    ],
    traps: [
      {
        type: 'rising_spikes',
        x: 200,
        y: 460,
        w: 50,
        h: 28,
        delay: 1.5,
        riseTimer: 0,
        risen: false,
      },
      {
        type: 'moving_spike',
        x: 450,
        y: 272,
        w: 30,
        h: 28,
        axis: 'x',
        min: 450,
        max: 570,
        speed: 100,
        dir: 1,
      },
    ],
    coins: [
      { x: 100, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 320, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 520, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 720, y: 140, r: 10, collected: false, bobOffset: 0 },
      { x: 230, y: 350, r: 10, collected: false, bobOffset: 0 },
      { x: 500, y: 270, r: 10, collected: false, bobOffset: 0 },
      { x: 700, y: 150, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L3 "Trust Issues"
  {
    name: 'Trust Issues',
    bg: '#1a0a0a',
    story: 'Some platforms are fake.',
    playerStart: [50, 400],
    goal: { x: 720, y: 80, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 150, h: 40, color: '#5C3D1E' },
      { x: 200, y: 380, w: 120, h: 20, color: '#8B6340', fake: true, fakeTimer: 0, fakeTouched: false },
      { x: 350, y: 300, w: 120, h: 20, color: '#8B6340' },
      { x: 500, y: 220, w: 120, h: 20, color: '#8B6340', fake: true, fakeTimer: 0, fakeTouched: false },
      { x: 650, y: 160, w: 150, h: 20, color: '#8B6340' },
    ],
    traps: [
      {
        type: 'ceiling_spikes',
        x: 0,
        y: 0,
        w: 800,
        delay: 4,
        fallTimer: 0,
        fallen: false,
        fallenY: 0,
      },
    ],
    coins: [
      { x: 75, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 410, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 710, y: 120, r: 10, collected: false, bobOffset: 0 },
      { x: 260, y: 350, r: 10, collected: false, bobOffset: 0 },
      { x: 560, y: 190, r: 10, collected: false, bobOffset: 0 },
      { x: 720, y: 130, r: 10, collected: false, bobOffset: 0 },
      { x: 400, y: 270, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L4 "Keep Moving"
  {
    name: 'Keep Moving',
    bg: '#0a0a1a',
    story: 'Stay on the platforms.',
    playerStart: [50, 400],
    goal: { x: 720, y: 50, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 150, h: 40, color: '#5C3D1E' },
      { x: 200, y: 380, w: 100, h: 20, color: '#8B6340', move: { axis: 'y', min: 300, max: 400, speed: 80, dir: -1 } },
      { x: 350, y: 300, w: 100, h: 20, color: '#8B6340', move: { axis: 'x', min: 350, max: 450, speed: 90, dir: 1 } },
      { x: 550, y: 220, w: 100, h: 20, color: '#8B6340', move: { axis: 'y', min: 150, max: 250, speed: 85, dir: 1 } },
      { x: 700, y: 130, w: 100, h: 20, color: '#8B6340' },
    ],
    traps: [
      {
        type: 'moving_spike',
        x: 0,
        y: 432,
        w: 30,
        h: 28,
        axis: 'x',
        min: 0,
        max: 750,
        speed: 140,
        dir: 1,
      },
      {
        type: 'moving_spike',
        x: 750,
        y: 432,
        w: 30,
        h: 28,
        axis: 'x',
        min: 0,
        max: 750,
        speed: 140,
        dir: -1,
      },
    ],
    coins: [
      { x: 75, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 250, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 400, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 600, y: 180, r: 10, collected: false, bobOffset: 0 },
      { x: 750, y: 90, r: 10, collected: false, bobOffset: 0 },
      { x: 350, y: 270, r: 10, collected: false, bobOffset: 0 },
      { x: 550, y: 190, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L5 "Down Is Up"
  {
    name: 'Down Is Up',
    bg: '#1a0a1a',
    story: 'Gravity... reversed?',
    playerStart: [50, 400],
    goal: { x: 100, y: 50, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 350, h: 40, color: '#5C3D1E' },
      { x: 450, y: 380, w: 150, h: 20, color: '#8B6340' },
      { x: 650, y: 300, w: 150, h: 20, color: '#8B6340' },
      { x: 0, y: 130, w: 200, h: 20, color: '#8B6340' },
    ],
    traps: [
      {
        type: 'gravity_flip',
        triggerX: 350,
        flipped: false,
        duration: 3.5,
        flipTimer: 0,
      },
      {
        type: 'moving_spike',
        x: 400,
        y: 28,
        w: 30,
        h: 28,
        axis: 'x',
        min: 400,
        max: 700,
        speed: 110,
        dir: 1,
      },
    ],
    coins: [
      { x: 150, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 300, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 520, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 720, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 100, y: 90, r: 10, collected: false, bobOffset: 0 },
      { x: 150, y: 100, r: 10, collected: false, bobOffset: 0 },
      { x: 250, y: 420, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L6 "Speed Run"
  {
    name: 'Speed Run',
    bg: '#0a1a1a',
    story: 'Keep running!',
    playerStart: [50, 400],
    goal: { x: 720, y: 200, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 150, h: 40, color: '#5C3D1E' },
      { x: 140, y: 400, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 210, y: 350, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 280, y: 300, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 350, y: 250, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 420, y: 300, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 490, y: 350, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 560, y: 300, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 630, y: 250, w: 80, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 700, y: 280, w: 100, h: 20, color: '#5C3D1E' },
    ],
    traps: [
      {
        type: 'rising_spikes',
        x: 250,
        y: 460,
        w: 300,
        h: 28,
        delay: 5,
        riseTimer: 0,
        risen: false,
      },
    ],
    coins: [
      { x: 75, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 180, y: 360, r: 10, collected: false, bobOffset: 0 },
      { x: 320, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 460, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 600, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 750, y: 240, r: 10, collected: false, bobOffset: 0 },
      { x: 390, y: 210, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L7 "Closing In"
  {
    name: 'Closing In',
    bg: '#150015',
    story: 'The wall is coming...',
    playerStart: [50, 400],
    goal: { x: 720, y: 50, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 200, h: 40, color: '#5C3D1E' },
      { x: 250, y: 380, w: 120, h: 20, color: '#8B6340' },
      { x: 420, y: 300, w: 120, h: 20, color: '#8B6340' },
      { x: 590, y: 220, w: 120, h: 20, color: '#8B6340' },
      { x: 700, y: 130, w: 100, h: 20, color: '#8B6340' },
    ],
    traps: [
      {
        type: 'wall',
        x: -50,
        y: 0,
        w: 50,
        h: 500,
        speed: 18,
        maxX: 350,
        delay: 2,
        startTimer: 0,
        started: false,
      },
      {
        type: 'ceiling_spikes',
        x: 200,
        y: 0,
        w: 600,
        delay: 5,
        fallTimer: 0,
        fallen: false,
        fallenY: 0,
      },
      {
        type: 'moving_spike',
        x: 0,
        y: 432,
        w: 30,
        h: 28,
        axis: 'x',
        min: 0,
        max: 700,
        speed: 130,
        dir: 1,
      },
      {
        type: 'moving_spike',
        x: 700,
        y: 432,
        w: 30,
        h: 28,
        axis: 'x',
        min: 0,
        max: 700,
        speed: 130,
        dir: -1,
      },
    ],
    coins: [
      { x: 100, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 310, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 480, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 650, y: 180, r: 10, collected: false, bobOffset: 0 },
      { x: 750, y: 90, r: 10, collected: false, bobOffset: 0 },
      { x: 420, y: 270, r: 10, collected: false, bobOffset: 0 },
      { x: 590, y: 190, r: 10, collected: false, bobOffset: 0 },
    ],
  },
  // L8 "Devil's Den"
  {
    name: "Devil's Den",
    bg: '#200000',
    story: 'The final challenge.',
    playerStart: [50, 400],
    goal: { x: 380, y: 80, w: 50, h: 80 },
    platforms: [
      { x: 0, y: 460, w: 200, h: 40, color: '#5C3D1E' },
      { x: 250, y: 380, w: 100, h: 20, color: '#8B6340', move: { axis: 'y', min: 320, max: 400, speed: 70, dir: -1 } },
      { x: 400, y: 300, w: 100, h: 20, color: '#8B6340', crumble: true, crumbleActive: false, crumbleTimer: 0, crumbled: false },
      { x: 550, y: 220, w: 100, h: 20, color: '#8B6340', fake: true, fakeTimer: 0, fakeTouched: false },
      { x: 350, y: 160, w: 120, h: 20, color: '#8B6340' },
      { x: 600, y: 380, w: 200, h: 20, color: '#5C3D1E' },
    ],
    traps: [
      {
        type: 'moving_spike',
        x: 0,
        y: 432,
        w: 30,
        h: 28,
        axis: 'x',
        min: 0,
        max: 770,
        speed: 200,
        dir: 1,
      },
      {
        type: 'floor_drop',
        platformIdx: 0,
        triggerXMin: 100,
        triggerXMax: 150,
        delay: 1,
        dropTimer: 0,
        dropped: false,
        dropSpeed: 400,
      },
      {
        type: 'rising_spikes',
        x: 200,
        y: 460,
        w: 150,
        h: 28,
        delay: 2,
        riseTimer: 0,
        risen: false,
      },
      {
        type: 'gravity_flip',
        triggerX: 400,
        flipped: false,
        duration: 2,
        flipTimer: 0,
      },
      {
        type: 'wall',
        x: 850,
        y: 0,
        w: 50,
        h: 500,
        speed: -22,
        maxX: 500,
        delay: 3,
        startTimer: 0,
        started: false,
      },
    ],
    coins: [
      { x: 100, y: 420, r: 10, collected: false, bobOffset: 0 },
      { x: 300, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 450, y: 260, r: 10, collected: false, bobOffset: 0 },
      { x: 410, y: 120, r: 10, collected: false, bobOffset: 0 },
      { x: 650, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 750, y: 340, r: 10, collected: false, bobOffset: 0 },
      { x: 350, y: 130, r: 10, collected: false, bobOffset: 0 },
    ],
  },
];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

const BorkaGame = () => {
  const canvasRef = useRef(null);
  const [gameScreen, setGameScreen] = useState('intro');
  const [displayDeaths, setDisplayDeaths] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [activeSkin, setActiveSkin] = useState('default');
  const [hasDevilNFT, setHasDevilNFT] = useState(false);
  const [nftTxDigest, setNftTxDigest] = useState(null);

  // Game state refs
  const gameScreenRef = useRef('intro');
  const currentLevelRef = useRef(0);
  const totalDeathsRef = useRef(0);
  const totalCoinsRef = useRef(0);
  const levelCoinsRef = useRef(0);
  const unlockedLevelsRef = useRef(new Set([0]));

  // OneChain blockchain hooks
  const { address, isConnected, shortAddress } = useWallet();
  const {
    submitScore,
    isPending: isSubmitting,
    txDigest: scoreTxDigest,
    error: submitScoreError,
    reset: resetSubmitScore,
  } = useSubmitScore();
  const {
    claimTokens,
    isPending: isClaiming,
    txDigest: claimTxDigest,
    error: claimTokensError,
    reset: resetClaimTokens,
  } = useClaimTokens();
  const {
    mintNFT,
    isPending: isMintingNFT,
    txDigest: nftMintDigest,
    error: mintNftError,
    reset: resetMintNFT,
  } = useMintDevilBoris();

  // Track game start time for elapsed time scoring
  const gameStartTimeRef = useRef(Date.now());

  // Game objects refs
  const playerRef = useRef(null);
  const platformsRef = useRef([]);
  const trapsRef = useRef([]);
  const coinsRef = useRef([]);
  const particlesRef = useRef([]);

  // Game state
  const gravityFlippedRef = useRef(false);
  const shakeRef = useRef(0);
  const keysRef = useRef(new Set());
  const lastTimeRef = useRef(0);
  const rafRef = useRef(0);
  const updateRef = useRef(null);
  const timeoutRef = useRef(null);
  const messageRef = useRef({ text: '', time: 0, color: '#ff3366' });
  const hudUpdateTimerRef = useRef(0);

  // Sync gameScreen ref with state
  useEffect(() => {
    gameScreenRef.current = gameScreen;
  }, [gameScreen]);

  useEffect(() => {
    if (scoreTxDigest) {
      setLeaderboardRefreshKey((key) => key + 1);
      const timeoutId = window.setTimeout(() => {
        setLeaderboardRefreshKey((key) => key + 1);
      }, 2000);
      return () => window.clearTimeout(timeoutId);
    }
  }, [scoreTxDigest]);

  useEffect(() => {
    if (gameScreen === 'worldmap') {
      setLeaderboardRefreshKey((key) => key + 1);
    }
  }, [gameScreen]);

  useEffect(() => {
    if (!isConnected || !address) {
      setHasDevilNFT(false);
      if (activeSkin === 'devil') {
        setActiveSkin('default');
      }
      return;
    }

    let cancelled = false;
    checkDevilBorisNFT(address).then((has) => {
      if (cancelled) return;
      setHasDevilNFT(has);
      if (!has && activeSkin === 'devil') {
        setActiveSkin('default');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isConnected, address, activeSkin]);

  useEffect(() => {
    if (nftMintDigest) {
      setNftTxDigest(nftMintDigest);
      setHasDevilNFT(true);
      setActiveSkin('devil');
    }
  }, [nftMintDigest]);

  const resetRunState = (nextScreen = 'worldmap') => {
    currentLevelRef.current = 0;
    totalDeathsRef.current = 0;
    totalCoinsRef.current = 0;
    unlockedLevelsRef.current = new Set([0]);
    gameStartTimeRef.current = Date.now();
    setNftTxDigest(null);
    resetSubmitScore();
    resetClaimTokens();
    resetMintNFT();
    setGameScreen(nextScreen);
  };

  // ═══════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════

  const makePlayer = (x, y) => ({
    x,
    y,
    w: 40,
    h: 44,
    vx: 0,
    vy: 0,
    onGround: false,
    jumps: 0,
    maxJumps: MAX_JUMPS,
    alive: true,
    state: 'idle',
    animFrame: 0,
    facingRight: true,
  });

  const spawnParticles = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02,
        r: Math.random() * 4 + 2,
        color,
      });
    }
    if (particlesRef.current.length > 200) {
      particlesRef.current = particlesRef.current.slice(-200);
    }
  };

  const spawnConfetti = (x, y, count) => {
    const colors = ['#ffd700', '#ff8c00', '#ffffff'];
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 2,
        life: 1,
        decay: 0.015,
        r: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        isRect: true,
        rotation: Math.random() * Math.PI * 2,
        rw: 8,
        rh: 4,
      });
    }
  };

  const showMessage = (text, color = '#ff3366') => {
    messageRef.current = { text, time: 0.8, color };
  };

  const playerDie = () => {
    const player = playerRef.current;
    if (!player || !player.alive) return;

    player.alive = false;
    player.state = 'dead';
    totalDeathsRef.current++;
    shakeRef.current = 16;

    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff3366', 35);
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#888888', 20);
    showMessage('💀 DEAD!', '#ff3366');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      initLevel(currentLevelRef.current);
    }, 1000);
  };

  const levelComplete = () => {
    const player = playerRef.current;
    if (!player) return;

    setGameScreen('levelComplete');
    player.state = 'victory';
    spawnConfetti(player.x + player.w / 2, player.y + player.h / 2, 60);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      totalCoinsRef.current += levelCoinsRef.current;
      unlockedLevelsRef.current.add(currentLevelRef.current + 1);

      if (currentLevelRef.current >= 7) {
        // Submit score to chain if wallet connected (all 8 levels complete)
        if (isConnected) {
          const elapsed = Date.now() - gameStartTimeRef.current;
          submitScore({
            coins: totalCoinsRef.current,
            deaths: totalDeathsRef.current,
            timeMs: elapsed,
          });
        }
        setGameScreen('win');
      } else {
        currentLevelRef.current++;
        initLevel(currentLevelRef.current);
        setGameScreen('playing');
      }
    }, 2000);
  };

  const initLevel = (levelIdx) => {
    if (levelIdx < 0 || levelIdx >= LEVELS.length) return;

    const level = LEVELS[levelIdx];

    // Reset gravity
    gravityFlippedRef.current = false;

    // Reset coins
    levelCoinsRef.current = 0;

    // Reset particles
    particlesRef.current = [];

    // Reset shake
    shakeRef.current = 0;

    // Deep copy platforms
    platformsRef.current = JSON.parse(JSON.stringify(level.platforms));

    // Deep copy traps
    trapsRef.current = JSON.parse(JSON.stringify(level.traps));

    // Deep copy coins
    coinsRef.current = JSON.parse(JSON.stringify(level.coins));

    // Create player
    playerRef.current = makePlayer(level.playerStart[0], level.playerStart[1]);

    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // ═══════════════════════════════════════
  // COLLISION DETECTION
  // ═══════════════════════════════════════

  const resolveCollision = (player, platforms, dt) => {
    const gravityFlipped = gravityFlippedRef.current;

    for (const plat of platforms) {
      if (plat.crumbled) continue;

      const px = player.x;
      const py = player.y;
      const pw = player.w;
      const ph = player.h;

      // AABB overlap check
      if (px + pw > plat.x && px < plat.x + plat.w && py + ph > plat.y && py < plat.y + plat.h) {
        const overlapLeft = px + pw - plat.x;
        const overlapRight = plat.x + plat.w - px;
        const overlapTop = py + ph - plat.y;
        const overlapBottom = plat.y + plat.h - py;

        const minH = Math.min(overlapLeft, overlapRight);
        const minV = Math.min(overlapTop, overlapBottom);

        if (!gravityFlipped) {
          if (minV <= minH) {
            if (overlapTop < overlapBottom) {
              // Landing on top
              player.y = plat.y - player.h;
              player.vy = 0;
              player.onGround = true;
              player.jumps = 0;

              // Crumble check
              if (plat.crumble && !plat.crumbleActive) {
                plat.crumbleActive = true;
              }

              // Fake platform check
              if (plat.fake && !plat.fakeTouched) {
                plat.fakeTouched = true;
                plat.fakeTimer = 0;
              }
            } else {
              // Hit underside
              player.y = plat.y + plat.h;
              if (player.vy < 0) player.vy = 0;
            }
          } else {
            // Side collision
            if (overlapLeft < overlapRight) {
              player.x = plat.x - player.w;
            } else {
              player.x = plat.x + plat.w;
            }
            player.vx = 0;
          }
        } else {
          // Gravity flipped
          if (minV <= minH) {
            if (overlapBottom < overlapTop) {
              // Landing on ceiling (new ground)
              player.y = plat.y + plat.h;
              player.vy = 0;
              player.onGround = true;
              player.jumps = 0;

              if (plat.crumble && !plat.crumbleActive) {
                plat.crumbleActive = true;
              }

              if (plat.fake && !plat.fakeTouched) {
                plat.fakeTouched = true;
                plat.fakeTimer = 0;
              }
            } else {
              // Hit floor (now ceiling)
              player.y = plat.y - player.h;
              if (player.vy > 0) player.vy = 0;
            }
          } else {
            // Side collision
            if (overlapLeft < overlapRight) {
              player.x = plat.x - player.w;
            } else {
              player.x = plat.x + plat.w;
            }
            player.vx = 0;
          }
        }
      }
    }
  };

  const checkTrapCollision = (player, trap) => {
    const px = player.x;
    const py = player.y;
    const pw = player.w;
    const ph = player.h;

    if (trap.type === 'rising_spikes' && trap.risen) {
      const tx = trap.x;
      const ty = trap.y - trap.h;
      const tw = trap.w;
      const th = trap.h;
      return px + pw > tx && px < tx + tw && py + ph > ty && py < ty + th;
    }

    if (trap.type === 'ceiling_spikes' && trap.fallen && trap.fallenY > 10) {
      const tx = trap.x;
      const ty = trap.fallenY;
      const tw = trap.w;
      const th = 28;
      return px + pw > tx && px < tx + tw && py + ph > ty && py < ty + th;
    }

    if (trap.type === 'moving_spike') {
      const tx = trap.x;
      const ty = trap.y;
      const tw = trap.w;
      const th = trap.h;
      return px + pw > tx && px < tx + tw && py + ph > ty && py < ty + th;
    }

    if (trap.type === 'wall') {
      const tx = trap.x;
      const ty = trap.y;
      const tw = trap.w;
      const th = trap.h;
      return px + pw > tx && px < tx + tw && py + ph > ty && py < ty + th;
    }

    return false;
  };

  // ═══════════════════════════════════════
  // GAME UPDATE LOOP
  // ═══════════════════════════════════════

  const update = (time) => {
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const currentScreen = gameScreenRef.current;

    // Update HUD display at reduced rate
    hudUpdateTimerRef.current += dt;
    if (hudUpdateTimerRef.current >= 0.25) {
      setDisplayDeaths(totalDeathsRef.current);
      setDisplayCoins(levelCoinsRef.current);
      hudUpdateTimerRef.current = 0;
    }

    // Update message timer
    if (messageRef.current.time > 0) {
      messageRef.current.time -= dt;
    }

    if (currentScreen === 'playing') {
      const player = playerRef.current;
      const platforms = platformsRef.current;
      const traps = trapsRef.current;
      const coins = coinsRef.current;
      const level = LEVELS[currentLevelRef.current];

      if (player && player.alive) {
        // Apply gravity
        const gravityForce = gravityFlippedRef.current ? -GRAVITY : GRAVITY;
        player.vy += gravityForce * dt;
        player.vy = Math.max(-MAX_FALL_SPEED, Math.min(MAX_FALL_SPEED, player.vy));

        // Apply input
        let moveDir = 0;
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) moveDir -= 1;
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) moveDir += 1;

        player.vx = moveDir * MOVE_SPEED;
        if (moveDir !== 0) player.facingRight = moveDir > 0;

        // Reset ground state BEFORE movement so collision sets it correctly
        player.onGround = false;

        // Move
        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Collision resolution
        resolveCollision(player, platforms, dt);

        // Boundary clamp
        player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.w, player.x));

        // Death check (fall out of bounds)
        if (player.y > CANVAS_HEIGHT + 100 || player.y < -200) {
          playerDie();
        }

        // Update platforms
        for (const plat of platforms) {
          if (plat.move) {
            plat[plat.move.axis] += plat.move.speed * plat.move.dir * dt;
            if (plat[plat.move.axis] <= plat.move.min || plat[plat.move.axis] >= plat.move.max) {
              plat.move.dir *= -1;
            }
          }

          if (plat.crumbleActive && !plat.crumbled) {
            plat.crumbleTimer += dt;
            if (plat.crumbleTimer >= 0.8) {
              plat.crumbled = true;
            }
          }

          if (plat.fakeTimer !== undefined && plat.fakeTouched && !plat.crumbled) {
            plat.fakeTimer += dt;
            if (plat.fakeTimer >= 0.25) {
              plat.crumbled = true;
              showMessage('😈 FAKE!', '#ff3366');
            }
          }
        }

        // Update traps
        for (const trap of traps) {
          if (trap.type === 'floor_drop') {
            if (player.x >= trap.triggerXMin && player.x <= trap.triggerXMax && !trap.dropped) {
              trap.dropTimer += dt;
              if (trap.dropTimer >= trap.delay && !trap.dropped) {
                trap.dropped = true;
                showMessage('😈 GOT YA!', '#ff3366');
                shakeRef.current = 12;
              }
            }
            if (trap.dropped && platforms[trap.platformIdx]) {
              platforms[trap.platformIdx].y += trap.dropSpeed * dt;
            }
          }

          if (trap.type === 'rising_spikes') {
            trap.riseTimer += dt;
            if (trap.riseTimer >= trap.delay) {
              trap.risen = true;
            }
          }

          if (trap.type === 'ceiling_spikes') {
            trap.fallTimer += dt;
            if (trap.fallTimer >= trap.delay) {
              trap.fallen = true;
              trap.fallenY = Math.min(trap.fallenY + 400 * dt, 60);
            }
          }

          if (trap.type === 'moving_spike') {
            trap[trap.axis] += trap.speed * trap.dir * dt;
            if (trap[trap.axis] <= trap.min || trap[trap.axis] >= trap.max) {
              trap.dir *= -1;
            }
          }

          if (trap.type === 'gravity_flip') {
            if (player.x > trap.triggerX && !trap.flipped && !trap.usedOnce) {
              trap.flipped = true;
              gravityFlippedRef.current = !gravityFlippedRef.current;
              player.vy = gravityFlippedRef.current ? 350 : -350;
              shakeRef.current = 14;
            }
            if (trap.flipped) {
              trap.flipTimer += dt;
              if (trap.flipTimer >= trap.duration) {
                gravityFlippedRef.current = !gravityFlippedRef.current;
                trap.flipTimer = 0;
                trap.flipped = false;
                trap.usedOnce = true;
              }
            }
          }

          if (trap.type === 'wall') {
            trap.startTimer += dt;
            if (trap.startTimer >= trap.delay && !trap.started) {
              trap.started = true;
            }
            if (trap.started) {
              const targetX = trap.speed > 0 ? trap.maxX : trap.maxX;
              if ((trap.speed > 0 && trap.x < targetX) || (trap.speed < 0 && trap.x > targetX)) {
                trap.x += trap.speed * dt;
              }
            }
          }

          // Check trap collision
          if (checkTrapCollision(player, trap)) {
            playerDie();
          }
        }

        // Update coins
        for (const coin of coins) {
          if (!coin.collected) {
            coin.bobOffset = Math.sin(time * 0.002) * 2;

            // Check collection
            const dx = player.x + player.w / 2 - coin.x;
            const dy = player.y + player.h / 2 - (coin.y + coin.bobOffset);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < player.w / 2 + coin.r) {
              coin.collected = true;
              levelCoinsRef.current++;
              spawnParticles(coin.x, coin.y, '#ffd700', 8);
            }
          }
        }

        // Check goal (guard against multi-call before state update)
        if (
          gameScreenRef.current === 'playing' &&
          player.x + player.w > level.goal.x &&
          player.x < level.goal.x + level.goal.w &&
          player.y + player.h > level.goal.y &&
          player.y < level.goal.y + level.goal.h
        ) {
          levelComplete();
        }

        // Determine Borka state
        if (player.alive) {
          if (!player.onGround && player.vy < -50) {
            player.state = 'jumping';
          } else if (!player.onGround && player.vy > 50) {
            player.state = 'falling';
          } else if (Math.abs(player.vx) > 10) {
            player.state = 'running';
          } else {
            player.state = 'idle';
          }
        }

        player.animFrame++;
      }
    }

    // Spawn win confetti before particle update
    if (currentScreen === 'win' && particlesRef.current.length < 100) {
      spawnConfetti(Math.random() * CANVAS_WIDTH, 0, 2);
    }

    // Update particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.life -= p.decay;
      if (p.rotation !== undefined) p.rotation += 0.15;
      // Loop confetti on win screen; otherwise remove when life expires
      if (currentScreen === 'win' && p.y > CANVAS_HEIGHT) {
        p.y = 0;
        p.x = Math.random() * CANVAS_WIDTH;
        p.life = 1;
      } else if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Reduce shake
    if (shakeRef.current > 0) {
      shakeRef.current -= dt * 30;
      if (shakeRef.current < 0) shakeRef.current = 0;
    }

    // === RENDER ===
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (currentScreen === 'playing' || currentScreen === 'levelComplete') {
        drawGame(ctx, time);
      }
      if (currentScreen === 'win') {
        ctx.fillStyle = '#1a0a2e';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (const p of particlesRef.current) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          if (p.isRect && p.rotation !== undefined) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillRect(-p.rw / 2, -p.rh / 2, p.rw, p.rh);
            ctx.restore();
          }
        }
        ctx.globalAlpha = 1;
        const bigBoris = {
          x: CANVAS_WIDTH / 2 - 60,
          y: CANVAS_HEIGHT / 2 - 100,
          w: 120,
          h: 132,
          vx: 0,
          vy: 0,
          onGround: true,
          jumps: 0,
          maxJumps: 2,
          alive: true,
          state: 'victory',
          animFrame: 0,
          facingRight: true,
        };
        drawBoris(ctx, bigBoris, time, activeSkin);
      }
    }

    // Always re-queue — loop must never stop
    rafRef.current = requestAnimationFrame((nextTime) => updateRef.current?.(nextTime));
  };

  updateRef.current = update;

  // ═══════════════════════════════════════
  // DRAWING FUNCTIONS
  // ═══════════════════════════════════════

  const drawBoris = (ctx, player, time, skinId = 'default') => {
    const palette = SKINS[skinId] || SKINS.default;

    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);

    if (!player.facingRight) {
      ctx.scale(-1, 1);
    }

    const state = player.state;

    // Body bob animation for idle
    let bobY = 0;
    if (state === 'idle') {
      bobY = Math.sin(time * 0.003) * 2;
    }

    if (skinId === 'devil') {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 12;
    }

    // Body
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.ellipse(0, bobY, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy edges
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const fx = Math.cos(angle) * 16;
      const fy = Math.sin(angle) * 18 + bobY;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Horns
    ctx.fillStyle = palette.horn;
    if (skinId === 'devil') {
      ctx.beginPath();
      ctx.moveTo(-12, -18 + bobY);
      ctx.quadraticCurveTo(-18, -34 + bobY, -8, -32 + bobY);
      ctx.lineTo(-6, -18 + bobY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, -18 + bobY);
      ctx.quadraticCurveTo(18, -34 + bobY, 8, -32 + bobY);
      ctx.lineTo(6, -18 + bobY);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-12, -18 + bobY);
      ctx.lineTo(-8, -26 + bobY);
      ctx.lineTo(-6, -18 + bobY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, -18 + bobY);
      ctx.lineTo(8, -26 + bobY);
      ctx.lineTo(6, -18 + bobY);
      ctx.closePath();
      ctx.fill();
    }

    // Eye
    if (state === 'dead') {
      // X eyes
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -6 + bobY);
      ctx.lineTo(4, 2 + bobY);
      ctx.moveTo(4, -6 + bobY);
      ctx.lineTo(-4, 2 + bobY);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -2 + bobY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Iris
      ctx.fillStyle = palette.iris;
      ctx.beginPath();
      ctx.arc(0, -2 + bobY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, -2 + bobY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(2, -4 + bobY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    if (state === 'victory') {
      // Happy mouth
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 6 + bobY, 8, 0, Math.PI, false);
      ctx.stroke();

      // Teeth
      ctx.fillStyle = '#ffffff';
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(i * 4 - 1, 6 + bobY, 2, 4);
      }
    } else if (state === 'dead') {
      // Sad line
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 10 + bobY);
      ctx.lineTo(6, 10 + bobY);
      ctx.stroke();
    } else {
      // Open mouth
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, 8 + bobY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(i * 3 - 1, 6 + bobY, 2, 3);
      }
    }

    // Arms
    ctx.fillStyle = palette.body;
    if (state === 'victory') {
      // Arms up
      ctx.fillRect(-20, -8 + bobY, 8, 6);
      ctx.fillRect(12, -8 + bobY, 8, 6);
    } else {
      ctx.fillRect(-22, 2 + bobY, 8, 6);
      ctx.fillRect(14, 2 + bobY, 8, 6);
    }

    // Legs
    const legOffset = state === 'running' ? Math.sin(player.animFrame * 0.2) * 3 : 0;
    ctx.fillRect(-8, 16 + bobY + legOffset, 6, 8);
    ctx.fillRect(2, 16 + bobY - legOffset, 6, 8);

    // Feet
    ctx.fillStyle = palette.bodyDark;
    ctx.beginPath();
    ctx.ellipse(-5, 24 + bobY + legOffset, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 24 + bobY - legOffset, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Victory confetti
    if (state === 'victory') {
      for (let i = 0; i < 3; i++) {
        const angle = time * 0.01 + i * 2;
        const sx = Math.cos(angle) * 15;
        const sy = Math.sin(angle) * 15 - 10;
        ctx.fillStyle = ['#ffd700', '#ff8c00', '#ffffff'][i];
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      }
    }

    ctx.restore();
  };

  const drawGame = (ctx, time) => {
    const level = LEVELS[currentLevelRef.current];
    const player = playerRef.current;
    const platforms = platformsRef.current;
    const traps = trapsRef.current;
    const coins = coinsRef.current;

    // Apply shake
    let shakeX = 0;
    let shakeY = 0;
    if (shakeRef.current > 0) {
      shakeX = (Math.random() - 0.5) * shakeRef.current;
      shakeY = (Math.random() - 0.5) * shakeRef.current;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background
    ctx.fillStyle = level.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Platforms
    for (const plat of platforms) {
      if (plat.crumbled) continue;

      ctx.fillStyle = plat.color;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Crumble bar
      if (plat.crumbleActive && plat.crumbleTimer > 0) {
        const progress = plat.crumbleTimer / 0.8;
        ctx.fillStyle = '#ff8c00';
        ctx.fillRect(plat.x, plat.y - 5, plat.w * (1 - progress), 3);
      }

      // Fake flicker
      if (plat.fakeTimer && plat.fakeTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(time * 0.02) * 0.5;
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.globalAlpha = 1;
      }
    }

    // Coins
    for (const coin of coins) {
      if (!coin.collected) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y + coin.bobOffset, coin.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Traps
    for (const trap of traps) {
      if (trap.type === 'rising_spikes') {
        if (trap.risen) {
          ctx.fillStyle = '#ff3366';
          const spikeW = 20;
          const numSpikes = Math.floor(trap.w / spikeW);
          for (let i = 0; i < numSpikes; i++) {
            ctx.beginPath();
            ctx.moveTo(trap.x + i * spikeW, trap.y);
            ctx.lineTo(trap.x + i * spikeW + spikeW / 2, trap.y - trap.h);
            ctx.lineTo(trap.x + i * spikeW + spikeW, trap.y);
            ctx.closePath();
            ctx.fill();
          }
        } else if (trap.riseTimer > trap.delay * 0.7) {
          // Pre-rise hint
          ctx.fillStyle = 'rgba(255,51,102,0.3)';
          ctx.fillRect(trap.x, trap.y - 5, trap.w, 5);
        }
      }

      if (trap.type === 'ceiling_spikes' && trap.fallen) {
        ctx.fillStyle = '#ff3366';
        const spikeW = 20;
        const numSpikes = Math.floor(trap.w / spikeW);
        for (let i = 0; i < numSpikes; i++) {
          ctx.beginPath();
          ctx.moveTo(trap.x + i * spikeW, trap.fallenY);
          ctx.lineTo(trap.x + i * spikeW + spikeW / 2, trap.fallenY + 28);
          ctx.lineTo(trap.x + i * spikeW + spikeW, trap.fallenY);
          ctx.closePath();
          ctx.fill();
        }
      }

      if (trap.type === 'moving_spike') {
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.moveTo(trap.x, trap.y + trap.h);
        ctx.lineTo(trap.x + trap.w / 2, trap.y);
        ctx.lineTo(trap.x + trap.w, trap.y + trap.h);
        ctx.closePath();
        ctx.fill();
      }

      if (trap.type === 'wall') {
        ctx.fillStyle = '#ff3366';
        ctx.fillRect(trap.x, trap.y, trap.w, trap.h);

        // Spikes on right edge (or left if moving left)
        const spikeH = 25;
        const numSpikes = Math.floor(trap.h / spikeH);
        const edge = trap.speed > 0 ? trap.x + trap.w : trap.x;
        for (let i = 0; i < numSpikes; i++) {
          ctx.beginPath();
          if (trap.speed > 0) {
            ctx.moveTo(edge, trap.y + i * spikeH);
            ctx.lineTo(edge + 15, trap.y + i * spikeH + spikeH / 2);
            ctx.lineTo(edge, trap.y + i * spikeH + spikeH);
          } else {
            ctx.moveTo(edge, trap.y + i * spikeH);
            ctx.lineTo(edge - 15, trap.y + i * spikeH + spikeH / 2);
            ctx.lineTo(edge, trap.y + i * spikeH + spikeH);
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Goal
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fillRect(level.goal.x, level.goal.y, level.goal.w, level.goal.h);
    ctx.shadowBlur = 0;

    // Draw door details
    ctx.fillStyle = '#8B6340';
    ctx.fillRect(level.goal.x + 5, level.goal.y + 10, level.goal.w - 10, level.goal.h - 15);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(level.goal.x + 5, level.goal.y + 10, level.goal.w - 10, level.goal.h - 15);

    // Boris
    if (player) {
      drawBoris(ctx, player, time, activeSkin);
    }

    // Particles
    for (const p of particlesRef.current) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      if (p.isRect && p.rotation !== undefined) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.rw / 2, -p.rh / 2, p.rw, p.rh);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Gravity flip overlay
    if (gravityFlippedRef.current) {
      ctx.fillStyle = 'rgba(100,0,255,0.12)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#9933ff';
      ctx.font = 'bold 24px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('⬆ GRAVITY FLIPPED ⬆', CANVAS_WIDTH / 2, 30);
    }

    ctx.restore();

    // Level complete overlay
    if (gameScreenRef.current === 'levelComplete') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 36px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 LEVEL COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.font = '24px "Courier New"';
      ctx.fillText(`Coins earned: +${levelCoinsRef.current} 🪙`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

      ctx.font = '18px "Courier New"';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Level ${currentLevelRef.current + 1} of 8`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }

    // Message
    if (messageRef.current.time > 0) {
      ctx.globalAlpha = messageRef.current.time / 0.8;
      ctx.fillStyle = messageRef.current.color;
      ctx.font = 'bold 42px "Courier New"';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(messageRef.current.text, CANVAS_WIDTH / 2, 100);
      ctx.fillText(messageRef.current.text, CANVAS_WIDTH / 2, 100);
      ctx.globalAlpha = 1;
    }

    // Progress bar (proportional to level progress)
    ctx.fillStyle = '#ff3366';
    ctx.fillRect(0, 0, CANVAS_WIDTH * ((currentLevelRef.current + 1) / 8), 5);
  };

  // ═══════════════════════════════════════
  // INPUT HANDLERS
  // ═══════════════════════════════════════

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current.add(e.code);

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        const player = playerRef.current;
        if (player && player.alive && player.jumps < player.maxJumps) {
          player.vy = gravityFlippedRef.current ? -JUMP_FORCE : JUMP_FORCE;
          player.jumps++;
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls
  const handleCanvasTouch = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;

    if (x < CANVAS_WIDTH / 3) {
      keysRef.current.add('ArrowLeft');
      keysRef.current.delete('ArrowRight');
    } else if (x > (CANVAS_WIDTH * 2) / 3) {
      keysRef.current.add('ArrowRight');
      keysRef.current.delete('ArrowLeft');
    } else {
      // Jump
      const player = playerRef.current;
      if (player && player.alive && player.jumps < player.maxJumps) {
        player.vy = gravityFlippedRef.current ? -JUMP_FORCE : JUMP_FORCE;
        player.jumps++;
      }
    }
  };

  const handleTouchEnd = () => {
    keysRef.current.clear();
  };

  // ═══════════════════════════════════════
  // GAME LOOP (single unified update + render)
  // ═══════════════════════════════════════

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame((time) => updateRef.current?.(time));

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ═══════════════════════════════════════
  // SCREEN COMPONENTS
  // ═══════════════════════════════════════

  const renderIntro = () => (
    <div
      data-testid="intro-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'radial-gradient(circle at top left, rgba(255,97,145,0.28), transparent 32%), radial-gradient(circle at 80% 20%, rgba(74,184,232,0.25), transparent 28%), linear-gradient(145deg, #12081d 0%, #1a0d2f 48%, #081923 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Courier New", monospace',
        color: '#fff',
        padding: '28px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: 'min(1180px, 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '28px',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: '1 1 560px',
            background: 'rgba(8, 12, 20, 0.72)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '32px',
            padding: '36px',
            boxShadow: '0 30px 90px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p style={{ color: '#6dd3ff', letterSpacing: '0.28em', fontSize: '12px', marginBottom: '18px' }}>
            ONECHAIN OCT GAMEFI
          </p>
          <h1
            data-testid="title"
            style={{
              fontSize: 'clamp(56px, 10vw, 104px)',
              lineHeight: 0.95,
              color: '#fff2e8',
              marginBottom: '14px',
              textShadow: '0 0 24px rgba(255,119,162,0.32)',
            }}
          >
            BORKA
          </h1>
          <p style={{ fontSize: 'clamp(22px, 3vw, 34px)', color: '#ffb347', fontStyle: 'italic', marginBottom: '18px' }}>
            the one-eyed chaos run
          </p>
          <p
            data-testid="warning-text"
            style={{
              fontSize: '16px',
              color: '#ff8f66',
              marginBottom: '24px',
              letterSpacing: '0.14em',
            }}
          >
            NOTHING IS AS IT SEEMS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {[
              '8 handcrafted levels with fake floors, spikes, and gravity flips',
              'On-chain leaderboard and score submission on OneChain testnet',
              'Unlock Devil Borka NFT skin after clearing all levels',
            ].map((feature) => (
              <div
                key={feature}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: '#d7dfeb',
                }}
              >
                {feature}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <button
              data-testid="play-button"
              onClick={() => setGameScreen('worldmap')}
              style={{
                fontSize: '22px',
                padding: '18px 42px',
                background: 'linear-gradient(135deg, #ff8a3d, #ff4f88)',
                border: 'none',
                borderRadius: '999px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 16px 40px rgba(255, 90, 120, 0.32)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
            >
              Enter The Run
            </button>
            <WalletButton />
            {isConnected && (
              <p style={{ color: '#1D9E75', fontSize: '14px' }}>
                Wallet ready: {shortAddress}
              </p>
            )}
          </div>
          <div style={{ marginTop: '14px' }}>
            <p style={{ color: '#9fb0c4', fontSize: '12px', marginBottom: '10px' }}>Choose your skin</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.values(SKINS).map((skin) => {
                const isLocked = skin.nftRequired && !hasDevilNFT;
                const isActive = activeSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    onClick={() => {
                      if (!isLocked) setActiveSkin(skin.id);
                    }}
                    title={isLocked ? 'Complete all 8 levels and mint the NFT to unlock' : skin.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: isActive ? '3px solid #ffd700' : '2px solid rgba(255,255,255,0.16)',
                      background: isLocked ? '#1a1a1a' : skin.body,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.45 : 1,
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s',
                      transform: isActive ? 'scale(1.14)' : 'scale(1)',
                    }}
                  >
                    {isLocked ? '🔒' : ''}
                  </button>
                );
              })}
            </div>
            <p style={{ color: '#9fb0c4', fontSize: '12px', marginTop: '10px' }}>
              {SKINS[activeSkin]?.name}
              {activeSkin !== 'devil' && hasDevilNFT ? ' · Devil Borka unlocked' : ''}
            </p>
          </div>
        </div>
        <div
          style={{
            flex: '1 1 360px',
            minWidth: '300px',
            background: 'linear-gradient(180deg, rgba(30, 36, 57, 0.92), rgba(9, 15, 25, 0.88))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '32px',
            padding: '28px',
            boxShadow: '0 30px 90px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p style={{ color: '#8dc8ff', fontSize: '12px', letterSpacing: '0.16em', marginBottom: '8px' }}>LIVE CHARACTER</p>
              <p style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>{SKINS[activeSkin]?.name}</p>
            </div>
            <img
              src={publicAssetUrl('/2.png')}
              alt="Borka character"
              style={{ width: '132px', height: '132px', objectFit: 'contain', filter: 'drop-shadow(0 18px 25px rgba(74,184,232,0.32))' }}
            />
          </div>
          <div
            style={{
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255,138,61,0.18), rgba(74,184,232,0.12))',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '18px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '14px' }}>
              <img src={publicAssetUrl('/1')} alt="Devil Borka NFT art" style={{ width: '82px', height: '82px', objectFit: 'contain', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} />
              <img src={publicAssetUrl('/2.png')} alt="Devil Borka alternate art" style={{ width: '82px', height: '82px', objectFit: 'contain', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} />
            </div>
            <p style={{ color: '#ffd36e', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' }}>Devil Borka NFT Reward</p>
            <p style={{ color: '#d1dae8', fontSize: '13px', lineHeight: 1.5, textAlign: 'center' }}>
              Beat all 8 levels, submit your score on-chain, then mint the exclusive Devil Borka skin to your wallet.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              `Package ${'0x7c35...710d'}`,
              'Leaderboard auto-refreshes on world map and during gameplay',
              'NFT metadata uses on-chain image and thumbnail URLs',
            ].map((detail) => (
              <div
                key={detail}
                style={{
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '12px 14px',
                  color: '#c9d3e0',
                  fontSize: '12px',
                }}
              >
                {detail}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );

  const renderWorldMap = () => (
    <div
      data-testid="world-map-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'radial-gradient(circle at top, rgba(255,214,102,0.18), transparent 25%), linear-gradient(155deg, #0f261d 0%, #133b3c 44%, #17365e 100%)',
        fontFamily: '"Courier New", monospace',
        overflowY: 'auto',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '72px',
          background: 'rgba(5,10,16,0.58)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: 2,
        }}
      >
        <button
          data-testid="home-button"
          onClick={() => setGameScreen('intro')}
          style={{
            fontSize: '24px',
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          🏠
        </button>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ color: '#d6e6f5', fontSize: '13px', letterSpacing: '0.08em' }}>
            Borka Route Map
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '8px 20px',
              borderRadius: '20px',
              color: '#ffd700',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {totalCoinsRef.current.toLocaleString()} 🪙
          </div>
          <WalletButton />
        </div>
      </div>

      <div
        style={{
          width: 'min(1280px, 100%)',
          margin: '100px auto 28px',
          padding: '0 24px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: 'rgba(7, 11, 20, 0.68)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '26px',
            padding: '22px',
            color: '#d8e2ef',
            boxShadow: '0 24px 60px rgba(0,0,0,0.24)',
          }}
        >
          <p style={{ color: '#8cd7ff', fontSize: '12px', letterSpacing: '0.16em', marginBottom: '12px' }}>CURRENT RUN</p>
          <h2 style={{ color: '#fff5de', fontSize: '28px', marginBottom: '12px' }}>Choose Your Level</h2>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#bfc9d8', marginBottom: '18px' }}>
            Follow the route, replay cleared stages, and push a better score to the on-chain leaderboard.
          </p>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ borderRadius: '18px', padding: '12px 14px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '6px' }}>Selected</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{LEVELS[currentLevelRef.current].name}</div>
            </div>
            <div style={{ borderRadius: '18px', padding: '12px 14px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '6px' }}>Unlocked</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{unlockedLevelsRef.current.size} / 8</div>
            </div>
            <div style={{ borderRadius: '18px', padding: '12px 14px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '6px' }}>Skin</div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{SKINS[activeSkin]?.name}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(7, 11, 20, 0.66)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '30px',
            padding: '18px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.24)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '860px',
              height: '460px',
              margin: '0 auto',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(60,136,95,0.24), rgba(8,16,24,0.18))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <path
            d="M 85,380 Q 180,300 260,260 T 430,190 Q 560,130 690,170 T 805,300"
            stroke="rgba(255,255,255,0.68)"
            strokeWidth="4"
            strokeDasharray="10,10"
            fill="none"
            opacity="0.75"
          />
        </svg>

        {LEVELS.map((level, idx) => {
          const positions = [
            { x: 70, y: 350 },
            { x: 190, y: 265 },
            { x: 325, y: 210 },
            { x: 470, y: 160 },
            { x: 610, y: 150 },
            { x: 710, y: 190 },
            { x: 770, y: 245 },
            { x: 805, y: 300 },
          ];
          const pos = positions[idx];
          const unlocked = unlockedLevelsRef.current.has(idx);
          const completed = idx < currentLevelRef.current;

          return (
            <div
              key={idx}
              data-testid={`level-node-${idx + 1}`}
              onClick={() => {
                if (unlocked) {
                  currentLevelRef.current = idx;
                  initLevel(idx);
                  setGameScreen('playing');
                }
              }}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: unlocked ? 'linear-gradient(180deg, #fff6d8, #ffd36e)' : '#465063',
                border: completed ? '4px solid #ffd36e' : '4px solid rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                boxShadow: unlocked ? '0 14px 30px rgba(0,0,0,0.28)' : 'none',
                transform: idx === currentLevelRef.current ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.3s',
              }}
            >
              {completed ? '⭐' : idx + 1}
              {!unlocked && <div style={{ position: 'absolute', fontSize: '30px' }}>🔒</div>}
            </div>
          );
        })}

        {/* Current position Borka */}
        {currentLevelRef.current < LEVELS.length && (
          <div
            data-testid="boris-marker"
            style={{
              position: 'absolute',
              left:
                [70, 190, 325, 470, 610, 710, 770, 805][
                  Math.min(currentLevelRef.current, LEVELS.length - 1)
                ] + 30,
              top:
                [350, 265, 210, 160, 150, 190, 245, 300][
                  Math.min(currentLevelRef.current, LEVELS.length - 1)
                ] - 40,
              fontSize: '40px',
              animation: 'bounce 1s infinite',
            }}
          >
            🔵
          </div>
        )}
          </div>

          <div
            style={{
              marginTop: '18px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              data-testid="restart-button"
              onClick={() => {
                currentLevelRef.current = 0;
                totalDeathsRef.current = 0;
                totalCoinsRef.current = 0;
                unlockedLevelsRef.current = new Set([0]);
                gameStartTimeRef.current = Date.now();
                initLevel(0);
                setGameScreen('playing');
              }}
              style={{
                fontSize: '18px',
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #e8892a, #c45e10)',
                border: 'none',
                borderRadius: '25px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Restart
            </button>
            <button
              data-testid="next-button"
              onClick={() => {
                if (unlockedLevelsRef.current.has(currentLevelRef.current)) {
                  initLevel(currentLevelRef.current);
                  setGameScreen('playing');
                }
              }}
              style={{
                fontSize: '18px',
                padding: '12px 40px',
                background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
                border: 'none',
                borderRadius: '25px',
                color: '#000',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Enter Level
            </button>
          </div>
        </div>

        <div style={{ minWidth: '280px' }}>
          <Leaderboard refreshKey={leaderboardRefreshKey} />
          <div
            style={{
              marginTop: '16px',
              background: 'rgba(7, 11, 20, 0.68)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '18px',
              color: '#d7dfeb',
            }}
          >
            <p style={{ color: '#8cd7ff', fontSize: '12px', letterSpacing: '0.16em', marginBottom: '10px' }}>RUN TIPS</p>
            <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '8px' }}>Scores post when you clear all 8 levels. The leaderboard auto-refreshes when you return here.</p>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>Need the NFT? Finish the run, then mint Devil Borka from the win screen using the connected wallet.</p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );

  const gameplayLeaderboard = (
    <div
      style={{
        width: '100%',
        maxWidth: '340px',
        display: 'grid',
        gap: '14px',
      }}
    >
      <Leaderboard refreshKey={leaderboardRefreshKey} />
      <div
        style={{
          background: 'rgba(9, 13, 20, 0.74)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '16px',
          color: '#c9d2dd',
          fontFamily: '"Courier New", monospace',
        }}
      >
        <p style={{ color: '#8cd7ff', fontSize: '12px', letterSpacing: '0.14em', marginBottom: '10px' }}>LIVE STATUS</p>
        <p style={{ fontSize: '13px', marginBottom: '8px' }}>Skin: {SKINS[activeSkin]?.name}</p>
        <p style={{ fontSize: '13px', marginBottom: '8px' }}>Wallet: {isConnected ? shortAddress : 'Not connected'}</p>
        <p style={{ fontSize: '13px', lineHeight: 1.5 }}>Clear all levels to write your score on-chain and unlock the Devil Borka mint flow.</p>
      </div>
    </div>
  );

  const gameplayShell = (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(gameScreen === 'playing' || gameScreen === 'levelComplete') && (
          <div
            data-testid="game-hud"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: 'min(800px, 100%)',
              marginBottom: '10px',
              fontFamily: '"Courier New", monospace',
              fontSize: '18px',
              color: '#fff',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span data-testid="level-name" style={{ color: '#ff3366', fontWeight: 'bold' }}>
              {LEVELS[currentLevelRef.current].name}
            </span>
            <span data-testid="deaths-counter" style={{ color: '#ff6b35' }}>
              💀 {displayDeaths}
            </span>
            <span data-testid="coins-counter" style={{ color: '#ffd700' }}>
              🪙 {displayCoins}
            </span>
            {isConnected && (
              <span style={{ color: '#1D9E75', fontSize: '14px' }}>
                🔗 {shortAddress}
              </span>
            )}
          </div>
        )}
        <canvas
          data-testid="game-canvas"
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onTouchStart={handleCanvasTouch}
          onTouchEnd={handleTouchEnd}
          style={{
            border: '3px solid #ff3366',
            boxShadow: '0 0 30px rgba(255,51,102,0.6)',
            background: '#000',
            width: 'min(100%, 800px)',
            height: 'auto',
          }}
        />
        {(gameScreen === 'playing' || gameScreen === 'levelComplete') && (
          <div
            data-testid="controls-hint"
            style={{
              marginTop: '10px',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              color: '#888',
              textAlign: 'center',
            }}
          >
            ← → / A D to move | Space / ↑ / W to jump | Double-jump enabled!
          </div>
        )}
      </div>
      {gameScreen !== 'win' && gameplayLeaderboard}
    </div>
  );

  const renderWinScreen = () => (
    <div
      data-testid="win-screen"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Courier New", monospace',
        color: '#fff',
        zIndex: 100,
      }}
    >
      <div style={{ position: 'relative', zIndex: 101, textAlign: 'center' }}>
        <h1
          data-testid="win-title"
          style={{
            fontSize: '52px',
            color: '#ffd700',
            marginBottom: '40px',
            animation: 'pulse 2s infinite',
          }}
        >
          🎉 YOU BEAT BORKA!
        </h1>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>
          <p data-testid="total-deaths">Total deaths: {totalDeathsRef.current} 💀</p>
          <p data-testid="total-coins">Total coins: {totalCoinsRef.current} 🪙</p>
          <p>Levels beaten: 8/8</p>
        </div>
        <button
          data-testid="play-again-button"
          onClick={() => resetRunState('worldmap')}
          style={{
            fontSize: '24px',
            padding: '15px 50px',
            background: 'linear-gradient(135deg, #e8892a, #c45e10)',
            border: 'none',
            borderRadius: '50px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '30px',
          }}
        >
          PLAY AGAIN
        </button>
        <button
          onClick={() => resetRunState('intro')}
          style={{
            fontSize: '18px',
            padding: '12px 36px',
            background: 'transparent',
            border: '2px solid #ffd700',
            borderRadius: '50px',
            color: '#ffd700',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '12px',
          }}
        >
          HOME
        </button>

        {/* Blockchain claim section */}
        {isConnected && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {!claimTxDigest ? (
              <button
                data-testid="claim-tokens-button"
                onClick={() => claimTokens({ coins: 1 })}
                disabled={isClaiming || isSubmitting}
                style={{
                  fontSize: '20px',
                  padding: '14px 40px',
                  background: isClaiming || isSubmitting
                    ? '#555'
                    : 'linear-gradient(135deg, #1D9E75, #0f6e56)',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#fff',
                  cursor: isClaiming || isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {isClaiming
                  ? '⏳ Claiming...'
                  : `🪙 Claim 1 OCT Token (${totalCoinsRef.current} coins earned)`}
              </button>
            ) : (
              <div>
                <p style={{ color: '#1D9E75', fontWeight: 'bold' }}>
                  ✅ Tokens Claimed!
                </p>
                <a
                  href={explorerTxUrl(claimTxDigest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4ab8e8', fontSize: '13px' }}
                >
                  View on Explorer ↗
                </a>
              </div>
            )}
            {!scoreTxDigest ? (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
                {isSubmitting ? '⏳ Submitting score to chain...' : ''}
              </p>
            ) : (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '10px' }}>
                ✅ Score on-chain •{' '}
                <a
                  href={explorerTxUrl(scoreTxDigest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4ab8e8' }}
                >
                  View ↗
                </a>
              </p>
            )}
          </div>
        )}
        {isConnected && !hasDevilNFT && (
          <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #cc0000', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <img src="/1" alt="Devil Borka NFT art" style={{ width: '72px', height: '72px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} />
              <img src="/2.png" alt="Devil Borka NFT preview" style={{ width: '72px', height: '72px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', padding: '6px' }} />
            </div>
            <p style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: '8px' }}>
              😈 You unlocked Devil Borka!
            </p>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>
              Mint your exclusive NFT skin to your wallet
            </p>
            {!nftTxDigest ? (
              <button
                onClick={mintNFT}
                disabled={isMintingNFT}
                style={{
                  fontSize: '16px',
                  padding: '12px 30px',
                  background: isMintingNFT ? '#555' : 'linear-gradient(135deg, #cc0000, #800000)',
                  border: 'none',
                  borderRadius: '25px',
                  color: '#fff',
                  cursor: isMintingNFT ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {isMintingNFT ? '⏳ Minting...' : '🎨 Mint Devil Borka NFT'}
              </button>
            ) : (
              <div>
                <p style={{ color: '#1D9E75', fontWeight: 'bold' }}>✅ Devil Borka NFT Minted!</p>
                <a
                  href={explorerTxUrl(nftTxDigest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4ab8e8', fontSize: '13px' }}
                >
                  View on Explorer ↗
                </a>
              </div>
            )}
          </div>
        )}
        {isConnected && hasDevilNFT && (
          <p style={{ color: '#cc0000', fontSize: '13px', marginTop: '12px' }}>
            😈 Devil Borka NFT already in your wallet
          </p>
        )}
        {(submitScoreError || claimTokensError || mintNftError) && (
          <div style={{ marginTop: '12px', color: '#ff8a8a', fontSize: '12px', maxWidth: '420px' }}>
            {submitScoreError && <p style={{ margin: '4px 0' }}>Score error: {submitScoreError}</p>}
            {claimTokensError && <p style={{ margin: '4px 0' }}>Claim error: {claimTokensError}</p>}
            {mintNftError && <p style={{ margin: '4px 0' }}>NFT error: {mintNftError}</p>}
          </div>
        )}
        {!isConnected && (
          <div style={{ marginTop: '16px' }}>
            <WalletButton />
            <p style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>
              Connect wallet to claim OCT tokens & save score
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════

  return (
    <div data-testid="boris-game" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {gameScreen === 'intro' && renderIntro()}
      {gameScreen === 'worldmap' && renderWorldMap()}
      {(gameScreen === 'playing' || gameScreen === 'levelComplete' || gameScreen === 'win') && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top, rgba(255,51,102,0.18), transparent 28%), linear-gradient(180deg, #080b12 0%, #121824 100%)',
            padding: '20px',
          }}
        >
          {gameplayShell}
        </div>
      )}
      {gameScreen === 'win' && renderWinScreen()}
    </div>
  );
};

export default BorkaGame;
