'use client';

import { useGameContext } from '../layout';
import { useState, useEffect, useRef } from 'react';
import { gameRepository } from '../../../services/repository/provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Swords, Landmark, Coins, Pickaxe, Flame, AlertCircle, Sparkles, 
  BookOpen, Globe, ArrowRight, Anchor, Scroll, Beer, Hammer,
  User as UserIcon, X, Compass, Radio, ShieldAlert, Award, Clock
} from 'lucide-react';
import { useSFX } from '../../../hooks/useSFX';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface RoundLog {
  round: number;
  attacker: string;
  defender: string;
  damage: number;
  action: string;
  defender_hp: number;
}

interface LootItem {
  name: string;
  quantity: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sfx = useSFX();
  
  const { 
    profile, 
    stats, 
    currencies, 
    playerQuests, 
    startQuest, 
    updateQuestProgress, 
    claimEnergy,
    refreshData,
    actionLoading,
    regions,
    countries,
    inventory,
    equipment,
    enemyTemplates,
    combatRankings,
    executePvEBattle,
    train,
    travel,
    spawns,
    resources,
    claimTicket,
    gather,
    itemTemplates,
    recipes,
    playerResources,
    craftItem,
    triggerFloatingText
  } = useGameContext();

  // Navigation tab state: 'none' | 'kingdom' | 'army' | 'economy' | 'quests' | 'profile' | 'gather' | 'inventory'
  const [activeTab, setActiveTab] = useState<'none' | 'kingdom' | 'army' | 'economy' | 'quests' | 'profile' | 'gather' | 'inventory'>('none');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Travel States
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [activeDetailRegion, setActiveDetailRegion] = useState<any>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelSource, setTravelSource] = useState<{ top: string; left: string } | null>(null);
  const [travelDest, setTravelDest] = useState<{ top: string; left: string } | null>(null);

  useEffect(() => {
    if (selectedRegion) {
      setActiveDetailRegion(selectedRegion);
    }
  }, [selectedRegion]);

  // Gathering mini-game needle states
  const [needlePos, setNeedlePos] = useState(0);
  const [needleDirection, setNeedleDirection] = useState(1);
  const [bonusXpEarned, setBonusXpEarned] = useState(0);

  // Active combat clash states
  const [activeForgingId, setActiveForgingId] = useState<number | null>(null);
  const [combatRounds, setCombatRounds] = useState<RoundLog[]>([]);
  const [combatOutcomeData, setCombatOutcomeData] = useState<any>(null);
  const [combatActionMessage, setCombatActionMessage] = useState("");
  const [playerFloatingText, setPlayerFloatingText] = useState("");
  const [enemyFloatingText, setEnemyFloatingText] = useState("");
  const [playerHitActive, setPlayerHitActive] = useState(false);
  const [enemyHitActive, setEnemyHitActive] = useState(false);

  // Zoom & Drag Pan Physics Refs
  const targetZoom = useRef(1.0);
  const currentZoom = useRef(1.0);
  const targetPan = useRef({ x: 0, y: 0 });
  const currentPan = useRef({ x: 0, y: 0 });
  
  const panVelocity = useRef({ x: 0, y: 0 });
  const zoomVelocity = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  
  const isDraggingRef = useRef(false);
  const isAutoGliding = useRef(true); // Auto-glides to Genesis Capital on load
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  
  const [fadeActive, setFadeActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; dist: number; panX: number; panY: number } | null>(null);

  const getMinZoom = (width: number, height: number) => {
    const mapHeightAtZoom1 = width * 3944 / 6248;
    return Math.max(1.0, height / mapHeightAtZoom1);
  };

  const clampPan = (x: number, y: number, currentZoom: number, width: number, height: number) => {
    const limitX = Math.max(0, ((currentZoom - 1.0) * width) / 2);
    const mapHeight = width * 3944 / 6248;
    const limitY = Math.max(0, (mapHeight * currentZoom - height) / 2);
    return {
      x: Math.max(-limitX, Math.min(limitX, x)),
      y: Math.max(-limitY, Math.min(limitY, y))
    };
  };

  // Cinematic glide zoom-in centered on Genesis Capital (Region 1) on load
  useEffect(() => {
    setFadeActive(true);
    
    const timer = setTimeout(() => {
      const startZoom = 1.8;
      targetZoom.current = startZoom;
      currentZoom.current = 1.0;
      currentPan.current = { x: 0, y: 0 };
      
      const node = positionMap[1]; // Center on Genesis Capital castle
      if (node && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
        const width = rect.width || (typeof window !== 'undefined' ? window.innerWidth - (isDesktop ? 256 : 0) : 800);
        const height = rect.height || (typeof window !== 'undefined' ? window.innerHeight - 64 : 800);
        
        const nodeLeft = parseFloat(node.left) / 100;
        const nodeTop = parseFloat(node.top) / 100;
        
        const mapHeight = width * 3944 / 6248;
        const panX = -((nodeLeft - 0.5) * width * startZoom);
        const panY = -((nodeTop - 0.5) * mapHeight * startZoom);
        
        targetPan.current = { x: panX, y: panY };
        isAutoGliding.current = true;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Frame-by-frame physics loop running on requestAnimationFrame
  useEffect(() => {
    let active = true;

    const updateLoop = () => {
      if (!active) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const width = rect.width;
        const height = rect.height;
        const minZoom = getMinZoom(width, height);

        // Clamp target zoom
        if (targetZoom.current < minZoom) targetZoom.current = minZoom;
        if (targetZoom.current > 4.0) targetZoom.current = 4.0;

        if (isAutoGliding.current) {
          // Spring auto-glide simulation with organic overshoot
          const springFriction = 0.82;
          const springTension = 0.045;

          const zoomForce = (targetZoom.current - currentZoom.current) * springTension;
          zoomVelocity.current += zoomForce;
          zoomVelocity.current *= springFriction;
          currentZoom.current += zoomVelocity.current;

          const panForceX = (targetPan.current.x - currentPan.current.x) * springTension;
          const panForceY = (targetPan.current.y - currentPan.current.y) * springTension;
          panVelocity.current.x += panForceX;
          panVelocity.current.y += panForceY;
          panVelocity.current.x *= springFriction;
          panVelocity.current.y *= springFriction;
          currentPan.current.x += panVelocity.current.x;
          currentPan.current.y += panVelocity.current.y;

          // Soft boundary check during glide
          const limitX = Math.max(0, (width * currentZoom.current - width) / 2);
          const mapHeight = width * 3944 / 6248;
          const limitY = Math.max(0, (mapHeight * currentZoom.current - height) / 2);
          currentPan.current.x = Math.max(-limitX, Math.min(limitX, currentPan.current.x));
          currentPan.current.y = Math.max(-limitY, Math.min(limitY, currentPan.current.y));

          // Exit auto glide when stabilized
          if (Math.hypot(targetPan.current.x - currentPan.current.x, targetPan.current.y - currentPan.current.y) < 0.25 &&
              Math.abs(targetZoom.current - currentZoom.current) < 0.002 &&
              Math.hypot(panVelocity.current.x, panVelocity.current.y) < 0.05) {
            isAutoGliding.current = false;
          }
        } else {
          // Standard fluid Lerping & momentum physics
          currentZoom.current += (targetZoom.current - currentZoom.current) * 0.12;

          if (isDraggingRef.current) {
            currentPan.current.x = targetPan.current.x;
            currentPan.current.y = targetPan.current.y;
          } else {
            // Apply deceleration drag momentum
            panVelocity.current.x *= 0.92;
            panVelocity.current.y *= 0.92;
            targetPan.current.x += panVelocity.current.x;
            targetPan.current.y += panVelocity.current.y;

            // Clamping target limits
            const limitX = Math.max(0, (width * targetZoom.current - width) / 2);
            const mapHeight = width * 3944 / 6248;
            const limitY = Math.max(0, (mapHeight * targetZoom.current - height) / 2);
            targetPan.current.x = Math.max(-limitX, Math.min(limitX, targetPan.current.x));
            targetPan.current.y = Math.max(-limitY, Math.min(limitY, targetPan.current.y));

            // Lerp current position to clamped target position
            currentPan.current.x += (targetPan.current.x - currentPan.current.x) * 0.15;
            currentPan.current.y += (targetPan.current.y - currentPan.current.y) * 0.15;
          }
        }

        // Final boundary clamping to avoid any visual canvas edge gaps
        const limitX = Math.max(0, (width * currentZoom.current - width) / 2);
        const mapHeight = width * 3944 / 6248;
        const limitY = Math.max(0, (mapHeight * currentZoom.current - height) / 2);
        currentPan.current.x = Math.max(-limitX, Math.min(limitX, currentPan.current.x));
        currentPan.current.y = Math.max(-limitY, Math.min(limitY, currentPan.current.y));

        // Push values directly to the DOM transform property for 60fps performance
        if (mapContentRef.current) {
          mapContentRef.current.style.transform = `translate3d(${currentPan.current.x}px, ${currentPan.current.y}px, 0) scale(${currentZoom.current})`;
        }
      }

      animationFrameId.current = requestAnimationFrame(updateLoop);
    };

    animationFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      active = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Block native page scrolling and route events directly via non-passive listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      
      const rect = container.getBoundingClientRect();
      isAutoGliding.current = false; // Override glide on zoom interaction

      const zoomFactor = 1.15;
      let nextZoom = targetZoom.current;
      if (e.deltaY < 0) {
        nextZoom = Math.min(4.0, targetZoom.current * zoomFactor);
      } else {
        const minZoom = getMinZoom(rect.width, rect.height);
        nextZoom = Math.max(minZoom, targetZoom.current / zoomFactor);
      }

      const zoomRatio = nextZoom / targetZoom.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      targetPan.current.x = mouseX - (mouseX - targetPan.current.x - rect.width/2) * zoomRatio - rect.width/2;
      targetPan.current.y = mouseY - (mouseY - targetPan.current.y - rect.height/2) * zoomRatio - rect.height/2;
      targetZoom.current = nextZoom;
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    isDraggingRef.current = true;
    isAutoGliding.current = false; // Dismiss glide
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: targetPan.current.x,
      panY: targetPan.current.y
    };
    panVelocity.current = { x: 0, y: 0 };

    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grab');
      containerRef.current.classList.add('cursor-grabbing');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    const nextX = dragStartRef.current.panX + dx;
    const nextY = dragStartRef.current.panY + dy;
    
    // Accumulate dragging velocity history
    panVelocity.current.x = nextX - targetPan.current.x;
    panVelocity.current.y = nextY - targetPan.current.y;

    targetPan.current.x = nextX;
    targetPan.current.y = nextY;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;

    if (containerRef.current) {
      containerRef.current.classList.remove('cursor-grabbing');
      containerRef.current.classList.add('cursor-grab');
    }
  };

  const handleZoomIn = () => {
    sfx.playClick();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    isAutoGliding.current = false;
    const nextZoom = Math.min(4.0, targetZoom.current + 0.3);
    const zoomRatio = nextZoom / targetZoom.current;
    
    // Zoom in on the center of the viewport
    const mouseX = rect.width / 2;
    const mouseY = rect.height / 2;
    targetPan.current.x = mouseX - (mouseX - targetPan.current.x - rect.width/2) * zoomRatio - rect.width/2;
    targetPan.current.y = mouseY - (mouseY - targetPan.current.y - rect.height/2) * zoomRatio - rect.height/2;
    targetZoom.current = nextZoom;
  };

  const handleZoomOut = () => {
    sfx.playClick();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    isAutoGliding.current = false;
    const minZoom = getMinZoom(rect.width, rect.height);
    const nextZoom = Math.max(minZoom, targetZoom.current - 0.3);
    const zoomRatio = nextZoom / targetZoom.current;

    const mouseX = rect.width / 2;
    const mouseY = rect.height / 2;
    targetPan.current.x = mouseX - (mouseX - targetPan.current.x - rect.width/2) * zoomRatio - rect.width/2;
    targetPan.current.y = mouseY - (mouseY - targetPan.current.y - rect.height/2) * zoomRatio - rect.height/2;
    targetZoom.current = nextZoom;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    sfx.playClick();
    isAutoGliding.current = false;
    const nextZoom = Math.min(4.0, targetZoom.current + 0.6);
    const zoomRatio = nextZoom / targetZoom.current;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    targetPan.current.x = mouseX - (mouseX - targetPan.current.x - rect.width/2) * zoomRatio - rect.width/2;
    targetPan.current.y = mouseY - (mouseY - targetPan.current.y - rect.height/2) * zoomRatio - rect.height/2;
    targetZoom.current = nextZoom;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isAutoGliding.current = false;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        dist: 0,
        panX: targetPan.current.x,
        panY: targetPan.current.y
      };
      isDraggingRef.current = true;
      panVelocity.current = { x: 0, y: 0 };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
        dist,
        panX: targetPan.current.x,
        panY: targetPan.current.y
      };
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 1 && touchStartRef.current.dist === 0) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      
      const nextX = touchStartRef.current.panX + dx;
      const nextY = touchStartRef.current.panY + dy;
      
      panVelocity.current.x = nextX - targetPan.current.x;
      panVelocity.current.y = nextY - targetPan.current.y;

      targetPan.current.x = nextX;
      targetPan.current.y = nextY;
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = dist / touchStartRef.current.dist;
      const minZoom = getMinZoom(rect.width, rect.height);
      const nextZoom = Math.min(4.0, Math.max(minZoom, targetZoom.current * scale));
      
      const currentX = (t1.clientX + t2.clientX) / 2;
      const currentY = (t1.clientY + t2.clientY) / 2;
      const dx = currentX - touchStartRef.current.x;
      const dy = currentY - touchStartRef.current.y;

      const zoomRatio = nextZoom / targetZoom.current;
      targetPan.current.x = currentX - (currentX - (touchStartRef.current.panX + dx) - rect.width/2) * zoomRatio - rect.width/2;
      targetPan.current.y = currentY - (currentY - (touchStartRef.current.panY + dy) - rect.height/2) * zoomRatio - rect.height/2;
      targetZoom.current = nextZoom;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    isDraggingRef.current = false;
  };

  // Read URL query parameter on mount/change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'army') {
        setIsCombatPanelOpen(true);
        setIsProfilePanelOpen(false);
        setActiveTab('none');
      } else if (tabParam === 'profile') {
        setIsProfilePanelOpen(true);
        setIsCombatPanelOpen(false);
        setActiveTab('none');
      } else {
        setActiveTab(tabParam as any);
        setIsCombatPanelOpen(false);
        setIsProfilePanelOpen(false);
      }
    }
  }, [searchParams]);

  const showStatus = (text: string, ok: boolean) => {
    if (ok) {
      setSuccess(text);
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(text);
      setSuccess(null);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCloseTab = () => {
    sfx.playClose();
    setActiveTab('none');
    // Clear URL parameter
    router.replace('/dashboard');
  };

  const handleOpenTab = (tab: typeof activeTab) => {
    sfx.playOpen();
    if (tab === 'army') {
      setIsCombatPanelOpen(true);
      setIsProfilePanelOpen(false);
      setActiveTab('none');
    } else if (tab === 'profile') {
      setIsProfilePanelOpen(true);
      setIsCombatPanelOpen(false);
      setActiveTab('none');
    } else {
      setActiveTab(tab);
      setIsCombatPanelOpen(false);
      setIsProfilePanelOpen(false);
    }
  };

  const handleHover = () => {
    sfx.playClick();
  };

  // ==========================================
  // LORE & QUESTS SECTION
  // ==========================================
  const [staticQuests, setStaticQuests] = useState<any[]>([]);
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const qList = await gameRepository.getQuests();
        setStaticQuests(qList);
      } catch (err) {
        console.error('Failed to load static quests:', err);
      }
    };
    loadQuests();
  }, []);

  const handleStartQuest = async (questId: number) => {
    const res = await startQuest(questId);
    if (res.success) {
      showStatus('Story adventure accepted! Coordinates updated.', true);
      refreshData();
    } else {
      showStatus(res.error || 'Failed to accept quest.', false);
    }
  };

  const handleSimulateQuest = async (questId: number, current: number, required: number) => {
    const nextVal = current + 1;
    const res = await updateQuestProgress(questId, { current: nextVal, required });
    if (res.success) {
      if (nextVal >= required) {
        showStatus('Adventure completed! Quest rewards claimed.', true);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } else {
        showStatus(`Objective updated: ${nextVal} / ${required}`, true);
      }
      refreshData();
    } else {
      showStatus(res.error || 'Failed to update progress.', false);
    }
  };

  const activeQuest = playerQuests.find(q => q.status === 'active');
  const finishedQuestsCount = playerQuests.filter(q => q.status === 'completed').length;

  // ==========================================
  // GATHERING MODAL SECTION
  // ==========================================
  const [activeGatherId, setActiveGatherId] = useState<number | null>(null);
  const [gatherProgress, setGatherProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeRegion = regions.find((r) => r.id === profile?.current_region_id);
  const activeCountry = countries.find((c) => c.id === activeRegion?.country_id);
  const regionSpawns = spawns.filter((s) => s.region_id === profile?.current_region_id);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // timing needle effect
  useEffect(() => {
    if (activeGatherId === null) return;
    const interval = setInterval(() => {
      setNeedlePos((pos) => {
        let dir = 1;
        setNeedleDirection((currentDir) => {
          dir = currentDir;
          return currentDir;
        });
        let next = pos + dir * 5;
        if (next >= 100) {
          next = 100;
          setNeedleDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setNeedleDirection(1);
        }
        return next;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [activeGatherId]);

  const handleStartGather = async (spawnId: number, durationSeconds: number) => {
    if (activeGatherId !== null) return;
    sfx.playClick();
    setActiveGatherId(spawnId);
    setGatherProgress(0);
    setBonusXpEarned(0);

    const step = 100 / (durationSeconds * 10);
    progressTimerRef.current = setInterval(async () => {
      setGatherProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current!);
          progressTimerRef.current = null;
          
          // Trigger actual gather call
          gather(spawnId).then((res) => {
            if (res.success) {
              sfx.playSuccess();
              showStatus('Resource extracted successfully and cargo updated.', true);
            } else {
              sfx.playError();
              showStatus(res.error || 'Extraction failed.', false);
            }
            setActiveGatherId(null);
          });
          return 100;
        }
        return prev + step;
      });
    }, 100);
  };

  // ==========================================
  // COMBAT AREA MODAL SECTION
  // ==========================================
  const [selectedEnemyId, setSelectedEnemyId] = useState<number>(1);
  const [isCombatPanelOpen, setIsCombatPanelOpen] = useState(false);
  const [combatActiveTab, setCombatActiveTab] = useState<'overview' | 'enemies' | 'loot' | 'strategy'>('overview');
  const [combatOutcome, setCombatOutcome] = useState<{
    isVictory: boolean;
    xpGained?: number;
    currencyGained?: number;
    roundsLog?: RoundLog[];
    lootGained?: LootItem[];
    playerHp?: number;
  } | null>(null);

  const [isBattleAnimating, setIsBattleAnimating] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [animatedPlayerHp, setAnimatedPlayerHp] = useState(100);
  const [animatedEnemyHp, setAnimatedEnemyHp] = useState(100);
  const [maxPlayerHp, setMaxPlayerHp] = useState(100);
  const [maxEnemyHp, setMaxEnemyHp] = useState(100);
  const [arenaEnemyName, setArenaEnemyName] = useState('');
  const battleTimeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const [combatPanelTab, setCombatPanelTab] = useState<'overview' | 'enemies' | 'loot' | 'strategy'>('overview');

  // ==========================================

  // PROFILE / COMMANDER'S HALL SECTION
  // ==========================================
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<'identity' | 'stats' | 'gallery' | 'settings'>('identity');
  
  const [customBanner, setCustomBanner] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<string>('');
  const [commanderName, setCommanderName] = useState<string>('');
  const [commanderMotto, setCommanderMotto] = useState<string>('Commander of the Realm. Sentinel by day. Legend by night.');
  const [commanderBio, setCommanderBio] = useState<string>('A storied champion of the Solis Faction, guarding the trade borders of Genesis Capital.');
  const [selectedBadge, setSelectedBadge] = useState<string>('🛡️ Solis Vanguard');
  const [selectedTitle, setSelectedTitle] = useState<string>('Arch-Commander');
  const [featuredAchievements, setFeaturedAchievements] = useState<string[]>(['Founder', 'Dragon Slayer', 'Kingmaker']);
  
  const [showcaseItems, setShowcaseItems] = useState<Record<string, string>>({
    weapon: '⚔️ Aegis Vanguard Blade',
    mount: '🦄 Golden Pegasus Stride',
    companion: '🐦 Crimson Sky Phoenix',
    artifact: '🧿 Rune Sovereign Sigil'
  });
  const [galleryScreenshots, setGalleryScreenshots] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.username && !commanderName) {
      setCommanderName(profile.username);
    }
  }, [profile, commanderName]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sfx.playClick();
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCustomBanner(reader.result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aegis_profile_banner', reader.result);
        }
        showStatus("Royal Standard updated successfully!", true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sfx.playClick();
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCustomAvatar(reader.result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aegis_profile_avatar', reader.result);
        }
        showStatus("Portrait replaced successfully!", true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (galleryScreenshots.length >= 12) {
      sfx.playError();
      showStatus("Gallery is full! Maximum 12 screenshots allowed.", false);
      return;
    }
    sfx.playClick();
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const nextGallery = [...galleryScreenshots, reader.result];
        setGalleryScreenshots(nextGallery);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aegis_profile_gallery', JSON.stringify(nextGallery));
        }
        showStatus("Screenshot added to dossier gallery!", true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = (index: number) => {
    sfx.playClick();
    const nextGallery = galleryScreenshots.filter((_, i) => i !== index);
    setGalleryScreenshots(nextGallery);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis_profile_gallery', JSON.stringify(nextGallery));
    }
    showStatus("Screenshot removed from gallery.", true);
  };

  // Load customizations from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBanner = localStorage.getItem('aegis_profile_banner');
      if (savedBanner) setCustomBanner(savedBanner);
      const savedAvatar = localStorage.getItem('aegis_profile_avatar');
      if (savedAvatar) setCustomAvatar(savedAvatar);
      
      const savedBio = localStorage.getItem('aegis_profile_bio');
      if (savedBio) setCommanderBio(savedBio);
      const savedMotto = localStorage.getItem('aegis_profile_motto');
      if (savedMotto) setCommanderMotto(savedMotto);
      const savedTitle = localStorage.getItem('aegis_profile_title');
      if (savedTitle) setSelectedTitle(savedTitle);
      const savedName = localStorage.getItem('aegis_profile_name');
      if (savedName) setCommanderName(savedName);
      const savedBadge = localStorage.getItem('aegis_profile_badge');
      if (savedBadge) setSelectedBadge(savedBadge);
      
      const savedGallery = localStorage.getItem('aegis_profile_gallery');
      if (savedGallery) {
        try {
          setGalleryScreenshots(JSON.parse(savedGallery));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleFight = async () => {
    if (actionLoading || isBattleAnimating) return;
    sfx.playClick();
    setError(null);
    setCombatOutcome(null);

    const res = await executePvEBattle(selectedEnemyId);
    if (!res.success) {
      sfx.playError();
      setError(res.error || 'Failed to start battle.');
      return;
    }

    const { isVictory, xpGained, currencyGained, roundsLog, lootGained, playerHp } = res;
    
    // Find enemy stats
    const enemy = enemyTemplates.find(e => e.id === selectedEnemyId);
    const enemyName = enemy?.name || 'Fierce Beast';
    const enemyMaxHp = enemy?.health || 100;

    // Setup animations
    setArenaEnemyName(enemyName);
    setMaxPlayerHp(100);
    setMaxEnemyHp(enemyMaxHp);
    setAnimatedPlayerHp(100);
    setAnimatedEnemyHp(enemyMaxHp);
    setIsBattleAnimating(true);
    setCurrentRoundIndex(0);

    const outcome = {
      isVictory: !!isVictory,
      xpGained: xpGained || 0,
      currencyGained: currencyGained || 0,
      roundsLog: (roundsLog || []) as any[],
      lootGained: (lootGained || []).map(item => ({
        name: item.name,
        quantity: item.quantity
      })),
      playerHp: playerHp !== undefined ? playerHp : 100
    };

    setCombatOutcomeData(outcome);
    setCombatRounds((roundsLog || []) as any[]);
    setCombatActionMessage("⚔️ Battle commenced! Select an action to strike!");
    setPlayerFloatingText("");
    setEnemyFloatingText("");
  };

  const handleCombatAction = (skillName: string) => {
    if (currentRoundIndex >= combatRounds.length) return;
    
    const log = combatRounds[currentRoundIndex];
    if (!log) return;
    
    sfx.playClick();
    
    // Skill text visual response
    let skillMsg = "";
    if (skillName === "slash") skillMsg = "⚔️ Vanguard Slash strikes!";
    else if (skillName === "block") skillMsg = "🛡️ Aegis Shield Block activated!";
    else if (skillName === "siphon") skillMsg = "🩸 Focus Lifesteal Siphon cast!";
    
    setCombatActionMessage(skillMsg);
    setEnemyFloatingText(`-${log.damage} HP`);
    setAnimatedEnemyHp(Math.max(0, log.defender_hp));
    setEnemyHitActive(true);
    setTimeout(() => setEnemyHitActive(false), 250);
    
    const nextIdx = currentRoundIndex + 1;
    setCurrentRoundIndex(nextIdx);
    
    // If enemy counter-attack exists, execute it
    if (nextIdx < combatRounds.length && combatRounds[nextIdx].attacker !== 'Player') {
      setTimeout(() => {
        const enemyLog = combatRounds[nextIdx];
        let dmg = enemyLog.damage;
        
        // Skill modifications
        if (skillName === "block") {
          dmg = Math.max(0, Math.round(dmg * 0.4));
          setPlayerFloatingText(`Blocked! -${dmg} HP`);
        } else if (skillName === "siphon") {
          setPlayerFloatingText(`+8 HP (Leech) | -${dmg} HP`);
        } else {
          setPlayerFloatingText(`-${dmg} HP`);
        }
        
        setCombatActionMessage(`${arenaEnemyName} counter-strikes with ${enemyLog.action}!`);
        setAnimatedPlayerHp(Math.max(0, enemyLog.defender_hp));
        setPlayerHitActive(true);
        setTimeout(() => setPlayerHitActive(false), 250);
        
        setCurrentRoundIndex(nextIdx + 1);
        
        if (nextIdx + 1 >= combatRounds.length) {
          resolveCombat();
        }
      }, 750);
    } else {
      if (nextIdx >= combatRounds.length) {
        resolveCombat();
      }
    }
  };

  const handleAutoResolve = () => {
    if (!combatOutcomeData || combatRounds.length === 0) return;
    sfx.playClick();
    
    // Quick evaluate final results
    const finalRound = combatRounds[combatRounds.length - 1];
    let finalEnemyHp = 0;
    let finalPlayerHp = 100;
    
    if (finalRound) {
      if (finalRound.attacker === 'Player') {
        finalEnemyHp = finalRound.defender_hp;
        const prev = combatRounds[combatRounds.length - 2];
        finalPlayerHp = prev ? prev.defender_hp : 100;
      } else {
        finalPlayerHp = finalRound.defender_hp;
        const prev = combatRounds[combatRounds.length - 2];
        finalEnemyHp = prev ? prev.defender_hp : 0;
      }
    }
    
    setAnimatedEnemyHp(finalEnemyHp);
    setAnimatedPlayerHp(finalPlayerHp);
    setIsBattleAnimating(false);
    setCombatOutcome(combatOutcomeData);
    if (combatOutcomeData.isVictory) {
      sfx.playSuccess();
      confetti({ particleCount: 30, spread: 60 });
    } else {
      sfx.playError();
    }
  };

  const resolveCombat = () => {
    setTimeout(() => {
      setIsBattleAnimating(false);
      setCombatOutcome(combatOutcomeData);
      if (combatOutcomeData?.isVictory) {
        sfx.playSuccess();
        confetti({ particleCount: 35, spread: 60 });
      } else {
        sfx.playError();
      }
    }, 900);
  };

  // ==========================================
  // KINGDOM MODAL SECTION
  // ==========================================
  const handleClaimEnergy = async () => {
    sfx.playClick();
    const res = await claimEnergy();
    if (res.success) {
      sfx.playSuccess();
      showStatus('+100 EP claimed at national foundries!', true);
    } else {
      sfx.playError();
      showStatus(res.error || 'EP claim blocked!', false);
    }
  };

  // Coordinates Mapping for Region Markers
  const positionMap: Record<number, { top: string; left: string; label: string; icon: string }> = {
    1: { top: '48%', left: '52%', label: 'Aegis Hold (Castle)', icon: 'castle' },
    2: { top: '22%', left: '29%', label: 'Silverwood (Forest)', icon: 'forest' },
    3: { top: '34%', left: '88%', label: 'Mirelands (Guild)', icon: 'guild' },
    4: { top: '85%', left: '12%', label: 'Shattered Isles (Harbor)', icon: 'harbor' },
    5: { top: '78%', left: '68%', label: 'Sunscorched Expanse (Ruins)', icon: 'ruins' },
    6: { top: '70%', left: '42%', label: 'Greenvale (Village)', icon: 'village' },
    7: { top: '18%', left: '56%', label: 'Frostlands (Mine)', icon: 'mine' },
    8: { top: '58%', left: '84%', label: 'The Rift (Camp)', icon: 'camp' },
    9: { top: '50%', left: '62%', label: 'Oakhaven (Tavern)', icon: 'tavern' },
    10: { top: '34%', left: '16%', label: 'Alden Hold (City)', icon: 'city' },
  };

  const handleNodeClick = (region: any) => {
    sfx.playClick();
    setSelectedRegion(region);
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden bg-zinc-950">
      
      {/* Dynamic Style Injection for animated elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes routeFlow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .animate-route-flow {
          stroke-dasharray: 6, 4;
          animation: routeFlow 1.2s linear infinite;
        }
        @keyframes subtleBounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-6px); }
        }
        .animate-subtle-bounce {
          animation: subtleBounce 2s infinite ease-in-out;
        }
      `}} />

      {/* Dynamic Alerts */}
      <div className="absolute top-4 left-6 right-6 z-50 pointer-events-none flex flex-col gap-2">
        {error && (
          <div className="w-fit mx-auto px-4 py-2.5 border border-red-900 bg-red-950/70 text-red-300 text-xs font-bold font-display uppercase tracking-widest flex items-center gap-2 shadow-2xl pointer-events-auto">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="w-fit mx-auto px-4 py-2.5 border border-game-gold bg-zinc-900/90 text-game-gold text-xs font-bold font-display uppercase tracking-widest flex items-center gap-2 shadow-2xl pointer-events-auto">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* ==================================================================
         STRATEGIC LIVING WORLD MAP HUD (75% Screen height)
         ================================================================== */}
      <div className="relative flex-1 w-full bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden flex items-center justify-center select-none">
        
        {/* Subtle vignette layer inside the game screen */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none z-10" />

        {/* Ambient Map Weather fog drift */}
        <div className="rpg-fog-layer opacity-40 mix-blend-color-dodge pointer-events-none" />

        {/* Cinematic Map Frame (1:1 aspect map container scaled to fit main view) */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            opacity: fadeActive ? 1 : 0,
            transition: 'opacity 400ms ease-out'
          }}
          className="relative w-full h-full flex items-center justify-center z-0 overflow-hidden cursor-grab"
        >
          {/* Dim overlay when combat command panel is active */}
          {isCombatPanelOpen && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px] pointer-events-none z-25 transition-opacity duration-300" />
          )}

          {/* Start Tutorial / Help Codex (Slides in from the left) */}
          <div 
            className={`absolute top-4 left-4 z-30 w-72 rpg-panel-stone p-4 shadow-xl flex flex-col gap-2 text-left pointer-events-auto border-[#e5c158]/30 transition-all duration-500 ease-out transform ${
              (profile?.current_region_id === 1 && !selectedRegion)
                ? 'translate-x-0 opacity-100' 
                : '-translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
            }`}
          >
            <h4 className="text-xs font-bold text-game-gold uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Compass className="h-4 w-4" /> Aegis Commander Codex
            </h4>
            <p className="text-[10px] text-zinc-450 font-serif leading-relaxed">
              You are currently stationed in **Genesis Capital**. This safe-haven has no wild resources to gather.
            </p>
            <div className="bg-zinc-950/60 p-2 border border-zinc-900 text-[9px] text-zinc-450 font-serif">
              1. Click **Emerald Woodlands** (top-left forest node) on the map.
              <br />
              2. Click **Relocate link** (costs 10 Energy EP).
              <br />
              3. Once there, click **Gather** in the bottom HUD dock to harvest raw materials!
            </div>
          </div>

          {/* Region Detail Sidebar HUD Card (Slides in from the left) */}
          {activeDetailRegion && (
            <div 
              className={`absolute top-4 left-4 z-30 w-72 rpg-panel-wood p-4 shadow-2xl flex flex-col gap-3.5 text-left pointer-events-auto border-2 border-[#806b3a] transition-all duration-500 ease-out transform ${
                selectedRegion
                  ? 'translate-x-0 opacity-100' 
                  : '-translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
              }`}
            >
              {/* Corner Rivets */}
              <div className="rpg-rivet top-1 left-1" />
              <div className="rpg-rivet top-1 right-1" />
              <div className="rpg-rivet bottom-1 left-1" />
              <div className="rpg-rivet bottom-1 right-1" />

              <div className="flex justify-between items-start border-b border-game-gold/30 pb-2 relative z-10">
                <div>
                  <h3 className="text-xs font-bold text-game-gold font-display uppercase tracking-wider">{activeDetailRegion.name}</h3>
                  <p className="text-[8px] text-zinc-550 font-serif uppercase tracking-widest mt-0.5">
                    {countries.find(c => c.id === activeDetailRegion.country_id)?.name || 'Sovereign Nation'}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="p-1 border border-zinc-800 hover:border-game-gold text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Climate & Stats info */}
              <div className="grid grid-cols-2 gap-2 text-[9.5px] border-b border-zinc-900 pb-2 relative z-10">
                <div>
                  <span className="text-zinc-550 font-serif block">Climate Factor:</span>
                  <span className="text-zinc-350 capitalize font-bold">{activeDetailRegion.climate}</span>
                </div>
                <div>
                  <span className="text-zinc-550 font-serif block">GDP Census:</span>
                  <span className="text-zinc-350 font-bold font-pixel text-[10.5px]">{activeDetailRegion.population.toLocaleString()} citizens</span>
                </div>
              </div>

              {/* Raw resource deposits */}
              <div className="flex flex-col gap-1.5 border-b border-zinc-900 pb-2.5 relative z-10">
                <span className="text-[8px] uppercase tracking-widest text-[#b89030] font-black">Local Raw Deposits</span>
                <div className="flex flex-col gap-1 max-h-[90px] overflow-y-auto pr-0.5">
                  {spawns.filter(s => s.region_id === activeDetailRegion.id).map(spawn => {
                    const res = resources.find(r => r.id === spawn.resource_id);
                    return (
                      <div key={spawn.resource_id} className="flex justify-between items-center text-[9px] bg-zinc-950/60 p-1 border border-zinc-900">
                        <span className="text-zinc-300 font-serif">{res?.name}</span>
                        <span className="text-zinc-550 font-pixel">Rate: {spawn.spawn_weight.toFixed(2)}x ({spawn.energy_cost} EP)</span>
                      </div>
                    );
                  })}
                  {spawns.filter(s => s.region_id === activeDetailRegion.id).length === 0 && (
                    <span className="text-[8.5px] italic text-zinc-650 font-serif">No wild ores or logs spawn at these coordinates.</span>
                  )}
                </div>
              </div>

              {/* Actions Grid / Relocate Trigger */}
              <div className="mt-1 relative z-10">
                {activeDetailRegion.id === profile?.current_region_id ? (
                  <div className="flex flex-col gap-2">
                    <div className="px-2 py-1 bg-emerald-950/15 border border-game-emerald/30 text-game-emerald text-center font-bold font-display uppercase tracking-widest text-[8.5px]">
                      📍 Commander Stationed Here
                    </div>
                    
                    {/* Shortcut action buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {spawns.filter(s => s.region_id === activeDetailRegion.id).length > 0 && (
                        <button 
                          onClick={() => handleOpenTab('gather')}
                          className="rpg-button py-1.5 text-[8.5px] tracking-wide"
                        >
                          Extract Ore
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenTab('army')}
                        className="rpg-button py-1.5 text-[8.5px] tracking-wide"
                      >
                        Beast Arena
                      </button>
                      <button 
                        onClick={() => handleOpenTab('economy')}
                        className="rpg-button py-1.5 text-[8.5px] tracking-wide"
                      >
                        Smelting Forge
                      </button>
                      <button 
                        onClick={() => handleOpenTab('quests')}
                        className="rpg-button py-1.5 text-[8.5px] tracking-wide"
                      >
                        Accept Quests
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(() => {
                      const currentRegion = regions.find(r => r.id === profile?.current_region_id);
                      const isSameCountry = currentRegion?.country_id === activeDetailRegion.country_id;
                      const energyCost = isSameCountry ? 10 : 20;
                      const ticketCount = inventory.find(i => i.item_template_id === 3)?.quantity || 0;
                      const meetsEnergy = (stats?.energy || 0) >= energyCost;
                      const meetsTicket = isSameCountry || ticketCount > 0;
                      
                      return (
                        <>
                          <div className="text-[9px] font-serif text-zinc-400 leading-tight">
                            Sector relocation cost: <span className="text-zinc-205 font-bold">{energyCost} EP</span>
                            {!isSameCountry && (
                              <span className="text-amber-500 block mt-0.5">• Requires 1x Border Pass Ticket (Have {ticketCount})</span>
                            )}
                          </div>
                          
                          <button
                            disabled={actionLoading || isTraveling || !meetsEnergy || !meetsTicket}
                            onClick={async () => {
                              if (currentRegion) {
                                const startPos = positionMap[currentRegion.id];
                                const endPos = positionMap[activeDetailRegion.id];
                                setTravelSource(startPos);
                                setTravelDest(endPos);
                                setIsTraveling(true);
                                sfx.playClick();
                                
                                setTimeout(async () => {
                                  const res = await travel(activeDetailRegion.id);
                                  if (res.success) {
                                    sfx.playSuccess();
                                    showStatus(`Relocated coordinates to ${activeDetailRegion.name}!`, true);
                                  } else {
                                    sfx.playError();
                                    showStatus(res.error || 'Failed to sync travel coordinates.', false);
                                  }
                                  setIsTraveling(false);
                                  setTravelSource(null);
                                  setTravelDest(null);
                                }, 1500);
                              }
                            }}
                            className="rpg-button-royal py-2 text-[9px] w-full"
                          >
                            {isTraveling ? 'Relocating coordinates...' : `Relocate link (${energyCost} EP)`}
                          </button>
                          
                          {!meetsTicket && !isSameCountry && (
                            <div className="flex flex-col gap-1.5 mt-2 bg-[#2a1810] border border-[#5a4632]/40 p-2">
                              <span className="text-[8px] font-serif text-amber-550 leading-tight">
                                Inter-country flight requires a Travel Ticket border pass. Obtain one from Aegis Customs:
                              </span>
                              <button
                                onClick={async () => {
                                  const res = await claimTicket();
                                  if (res.success) {
                                    sfx.playSuccess();
                                    showStatus("Customs border pass successfully authorized!", true);
                                  } else {
                                    sfx.playError();
                                    showStatus(res.error || "Border pass claim failed.", false);
                                  }
                                }}
                                className="rpg-button-emerald py-1 text-[8px] tracking-wider w-full"
                              >
                                Request Free Border Pass
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Zoom Controls HUD */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5 bg-zinc-950/80 border border-[#5a4632]/50 p-1.5 shadow-lg select-none pointer-events-auto">
            <button 
              onClick={handleZoomIn}
              onMouseEnter={handleHover}
              className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-game-gold hover:border-game-gold font-bold text-lg cursor-pointer transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button 
              onClick={handleZoomOut}
              onMouseEnter={handleHover}
              className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-game-gold hover:border-game-gold font-bold text-lg cursor-pointer transition-colors"
              title="Zoom Out"
            >
              -
            </button>
          </div>

          <div
            ref={mapContentRef}
            style={{
              transform: 'translate3d(0px, 0px, 0) scale(1)',
              transformOrigin: 'center center',
              willChange: 'transform',
              width: '100%',
              aspectRatio: '6248/3944'
            }}
            className="relative flex items-center justify-center pointer-events-auto"
          >
            <img 
              src="/assets/backgrounds/fantasy_world_map.png" 
              alt="Aegis Kingdoms Strategy Map" 
              className="w-full h-full object-cover shadow-inner"
              draggable={false}
            />

            {/* Ambient Weather Overlay: Atmospheric clouds, blowing wind streams, and flocking birds */}
            <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
              <style>{`
                @keyframes float-cloud-img-1 {
                  0% { transform: translate3d(-400px, 80px, 0) scale(1.0); opacity: 0; }
                  10% { opacity: 0.35; }
                  90% { opacity: 0.35; }
                  100% { transform: translate3d(1100px, 120px, 0) scale(1.0); opacity: 0; }
                }
                @keyframes float-cloud-img-2 {
                  0% { transform: translate3d(-500px, 420px, 0) scale(1.25); opacity: 0; }
                  15% { opacity: 0.30; }
                  85% { opacity: 0.30; }
                  100% { transform: translate3d(1100px, 390px, 0) scale(1.25); opacity: 0; }
                }
                @keyframes float-cloud-img-3 {
                  0% { transform: translate3d(-350px, 700px, 0) scale(0.9); opacity: 0; }
                  12% { opacity: 0.32; }
                  88% { opacity: 0.32; }
                  100% { transform: translate3d(1100px, 670px, 0) scale(0.9); opacity: 0; }
                }
                @keyframes float-cloud-img-4 {
                  0% { transform: translate3d(-450px, 280px, 0) scale(1.1); opacity: 0; }
                  10% { opacity: 0.28; }
                  90% { opacity: 0.28; }
                  100% { transform: translate3d(1100px, 240px, 0) scale(1.1); opacity: 0; }
                }
                @keyframes wind-stream-1 {
                  0% { stroke-dashoffset: 600; opacity: 0; transform: translate3d(0, 0, 0); }
                  20% { opacity: 0.28; }
                  80% { opacity: 0.28; }
                  100% { stroke-dashoffset: 0; opacity: 0; transform: translate3d(350px, -40px, 0); }
                }
                @keyframes wind-stream-2 {
                  0% { stroke-dashoffset: 500; opacity: 0; transform: translate3d(150px, 0, 0); }
                  25% { opacity: 0.22; }
                  75% { opacity: 0.22; }
                  100% { stroke-dashoffset: 0; opacity: 0; transform: translate3d(500px, 30px, 0); }
                }
                @keyframes bird-flock-fly {
                  0% { transform: translate3d(1050px, 220px, 0) scale(0.65); opacity: 0; }
                  6% { opacity: 0.65; }
                  94% { opacity: 0.65; }
                  100% { transform: translate3d(-150px, 480px, 0) scale(0.65); opacity: 0; }
                }
                @keyframes wing-flap {
                  0%, 100% { transform: scaleY(1); }
                  50% { transform: scaleY(-0.4); }
                }

                .animate-cloud-image-1 { animation: float-cloud-img-1 90s infinite linear; }
                .animate-cloud-image-2 { animation: float-cloud-img-2 130s infinite linear; }
                .animate-cloud-image-3 { animation: float-cloud-img-3 105s infinite linear; }
                .animate-cloud-image-4 { animation: float-cloud-img-4 115s infinite linear; }

                .animate-wind-1 { animation: wind-stream-1 9s infinite linear; }
                .animate-wind-2 { animation: wind-stream-2 12s infinite linear; }

                .animate-bird-flock { animation: bird-flock-fly 42s infinite linear; }
                .animate-bird-wing { 
                  animation: wing-flap 0.35s infinite ease-in-out;
                  transform-origin: center center;
                }
              `}</style>

              {/* Cloud Shadows (rendered below the actual clouds, offset to the bottom-right) */}
              <g style={{ filter: 'brightness(0) blur(10px)', opacity: 0.12 }}>
                <image 
                  href="/assets/backgrounds/cloud1.png" 
                  x="20" 
                  y="20" 
                  width="400" 
                  height="400" 
                  className="animate-cloud-image-1" 
                />
                <image 
                  href="/assets/backgrounds/cloud2.png" 
                  x="25" 
                  y="25" 
                  width="500" 
                  height="500" 
                  className="animate-cloud-image-2" 
                />
                <image 
                  href="/assets/backgrounds/cloud3.png" 
                  x="18" 
                  y="18" 
                  width="350" 
                  height="350" 
                  className="animate-cloud-image-3" 
                />
                <image 
                  href="/assets/backgrounds/cloud4.png" 
                  x="22" 
                  y="22" 
                  width="420" 
                  height="420" 
                  className="animate-cloud-image-4" 
                />
              </g>

              {/* Hand-painted Watercolor Clouds Overlay using user's see-through assets */}
              <g>
                <image 
                  href="/assets/backgrounds/cloud1.png" 
                  x="0" 
                  y="0" 
                  width="400" 
                  height="400" 
                  className="animate-cloud-image-1" 
                />
                <image 
                  href="/assets/backgrounds/cloud2.png" 
                  x="0" 
                  y="0" 
                  width="500" 
                  height="500" 
                  className="animate-cloud-image-2" 
                />
                <image 
                  href="/assets/backgrounds/cloud3.png" 
                  x="0" 
                  y="0" 
                  width="350" 
                  height="350" 
                  className="animate-cloud-image-3" 
                />
                <image 
                  href="/assets/backgrounds/cloud4.png" 
                  x="0" 
                  y="0" 
                  width="420" 
                  height="420" 
                  className="animate-cloud-image-4" 
                />
              </g>

              {/* Wind Streams */}
              <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" fill="none">
                <path 
                  d="M 100,250 C 200,230 300,280 400,250 C 450,230 500,220 600,240" 
                  strokeDasharray="40, 200" 
                  className="animate-wind-1" 
                />
                <path 
                  d="M 150,550 C 280,530 350,580 480,560 C 550,540 650,550 780,570" 
                  strokeDasharray="50, 250" 
                  className="animate-wind-2" 
                />
              </g>

              {/* Flocking birds */}
              <g className="animate-bird-flock">
                {/* Bird 1 */}
                <path 
                  d="M -6,-3 L 0,0 L 6,-3" 
                  fill="none" 
                  stroke="rgba(0,0,0,0.5)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  className="animate-bird-wing" 
                  style={{ transform: 'translate(0px, 0px)' }}
                />
                {/* Bird 2 */}
                <path 
                  d="M -6,-3 L 0,0 L 6,-3" 
                  fill="none" 
                  stroke="rgba(0,0,0,0.5)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  className="animate-bird-wing" 
                  style={{ transform: 'translate(30px, 15px)' }}
                />
                {/* Bird 3 */}
                <path 
                  d="M -6,-3 L 0,0 L 6,-3" 
                  fill="none" 
                  stroke="rgba(0,0,0,0.5)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  className="animate-bird-wing" 
                  style={{ transform: 'translate(-25px, 20px)' }}
                />
                {/* Bird 4 */}
                <path 
                  d="M -6,-3 L 0,0 L 6,-3" 
                  fill="none" 
                  stroke="rgba(0,0,0,0.5)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  className="animate-bird-wing" 
                  style={{ transform: 'translate(15px, 35px)' }}
                />
              </g>
            </svg>

            {/* Travel routes connector lines with glowing dash movement */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {(() => {
                const connections = [
                  [1, 2], [1, 3], [1, 8], [1, 9], [1, 6],
                  [2, 10], [2, 5], [3, 7], [3, 9], [9, 4]
                ];
                return connections.map(([startId, endId], index) => {
                  const start = positionMap[startId];
                  const end = positionMap[endId];
                  if (!start || !end) return null;
                  return (
                    <line
                      key={index}
                      x1={start.left}
                      y1={start.top}
                      x2={end.left}
                      y2={end.top}
                      className="stroke-[#e5c158]/30 stroke-[2] animate-route-flow"
                    />
                  );
                });
              })()}
            </svg>

            {/* Traveler token path animation */}
            {isTraveling && travelSource && travelDest && (
              <motion.div
                initial={{ left: travelSource.left, top: travelSource.top }}
                animate={{ left: travelDest.left, top: travelDest.top }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full border-2 border-[#e5c158] bg-zinc-950 flex items-center justify-center shadow-[0_0_15px_#e5c158] pointer-events-none"
              >
                <Compass className="h-5 w-5 text-game-gold animate-spin" />
              </motion.div>
            )}

            {/* Interactive Skeuomorphic Map Location Nodes */}
            <div className="absolute inset-0 z-20">
              {regions.map((region, idx) => {
                const node = positionMap[region.id];
                if (!node) return null;
                const isCurrent = region.id === profile?.current_region_id;

                return (
                  <div 
                    key={region.id}
                    className={`absolute ${isCurrent ? 'animate-subtle-bounce' : ''}`}
                    style={{ top: node.top, left: node.left }}
                  >
                    <button 
                      onClick={() => handleNodeClick(region)}
                      onMouseEnter={handleHover}
                      className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 relative group cursor-pointer border ${
                        isCurrent 
                          ? 'bg-zinc-950 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.85)] z-20 scale-105' 
                          : 'bg-zinc-950/85 border-[#5a4632] hover:border-[#d4af37] hover:scale-110 z-10 shadow-lg'
                      }`}
                    >
                      {/* Pulsing indicator ring */}
                      {isCurrent && (
                        <span className="absolute inset-0 rounded-full border-2 border-[#d4af37] animate-ping opacity-50" />
                      )}

                      {/* Node visual icon map or Player Avatar */}
                      {isCurrent ? (
                        <span className="text-[14px] font-display font-black text-game-gold animate-pulse">
                          {profile?.username[0].toUpperCase()}
                        </span>
                      ) : (
                        <>
                          {node.icon === 'castle' && <Landmark className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'forest' && <Pickaxe className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'guild' && <Anchor className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'harbor' && <Globe className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'ruins' && <Compass className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'village' && <Radio className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'mine' && <Hammer className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'camp' && <Swords className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'tavern' && <Beer className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                          {node.icon === 'city' && <Coins className="h-5 w-5 text-[#d4af37]/75 group-hover:text-[#d4af37]" />}
                        </>
                      )}

                      {/* Mini node label tag */}
                      <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-zinc-950/90 text-[8.5px] text-zinc-300 border border-[#5a4632]/50 px-2 py-0.5 uppercase tracking-widest font-serif font-black whitespace-nowrap opacity-90 group-hover:opacity-100 shadow-md">
                        {region.name} {isCurrent ? '(Here)' : ''}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Ambient Lighting Overlay: God rays and warm border vignette */}
          <div 
            style={{ background: 'radial-gradient(circle, rgba(255,236,179,0.06) 0%, rgba(0,0,0,0.12) 100%)' }}
            className="absolute inset-0 pointer-events-none z-21 shadow-[inset_0_0_80px_rgba(0,0,0,0.18)]" 
          />
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full pointer-events-none z-21 mix-blend-color-dodge opacity-25">
            <defs>
              <linearGradient id="god-ray-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd54f" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ffd54f" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <style>{`
              @keyframes pulse-rays {
                0%, 100% { opacity: 0.45; }
                50% { opacity: 0.75; }
              }
              .animate-rays {
                animation: pulse-rays 14s infinite ease-in-out;
                transform-origin: top left;
              }
            `}</style>
            <polygon points="0,0 220,1000 370,1000 0,0 520,1000 700,1000" fill="url(#god-ray-grad)" className="animate-rays" />
            <polygon points="0,0 820,1000 970,1000" fill="url(#god-ray-grad)" className="animate-rays" style={{ animationDelay: '-5s' }} />
          </svg>

        </div>

      </div>

      {/* ==================================================================
         FLOATING ACTION DOCK (Centered bottom launcher bar)
         ================================================================== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
        <div className="rpg-texture-stone border-2 border-[#5a4632] px-6 py-3.5 flex items-center gap-4.5 shadow-[0_15px_35px_rgba(0,0,0,0.9)] max-w-2xl select-none">
          <div className="rpg-rivet top-1 left-1" />
          <div className="rpg-rivet top-1 right-1" />
          <div className="rpg-rivet bottom-1 left-1" />
          <div className="rpg-rivet bottom-1 right-1" />

          {/* Action Gather */}
          <button 
            onClick={() => handleOpenTab('gather')}
            onMouseEnter={handleHover}
            className={`rpg-utility-item px-3.5 py-2 flex flex-col items-center gap-1 border border-zinc-800 bg-zinc-950/60 uppercase font-serif text-[9px] tracking-widest ${activeTab === 'gather' ? 'rpg-utility-item-active' : ''}`}
          >
            <Pickaxe className="h-4 w-4" />
            <span>Gather</span>
          </button>

          {/* Action Combat */}
          <button 
            onClick={() => handleOpenTab('army')}
            onMouseEnter={handleHover}
            className={`rpg-utility-item px-3.5 py-2 flex flex-col items-center gap-1 border border-zinc-800 bg-zinc-950/60 uppercase font-serif text-[9px] tracking-widest ${activeTab === 'army' ? 'rpg-utility-item-active' : ''}`}
          >
            <Swords className="h-4 w-4" />
            <span>Battle</span>
          </button>

          {/* Action Trade */}
          <button 
            onClick={() => handleOpenTab('economy')}
            onMouseEnter={handleHover}
            className={`rpg-utility-item px-3.5 py-2 flex flex-col items-center gap-1 border border-zinc-800 bg-zinc-950/60 uppercase font-serif text-[9px] tracking-widest ${activeTab === 'economy' ? 'rpg-utility-item-active' : ''}`}
          >
            <Coins className="h-4 w-4" />
            <span>Trade</span>
          </button>

          {/* Action Inventory */}
          <button 
            onClick={() => handleOpenTab('inventory')}
            onMouseEnter={handleHover}
            className={`rpg-utility-item px-3.5 py-2 flex flex-col items-center gap-1 border border-zinc-800 bg-zinc-950/60 uppercase font-serif text-[9px] tracking-widest ${activeTab === 'inventory' ? 'rpg-utility-item-active' : ''}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Cargo</span>
          </button>

          {/* Action Quests */}
          <button 
            onClick={() => handleOpenTab('quests')}
            onMouseEnter={handleHover}
            className={`rpg-utility-item px-3.5 py-2 flex flex-col items-center gap-1 border border-zinc-800 bg-zinc-950/60 uppercase font-serif text-[9px] tracking-widest ${activeTab === 'quests' ? 'rpg-utility-item-active' : ''}`}
          >
            <Scroll className="h-4 w-4" />
            <span>Quests</span>
          </button>

          {/* Action Kingdom */}
          <button 
            onClick={() => handleOpenTab('kingdom')}
            onMouseEnter={handleHover}
            className={`rpg-utility-item px-3.5 py-2 flex flex-col items-center gap-1 border border-zinc-800 bg-zinc-950/60 uppercase font-serif text-[9px] tracking-widest ${activeTab === 'kingdom' ? 'rpg-utility-item-active' : ''}`}
          >
            <Landmark className="h-4 w-4" />
            <span>Kingdom</span>
          </button>
        </div>
      </div>

      {/* ==================================================================
         FLOATING CONTEXTUAL POPUPS (Parchment & Stone strategic overlays)
         ================================================================== */}
      <AnimatePresence>
        {activeTab !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-lg select-none"
          >
            <div className="rpg-texture-stone border-2 border-[#5a4632] p-6 shadow-2xl relative">
              <div className="rpg-rivet top-1.5 left-1.5" />
              <div className="rpg-rivet top-1.5 right-1.5" />
              <div className="rpg-rivet bottom-1.5 left-1.5" />
              <div className="rpg-rivet bottom-1.5 right-1.5" />

              {/* Close Button */}
              <button 
                onClick={handleCloseTab}
                className="absolute top-4 right-4 text-zinc-550 hover:text-zinc-250 cursor-pointer font-sans font-bold"
              >
                <X className="h-5 w-5" />
              </button>

              {/* ==========================================
                 TAB 1: GATHERING PANEL
                 ========================================== */}
              {/* ==========================================
                 TAB 1: GATHERING PANEL
                 ========================================== */}
              {activeTab === 'gather' && (
                <div className="flex flex-col gap-4 text-left">
                  <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#d4af37] border-b border-[#5a4632]/25 pb-2.5 flex items-center gap-2">
                    <Pickaxe className="h-4.5 w-4.5" />
                    <span>Resource Extraction</span>
                  </h3>
                  
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {regionSpawns.map((spawn) => {
                      const resDetails = resources.find(r => r.id === spawn.resource_id);
                      if (!resDetails) return null;
                      const isExtracting = activeGatherId === spawn.resource_id;

                      return (
                        <div key={spawn.resource_id} className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-3 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-zinc-250 font-serif text-sm">{resDetails.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-serif mt-0.5">Extraction requires {spawn.energy_cost} EP coordinates</p>
                            </div>
                            <span className="text-[10px] font-pixel text-zinc-500 font-bold uppercase tracking-wider">Available</span>
                          </div>

                          {isExtracting ? (
                            <div className="flex flex-col gap-2.5">
                              {/* Standard Progress Bar */}
                              <div className="w-full bg-zinc-900 border border-zinc-850 h-2">
                                <div 
                                  className="bg-gradient-to-r from-[#d4af37] to-[#ffe082] h-full"
                                  style={{ width: `${gatherProgress}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-pixel text-[#d4af37] text-right">Extracting: {Math.round(gatherProgress)}%</span>

                              {/* Timing check mini-game overlay */}
                              <div className="mt-1 flex flex-col gap-1.5 p-2.5 bg-zinc-950 border border-zinc-900 rounded-none">
                                <div className="flex justify-between text-[8px] uppercase tracking-widest text-zinc-550 font-bold">
                                  <span>Timing Needle: Sweet Spot</span>
                                  <span className="text-game-gold">Aim for Golden Zone!</span>
                                </div>
                                
                                <div className="relative w-full h-3.5 bg-zinc-900 border border-zinc-850 overflow-hidden shadow-inner">
                                  {/* Perfect Zone: 40% to 60% */}
                                  <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-emerald-500/20 border-l border-r border-emerald-500/40 animate-pulse" />
                                  <div className="absolute top-0 bottom-0 left-[45%] right-[45%] bg-game-gold/30" />
                                  
                                  {/* Needle */}
                                  <div 
                                    className="absolute top-0 bottom-0 w-1.5 bg-[#d4af37] shadow-[0_0_6px_#d4af37]"
                                    style={{ left: `${needlePos}%`, transition: 'none' }}
                                  />
                                </div>

                                <button
                                  onClick={() => {
                                    if (needlePos >= 40 && needlePos <= 60) {
                                      sfx.playSuccess();
                                      triggerFloatingText('PERFECT HARVEST! +25% Speed', 'text-game-emerald');
                                      setGatherProgress(prev => Math.min(100, prev + 25));
                                    } else {
                                      sfx.playClick();
                                      triggerFloatingText('Clang! Mistimed swing', 'text-zinc-650');
                                    }
                                  }}
                                  className="rpg-button py-1 text-[8.5px] uppercase tracking-widest w-full font-black text-game-gold"
                                >
                                  🔨 Strike Node
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              disabled={activeGatherId !== null || (stats ? stats.energy < spawn.energy_cost : true)}
                              onClick={() => handleStartGather(spawn.resource_id, spawn.production_time || 3)}
                              className="rpg-button-royal w-full py-2 text-[10px] tracking-widest"
                            >
                              Extract (cost {spawn.energy_cost} EP)
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {regionSpawns.length === 0 && (
                      <p className="text-zinc-650 text-center py-6 font-serif text-xs italic">No spawnable raw resources detected at these coordinates.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ARMY / COMBAT PANEL - DEPRECATED: Redesigned into slide-in right side Combat Command Panel */}

              {/* ==========================================
                 TAB 3: KINGDOM PANEL
                 ========================================== */}
              {activeTab === 'kingdom' && (
                <div className="flex flex-col gap-4 text-left">
                  <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#d4af37] border-b border-[#5a4632]/25 pb-2.5 flex items-center gap-2">
                    <Landmark className="h-4.5 w-4.5" />
                    <span>Kingdom Hub & Fort</span>
                  </h3>

                  <div className="bg-zinc-950 p-4 border border-zinc-900 flex flex-col gap-3 font-serif">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-550">Sovereign Coordinates:</span>
                      <span className="text-zinc-200 font-sans tracking-wide">{activeRegion?.name} ({activeCountry?.name})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-3">
                      <span className="text-zinc-550">Local Tax Rates:</span>
                      <span className="text-zinc-200 font-sans">8.5% VAT</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-3">
                      <span className="text-zinc-550">Commander Title:</span>
                      <span className="text-game-gold font-sans font-bold capitalize">{profile?.role}</span>
                    </div>
                  </div>

                  <div className="rpg-texture-leather p-4 flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 text-zinc-150">
                      <Flame className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-sans font-black uppercase tracking-wider">Restoration Foundry</span>
                        <span className="text-[8px] font-serif text-zinc-400">Claim 100 EP coordinate energy once per hour</span>
                      </div>
                    </div>
                    <button
                      onClick={handleClaimEnergy}
                      disabled={actionLoading}
                      className="rpg-button px-4 py-2 text-[9px] tracking-widest font-black uppercase text-game-gold border-game-gold"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              )}

              {/* ==========================================
                 TAB 4: ECONOMY / MARKETPLACE PANEL
                 ========================================== */}
              {activeTab === 'economy' && (
                <div className="flex flex-col gap-4 text-left">
                  <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#d4af37] border-b border-[#5a4632]/25 pb-2.5 flex items-center gap-2">
                    <Coins className="h-4.5 w-4.5" />
                    <span>Marketplace & Smelting</span>
                  </h3>

                  <div className="flex flex-col gap-3 font-serif max-h-[300px] overflow-y-auto pr-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-550 border-b border-zinc-900 pb-1.5">
                      National Smelting Recipes
                    </span>
                    
                    {recipes.map((recipe) => {
                      const resultTemplate = itemTemplates.find(t => t.id === recipe.result_template_id);
                      if (!resultTemplate) return null;
                      
                      const inputsMeet = recipe.inputs?.every(input => {
                        if (input.resource_id) {
                          const stock = playerResources.find(pr => pr.resource_id === input.resource_id);
                          return (stock?.quantity || 0) >= input.quantity;
                        }
                        if (input.item_template_id) {
                          const stock = inventory.find(i => i.item_template_id === input.item_template_id);
                          return (stock?.quantity || 0) >= input.quantity;
                        }
                        return true;
                      }) ?? true;
                      
                      const meetsLevel = (stats?.level || 1) >= recipe.required_level;
                      const meetsEnergy = (stats?.energy || 0) >= recipe.energy_cost;
                      const canForge = inputsMeet && meetsLevel && meetsEnergy;
                      
                      return (
                        <div key={recipe.id} className="bg-zinc-950 border border-zinc-900 p-3.5 flex flex-col gap-2.5 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-zinc-200 font-serif">{resultTemplate.name}</h4>
                              <p className="text-[9.5px] text-zinc-550 font-serif mt-0.5">{resultTemplate.description}</p>
                            </div>
                            <span className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 text-[8px] font-pixel text-zinc-400 capitalize">
                              {resultTemplate.rarity}
                            </span>
                          </div>
                          
                          {/* Inputs required details */}
                          <div className="flex flex-col gap-1 text-[9px] text-zinc-400">
                            <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Consumes:</span>
                            {recipe.inputs?.map((input, idx) => {
                              let name = "";
                              let stock = 0;
                              if (input.resource_id) {
                                name = resources.find(r => r.id === input.resource_id)?.name || "Raw Ore";
                                stock = playerResources.find(pr => pr.resource_id === input.resource_id)?.quantity || 0;
                              } else if (input.item_template_id) {
                                name = itemTemplates.find(t => t.id === input.item_template_id)?.name || "Item";
                                stock = inventory.find(i => i.item_template_id === input.item_template_id)?.quantity || 0;
                              }
                              return (
                                <div key={idx} className="flex justify-between items-center">
                                  <span>• {name} x{input.quantity}</span>
                                  <span className={stock >= input.quantity ? "text-emerald-400 font-pixel" : "text-red-500 font-pixel"}>
                                    Stock: {stock}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex justify-between text-[8px] font-pixel text-zinc-550">
                            <span>Cost: {recipe.energy_cost} EP</span>
                            <span>Reward: +{recipe.experience_reward} XP</span>
                          </div>

                          {activeForgingId === recipe.id ? (
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 h-full w-full animate-pulse" />
                              </div>
                              <span className="text-[8.5px] font-serif text-[#d4af37] text-center">
                                🔥 Hammering ore at the forge anvil...
                              </span>
                            </div>
                          ) : (
                            <button
                              disabled={!canForge || activeForgingId !== null}
                              onClick={async () => {
                                sfx.playClick();
                                setActiveForgingId(recipe.id);
                                
                                setTimeout(async () => {
                                  const res = await craftItem(recipe.id);
                                  if (res.success) {
                                    sfx.playSuccess();
                                    showStatus(`Successfully forged ${resultTemplate.name}!`, true);
                                    confetti({ particleCount: 20, spread: 50 });
                                  } else {
                                    sfx.playError();
                                    showStatus(res.error || "Forging failure. Materials unstable.", false);
                                  }
                                  setActiveForgingId(null);
                                }, 2500);
                              }}
                              className="rpg-button py-2 text-[9px] w-full mt-1"
                            >
                              {!meetsLevel ? `Requires Level ${recipe.required_level}` : !meetsEnergy ? "Insufficient Energy" : !inputsMeet ? "Missing Materials" : `Refine ${resultTemplate.name}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==========================================
                 TAB 5: QUESTS PANEL
                 ========================================== */}
              {activeTab === 'quests' && (
                <div className="flex flex-col gap-4 text-left">
                  <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#d4af37] border-b border-[#5a4632]/25 pb-2.5 flex items-center gap-2">
                    <Scroll className="h-4.5 w-4.5" />
                    <span>Storyline Chronicles</span>
                  </h3>

                  {activeQuest ? (
                    <div className="flex flex-col gap-4">
                      <div className="bg-zinc-950 p-4 border border-zinc-900">
                        <h4 className="font-bold font-serif text-zinc-150 text-sm">{activeQuest.title}</h4>
                        <p className="text-xs text-zinc-400 font-serif mt-1">{activeQuest.description}</p>
                      </div>

                      {(() => {
                        const current = activeQuest.progress_json?.current || 0;
                        const required = activeQuest.progress_json?.required || 1;
                        const percent = Math.min((current / required) * 100, 100);

                        return (
                          <div className="flex flex-col gap-2 bg-zinc-950 p-4 border border-zinc-900 shadow-inner">
                            <div className="flex justify-between text-[9px] font-pixel text-zinc-500">
                              <span>Target Objective: {current} / {required}</span>
                              <span>{percent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5">
                              <div className="bg-[#d4af37] h-full" style={{ width: `${percent}%` }} />
                            </div>
                            
                            <button
                              onClick={() => handleSimulateQuest(activeQuest.quest_id, current, required)}
                              className="rpg-button w-full mt-4 py-2.5 text-[10px]"
                            >
                              Simulate Adventure
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {staticQuests.filter(q => !playerQuests.some(pq => pq.quest_id === q.id)).slice(0, 3).map((quest) => (
                        <div key={quest.id} className="bg-zinc-950 border border-zinc-900 p-3.5 flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-bold text-zinc-250 font-serif">{quest.title}</h4>
                            <p className="text-[9.5px] text-zinc-500 font-serif mt-0.5">{quest.description}</p>
                          </div>
                          <button
                            onClick={() => handleStartQuest(quest.id)}
                            className="rpg-button rpg-button-emerald px-3.5 py-1.5 text-[9px] tracking-widest shrink-0"
                          >
                            Accept
                          </button>
                        </div>
                      ))}
                      {staticQuests.filter(q => !playerQuests.some(pq => pq.quest_id === q.id)).length === 0 && (
                        <p className="text-zinc-650 text-center py-6 font-serif text-xs italic">All storyline chronicles accepted or completed.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ==========================================
                 TAB 7: CARGO / INVENTORY PANEL
                 ========================================== */}
              {activeTab === 'inventory' && (
                <div className="flex flex-col gap-4 text-left">
                  <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#d4af37] border-b border-[#5a4632]/25 pb-2.5 flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5" />
                    <span>Cargo Inventory</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {inventory.map((item) => {
                      const template = itemTemplates.find(t => t.id === item.item_template_id);
                      const itemName = template?.name || 'Raw Material';
                      return (
                        <div key={item.id} className="bg-zinc-950 border border-zinc-900 p-3.5 flex justify-between items-center text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-zinc-200 font-serif">{itemName}</span>
                            <span className="text-[9px] text-[#d4af37] font-pixel tracking-wide mt-1">x{item.quantity} units</span>
                          </div>
                        </div>
                      );
                    })}
                    {inventory.length === 0 && (
                      <p className="col-span-2 text-zinc-650 text-center py-6 font-serif text-xs italic">Cargo hold is currently empty.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combat Command Slide-In Panel (Right Side) */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[25%] z-45 bg-zinc-950/95 border-l border-zinc-900 shadow-2xl flex flex-col transform transition-transform duration-350 ease-out text-left ${
          isCombatPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close trigger button */}
        <button 
          onClick={() => {
            sfx.playClose();
            setIsCombatPanelOpen(false);
            setCombatOutcome(null);
          }}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-game-gold hover:border-game-gold transition-colors pointer-events-auto"
          title="Close Combat Panel"
        >
          <X className="h-4 w-4" />
        </button>

        {(() => {
          const region = activeDetailRegion || regions.find(r => r.id === profile?.current_region_id);
          const country = countries.find(c => c.id === region?.country_id);
          const selectedEnemy = enemyTemplates.find(e => e.id === selectedEnemyId) || enemyTemplates[0];
          
          let biomeGradient = "from-emerald-950/80 via-zinc-900/80 to-zinc-950/95";
          let biomeDesc = "Lush green forests and ancient whispering trees.";
          if (region?.id === 1) {
            biomeGradient = "from-amber-950/85 via-zinc-900/80 to-zinc-950/95";
            biomeDesc = "Grand imperial seat of Solis Sovereigns.";
          } else if (region?.id === 2 || region?.id === 6) {
            biomeGradient = "from-zinc-800/80 via-slate-900/80 to-zinc-950/95";
            biomeDesc = "Cold high altitude mountain peaks and fortified stone ruins.";
          } else if (region?.id === 4 || region?.id === 8) {
            biomeGradient = "from-cyan-950/80 via-zinc-900/80 to-zinc-950/95";
            biomeDesc = "Deep glowing minerals and underground crystals caverns.";
          }

          const tabs = [
            { id: 'overview', name: 'Overview' },
            { id: 'enemies', name: 'Enemies' },
            { id: 'loot', name: 'Available Loot' },
            { id: 'strategy', name: 'Tactical Strategy' }
          ];

          return (
            <>
              {/* Dynamic Biome Banner Header */}
              <div className={`p-6 pb-5 pt-8 bg-gradient-to-r ${biomeGradient} border-b border-zinc-900 relative overflow-hidden shrink-0`}>
                {/* Background lighting flare */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-1 pr-6">
                  <div className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-widest text-[#d4af37] font-bold">
                    <Swords className="h-3.5 w-3.5" />
                    <span>Combat Command Sector</span>
                  </div>
                  <h2 className="text-xl font-bold font-serif text-zinc-100 tracking-wide mt-1">{region?.name}</h2>
                  <p className="text-[10px] text-zinc-400 font-serif italic mt-0.5 leading-relaxed">{biomeDesc}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 bg-zinc-950/80 border border-zinc-800 rounded-none text-[8.5px] text-zinc-350 uppercase tracking-widest">
                      Realm: {country?.name || "Independent"}
                    </span>
                    <span className="px-2 py-0.5 bg-red-950/50 border border-red-900/40 rounded-none text-[8.5px] text-red-400 uppercase tracking-widest font-bold">
                      Risk: {selectedEnemy?.difficulty || "Standard"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-zinc-900 shrink-0">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCombatPanelTab(tab.id as any)}
                    className={`flex-1 py-2.5 text-[8.5px] uppercase tracking-widest font-bold transition-all border-b-2 ${
                      combatPanelTab === tab.id
                        ? 'text-[#d4af37] border-[#d4af37] bg-zinc-950/60'
                        : 'text-zinc-550 border-transparent hover:text-zinc-300 hover:bg-zinc-900/30'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Main Content Area - Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0 relative">
                {isBattleAnimating ? (
                  /* Battle Clash State */
                  <div className="flex flex-col gap-5">
                    <div className="text-center border-b border-zinc-800/50 pb-3">
                      <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#d4af37] font-black">
                        ⚔ Active Combat Arena ⚔
                      </span>
                      <p className="text-[9px] text-zinc-500 mt-1 font-sans">{combatActionMessage}</p>
                    </div>

                    <div className="flex items-center justify-between w-full relative py-2">
                      {/* Commander fighter */}
                      <div className={`flex flex-col items-center gap-2 w-24 transition-transform duration-200 ${playerHitActive ? 'scale-90' : ''}`}>
                        <span className="text-[8px] font-bold text-zinc-300 font-display uppercase tracking-widest">Commander</span>
                        <div className="h-14 w-14 border border-[#d4af37]/40 bg-zinc-900/80 flex items-center justify-center font-bold text-[#d4af37] shadow-lg relative overflow-hidden rounded">
                          <span className="text-lg">{profile?.username?.[0]?.toUpperCase()}</span>
                          {playerFloatingText && (
                            <span className="absolute inset-0 bg-red-950/80 text-red-400 font-pixel text-xs flex items-center justify-center font-black animate-pulse">
                              {playerFloatingText}
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-zinc-900 border border-zinc-800/50 h-1.5">
                          <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-300" style={{ width: `${(animatedPlayerHp / maxPlayerHp) * 100}%` }} />
                        </div>
                        <span className="text-[8px] font-pixel text-zinc-500">{animatedPlayerHp}/{maxPlayerHp} HP</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-black text-[#d4af37] uppercase tracking-widest font-serif animate-pulse">VS</span>
                        <span className="text-[7px] font-pixel text-zinc-600">Round {Math.floor(currentRoundIndex / 2) + 1}</span>
                      </div>

                      {/* Enemy fighter */}
                      <div className={`flex flex-col items-center gap-2 w-24 transition-transform duration-200 ${enemyHitActive ? 'scale-90' : ''}`}>
                        <span className="text-[8px] font-bold text-zinc-300 font-serif truncate max-w-[90px]">{arenaEnemyName}</span>
                        <div className="h-14 w-14 border border-red-900/40 bg-zinc-900/80 flex items-center justify-center font-bold text-red-400 shadow-lg relative overflow-hidden rounded">
                          <span className="text-lg">👾</span>
                          {enemyFloatingText && (
                            <span className="absolute inset-0 bg-red-950/80 text-red-400 font-pixel text-[10px] flex items-center justify-center font-black animate-pulse">
                              {enemyFloatingText}
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-zinc-900 border border-zinc-800/50 h-1.5">
                          <div className="bg-gradient-to-r from-red-700 to-red-500 h-full transition-all duration-300" style={{ width: `${(animatedEnemyHp / maxEnemyHp) * 100}%` }} />
                        </div>
                        <span className="text-[8px] font-pixel text-zinc-500">{animatedEnemyHp}/{maxEnemyHp} HP</span>
                      </div>
                    </div>

                    {/* Combat Actions */}
                    <div className="border-t border-zinc-800/50 pt-3 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={() => handleCombatAction('slash')} disabled={currentRoundIndex >= combatRounds.length} className="rpg-button py-2 text-[8px] tracking-wide hover:scale-105 transition-transform">
                          ⚔️ Slash
                        </button>
                        <button onClick={() => handleCombatAction('block')} disabled={currentRoundIndex >= combatRounds.length} className="rpg-button py-2 text-[8px] tracking-wide hover:scale-105 transition-transform">
                          🛡️ Block
                        </button>
                        <button onClick={() => handleCombatAction('siphon')} disabled={currentRoundIndex >= combatRounds.length} className="rpg-button py-2 text-[8px] tracking-wide hover:scale-105 transition-transform">
                          🔮 Siphon
                        </button>
                      </div>
                      <button onClick={handleAutoResolve} className="rpg-button-crimson py-2 text-[8px] uppercase tracking-widest w-full font-black">
                        Auto-Resolve Clash
                      </button>
                    </div>
                  </div>
                ) : combatOutcome ? (
                  /* Victory / Defeat Result */
                  <div className="flex flex-col gap-5">
                    <div className="text-center">
                      <span className={`text-xl font-bold font-serif uppercase tracking-widest ${combatOutcome.isVictory ? 'text-[#d4af37]' : 'text-red-500'}`}>
                        {combatOutcome.isVictory ? '🏆 Victory Claims' : '💀 Battle Defeat'}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-serif uppercase tracking-wider mt-1">
                        {combatOutcome.isVictory ? 'Spoils secured successfully' : 'Commander retreats to camp'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-800/50 py-4 text-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500">Experience</span>
                        <span className="text-base font-pixel text-indigo-400 mt-1">+{combatOutcome.xpGained} XP</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500">Gold</span>
                        <span className="text-base font-pixel text-game-gold mt-1">+{combatOutcome.currencyGained?.toFixed(2)}</span>
                      </div>
                    </div>

                    {combatOutcome.lootGained && combatOutcome.lootGained.length > 0 && (
                      <div className="text-left">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Loot Collected</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {combatOutcome.lootGained.map((loot, idx) => (
                            <div key={idx} className="px-2 py-1 border border-zinc-800/50 bg-zinc-900/50 text-[9px] text-zinc-350 font-serif flex items-center gap-1">
                              <span>🎒</span>
                              <span>{loot.name}</span>
                              <span className="text-[#d4af37] font-bold font-pixel">x{loot.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button onClick={handleFight} className="rpg-button-royal py-2.5 text-[9px] uppercase tracking-widest flex-1 font-bold hover:scale-[1.02] transition-transform">
                        Fight Again
                      </button>
                      <button onClick={() => { setCombatOutcome(null); setIsCombatPanelOpen(false); }} className="rpg-button-stone py-2.5 text-[9px] uppercase tracking-widest flex-1 font-bold hover:scale-[1.02] transition-transform">
                        Return to Map
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tab Content */
                  <div className="flex flex-col gap-4">
                    {combatPanelTab === 'overview' && (
                      <div className="flex flex-col gap-4">
                        {/* Selected Enemy Card */}
                        <div className="bg-zinc-900/60 border border-zinc-900 p-4 flex flex-col items-center gap-3">
                          <div className="h-16 w-16 border border-[#d4af37]/40 bg-zinc-900/80 flex items-center justify-center shadow-lg rounded">
                            <span className="text-3xl">👾</span>
                          </div>
                          <div className="text-center">
                            <h3 className="text-base font-bold font-serif text-zinc-100">{selectedEnemy?.name}</h3>
                            <span className="text-[8px] text-red-400 uppercase tracking-widest font-bold">{selectedEnemy?.difficulty} Threat</span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 w-full">
                            {[
                              { label: 'HP', val: selectedEnemy?.health, color: 'text-emerald-400' },
                              { label: 'ATK', val: selectedEnemy?.attack, color: 'text-red-400' },
                              { label: 'DEF', val: selectedEnemy?.defense, color: 'text-blue-400' },
                              { label: 'SPD', val: selectedEnemy?.speed, color: 'text-amber-400' }
                            ].map((s, i) => (
                              <div key={i} className="bg-zinc-950/60 border border-zinc-800/40 p-2 text-center flex flex-col gap-0.5">
                                <span className="text-[7px] text-zinc-550 uppercase tracking-widest">{s.label}</span>
                                <span className={`text-xs font-pixel font-bold ${s.color}`}>{s.val}</span>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2 w-full border-t border-zinc-800/40 pt-2">
                            <div className="flex flex-col items-center gap-0.5 bg-zinc-950/40 border border-zinc-800/30 p-2">
                              <span className="text-[7px] text-zinc-550 uppercase tracking-widest">XP Reward</span>
                              <span className="text-xs font-pixel text-indigo-400">+{selectedEnemy?.xp_reward || 35}</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5 bg-zinc-950/40 border border-zinc-800/30 p-2">
                              <span className="text-[7px] text-zinc-550 uppercase tracking-widest">Gold Reward</span>
                              <span className="text-xs font-pixel text-[#d4af37]">+{selectedEnemy?.currency_reward || 15}</span>
                            </div>
                          </div>
                        </div>

                        {/* Enemy selector */}
                        <select 
                          value={selectedEnemyId}
                          onChange={(e) => setSelectedEnemyId(parseInt(e.target.value))}
                          className="w-full bg-zinc-950/80 border border-zinc-800/50 text-zinc-200 p-2 text-[10px] font-sans tracking-wide focus:outline-none focus:border-[#d4af37]/40"
                        >
                          {enemyTemplates.map(enemy => (
                            <option key={enemy.id} value={enemy.id}>
                              {enemy.name} ({enemy.difficulty}) — HP: {enemy.health}
                            </option>
                          ))}
                        </select>

                        {/* Fight button */}
                        <button
                          onClick={handleFight}
                          disabled={actionLoading}
                          className="w-full py-3 bg-gradient-to-r from-amber-900/80 via-[#d4af37]/90 to-amber-900/80 border border-[#d4af37]/60 text-zinc-950 font-black font-serif text-xs uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <span>⚔</span>
                          <span>Begin Battle (25 EP)</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => { sfx.playClick(); showStatus("Scouting coordinates... Beast spawns are alert!", true); }}
                            className="rpg-button py-2 text-[8px] uppercase tracking-wider hover:scale-[1.02] transition-transform"
                          >
                            🔍 Scout Area
                          </button>
                          <button
                            onClick={() => { sfx.playClick(); handleAutoResolve(); }}
                            className="rpg-button py-2 text-[8px] uppercase tracking-wider hover:scale-[1.02] transition-transform"
                          >
                            ⚡ Auto Battle
                          </button>
                        </div>
                      </div>
                    )}

                    {combatPanelTab === 'enemies' && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Available Hostiles</span>
                        {enemyTemplates.map(enemy => (
                          <button
                            key={enemy.id}
                            onClick={() => { sfx.playClick(); setSelectedEnemyId(enemy.id); setCombatPanelTab('overview'); }}
                            className={`w-full text-left p-3 border transition-all ${
                              selectedEnemyId === enemy.id
                                ? 'border-[#d4af37]/50 bg-zinc-900/60'
                                : 'border-zinc-800/40 bg-zinc-900/30 hover:border-zinc-700/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">👾</span>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-serif font-bold text-zinc-200">{enemy.name}</span>
                                <div className="flex gap-2 text-[8px] text-zinc-500">
                                  <span>HP: {enemy.health}</span>
                                  <span>ATK: {enemy.attack}</span>
                                  <span className={`font-bold ${(enemy.difficulty === 'boss' || enemy.difficulty === 'hard') ? 'text-red-400' : enemy.difficulty === 'epic' ? 'text-purple-400' : 'text-emerald-400'}`}>
                                    {enemy.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {combatPanelTab === 'loot' && (
                      <div className="flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Potential Drops</span>
                        {[
                          { name: 'Beast Hide', rarity: 'Common', chance: '45%', color: 'text-zinc-400' },
                          { name: 'Shadow Essence', rarity: 'Uncommon', chance: '25%', color: 'text-emerald-400' },
                          { name: 'Dragonbone Fragment', rarity: 'Rare', chance: '10%', color: 'text-blue-400' },
                          { name: 'Aegis Rune', rarity: 'Epic', chance: '3%', color: 'text-purple-400' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800/40">
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-serif font-bold ${item.color}`}>{item.name}</span>
                              <span className="text-[7.5px] text-zinc-600 uppercase tracking-widest">{item.rarity}</span>
                            </div>
                            <span className="text-[9px] font-pixel text-zinc-400">{item.chance}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {combatPanelTab === 'strategy' && (
                      <div className="flex flex-col gap-3">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Combat Mechanics</span>
                        <div className="flex flex-col gap-2 text-[9px] font-serif text-zinc-400 leading-relaxed">
                          <div className="p-2.5 bg-zinc-900/60 border border-zinc-900 flex gap-2">
                            <span className="text-game-gold">⚔️</span>
                            <span><strong>Slash</strong> is a vanguard strike — high damage, counters Siphon casters.</span>
                          </div>
                          <div className="p-2.5 bg-zinc-900/60 border border-zinc-900 flex gap-2">
                            <span className="text-game-gold">🛡️</span>
                            <span><strong>Block</strong> shields incoming Vanguard Slashes, absorbs full damage.</span>
                          </div>
                          <div className="p-2.5 bg-zinc-900/60 border border-zinc-900 flex gap-2">
                            <span className="text-game-gold">🔮</span>
                            <span><strong>Siphon</strong> bypasses Aegis Shields, drains opponent health pools.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
      {/* Commander's Hall Profile Panel (Right Side Slide-in) */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[25%] z-45 bg-zinc-950/95 border-l border-zinc-900 shadow-2xl flex flex-col transform transition-transform duration-350 ease-out text-left ${
          isProfilePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close trigger button */}
        <button 
          onClick={() => {
            sfx.playClose();
            setIsProfilePanelOpen(false);
          }}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-game-gold hover:border-game-gold transition-colors pointer-events-auto"
          title="Close Profile Panel"
        >
          <X className="h-4 w-4" />
        </button>

        {(() => {
          const region = activeDetailRegion || regions.find(r => r.id === profile?.current_region_id);
          const country = countries.find(c => c.id === region?.country_id);

          const defaultBanner = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"><rect width="100%" height="100%" fill="%231c1917"/><path d="M 0 0 L 600 200 M 0 200 L 600 0" stroke="%233f3f46" stroke-width="2" opacity="0.15"/><circle cx="300" cy="100" r="80" fill="none" stroke="%23d4af37" stroke-width="1" stroke-dasharray="5 5" opacity="0.25"/><path d="M 0 100 Q 300 50 600 100" fill="none" stroke="%23d4af37" stroke-width="1.5" opacity="0.15"/></svg>`;
          const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%2309090b" stroke="%23d4af37" stroke-width="2"/><text x="50%" y="60%" font-size="36" font-family="serif" text-anchor="middle" fill="%23d4af37">🛡️</text></svg>`;

          const availableBadges = [
            '🛡️ Solis Vanguard', '⚔️ Dragon Slayer', '👑 Kingmaker', 
            '💰 Wealthy Merchant', '🏰 Castle Architect', '🌟 Founder'
          ];
          const availableTitles = [
            'Arch-Commander', 'Grand Marshal', 'Baron of Genesis', 
            'Lord Sentinel', 'Sovereign Knight', 'Master Builder'
          ];

          return (
            <>
              {/* Cinematic Banner Standard Header */}
              <div className="relative w-full h-44 bg-zinc-900 border-b border-zinc-900 shrink-0 group">
                <img 
                  src={customBanner || defaultBanner} 
                  alt="Royal Standard"
                  className="w-full h-full object-cover opacity-80" 
                />
                {/* Banner overlay with gold frame trim */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
                
                {/* Replace Standard Trigger */}
                <label 
                  htmlFor="banner-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-xs font-serif text-game-gold font-bold tracking-widest uppercase z-10 pointer-events-auto"
                >
                  🚩 Replace Standard
                </label>
                <input 
                  type="file" 
                  id="banner-upload" 
                  accept="image/*" 
                  onChange={handleBannerUpload} 
                  className="hidden" 
                />

                {/* overlapping Avatar Frame (Portrait) */}
                <div className="absolute -bottom-8 left-6 z-20 group/avatar">
                  <div className="relative h-18 w-18 rounded-full border-2 border-[#e5c158] bg-zinc-950 overflow-hidden shadow-lg flex items-center justify-center">
                    <img 
                      src={customAvatar || defaultAvatar} 
                      alt="Commander Portrait"
                      className="w-full h-full object-cover" 
                    />
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer text-[8px] font-serif text-game-gold text-center font-black uppercase p-1 z-10 pointer-events-auto"
                    >
                      📷 Replace Portrait
                    </label>
                  </div>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Dossier Meta info block */}
              <div className="pt-10 px-5 pb-3 border-b border-zinc-900 shrink-0">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold font-serif text-zinc-150 tracking-wide">{commanderName || profile?.username}</h2>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Commander is active" />
                    </div>
                    <span className="text-[10px] text-[#e5c158] font-serif font-bold uppercase tracking-wider mt-0.5">{selectedTitle}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-pixel text-[#e5c158] font-bold">Lvl {stats?.level}</span>
                    <span className="text-[8px] text-zinc-500 font-pixel uppercase mt-0.5">{stats?.experience} / 1000 EXP</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 text-[9px]">
                  <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900/60 font-serif text-zinc-400">
                    Nation: {country?.name || "Solis Alliance"}
                  </span>
                  <span className="px-2 py-0.5 border border-zinc-800 bg-zinc-900/60 font-serif text-zinc-400">
                    Badge: {selectedBadge}
                  </span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-4 gap-1 border-b border-zinc-900 p-3 shrink-0">
                {[
                  { id: 'identity', label: 'Identity' },
                  { id: 'stats', label: 'Stats' },
                  { id: 'gallery', label: 'Gallery' },
                  { id: 'settings', label: 'Archives' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProfileActiveTab(tab.id as any)}
                    className={`py-1.5 text-center text-[8.5px] uppercase tracking-widest border transition-all ${
                      profileActiveTab === tab.id
                        ? 'border-[#e5c158]/55 bg-zinc-900 text-game-gold font-bold'
                        : 'border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Tab Content Container */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0 relative">
                {profileActiveTab === 'identity' && (
                  <div className="flex flex-col gap-4.5">
                    {/* Motto and Custom Chronicle Form */}
                    <div className="flex flex-col gap-3.5 bg-zinc-900/35 border border-zinc-900 p-4">
                      <span className="text-[8.5px] uppercase tracking-widest text-game-gold font-black block">Edit Commander Records</span>
                      
                      <div className="flex flex-col gap-1 text-xs">
                        <label className="text-[9px] text-zinc-500 font-serif">NickName / Crest Name</label>
                        <input 
                          type="text"
                          value={commanderName}
                          onChange={(e) => {
                            setCommanderName(e.target.value);
                            localStorage.setItem('aegis_profile_name', e.target.value);
                          }}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-150 p-2 text-[11px] font-sans tracking-wide focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <label className="text-[9px] text-zinc-500 font-serif">Favorite Title</label>
                        <select 
                          value={selectedTitle}
                          onChange={(e) => {
                            setSelectedTitle(e.target.value);
                            localStorage.setItem('aegis_profile_title', e.target.value);
                          }}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-150 p-2 text-[11px] font-sans focus:outline-none"
                        >
                          {availableTitles.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <label className="text-[9px] text-zinc-500 font-serif">Selected Badge</label>
                        <select 
                          value={selectedBadge}
                          onChange={(e) => {
                            setSelectedBadge(e.target.value);
                            localStorage.setItem('aegis_profile_badge', e.target.value);
                          }}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-150 p-2 text-[11px] font-sans focus:outline-none"
                        >
                          {availableBadges.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <label className="text-[9px] text-zinc-500 font-serif">Commander Motto</label>
                        <input 
                          type="text"
                          value={commanderMotto}
                          onChange={(e) => {
                            setCommanderMotto(e.target.value);
                            localStorage.setItem('aegis_profile_motto', e.target.value);
                          }}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-150 p-2 text-[11px] font-sans focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-serif">
                          <span>Commander Chronicle</span>
                          <span className={`${commanderBio.length >= 300 ? 'text-red-500 font-bold' : ''}`}>
                            {commanderBio.length}/300
                          </span>
                        </div>
                        <textarea 
                          maxLength={300}
                          value={commanderBio}
                          onChange={(e) => {
                            setCommanderBio(e.target.value);
                            localStorage.setItem('aegis_profile_bio', e.target.value);
                          }}
                          rows={3}
                          className="bg-zinc-950 border border-zinc-900 text-zinc-205 p-2 text-[11px] font-serif leading-relaxed focus:outline-none focus:border-zinc-800 resize-none"
                        />
                      </div>
                    </div>

                    {/* Featured Achievements */}
                    <div className="flex flex-col gap-3.5 bg-zinc-900/35 border border-zinc-900 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] uppercase tracking-widest text-[#d4af37] font-black">Featured Achievements</span>
                        <span className="text-[8px] font-pixel text-zinc-500">(Max 6 Featured)</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {['Founder', 'Dragon Slayer', 'Kingmaker', 'Wealthiest Merchant', 'Castle Architect', 'Guild Leader', 'High Relic Hunter'].map(ach => {
                          const isFeatured = featuredAchievements.includes(ach);
                          return (
                            <button
                              key={ach}
                              onClick={() => {
                                sfx.playClick();
                                if (isFeatured) {
                                  setFeaturedAchievements(prev => prev.filter(a => a !== ach));
                                } else {
                                  if (featuredAchievements.length >= 6) {
                                    showStatus("Maximum of 6 achievements can be featured!", false);
                                    return;
                                  }
                                  setFeaturedAchievements(prev => [...prev, ach]);
                                }
                              }}
                              className={`px-2.5 py-1.5 border text-[9.5px] font-serif transition-colors flex items-center gap-1 ${
                                isFeatured
                                  ? 'border-amber-900/50 bg-amber-950/15 text-game-gold shadow-[inset_0_0_10px_rgba(245,158,11,0.15)] font-bold'
                                  : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:text-zinc-350 hover:border-zinc-850'
                              }`}
                            >
                              <span>🏆</span>
                              <span>{ach}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Collection Showcase */}
                    <div className="flex flex-col gap-3.5 bg-zinc-900/35 border border-zinc-900 p-4">
                      <span className="text-[8.5px] uppercase tracking-widest text-game-gold font-bold">Featured Collections</span>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        {Object.entries(showcaseItems).map(([category, value]) => (
                          <div key={category} className="p-3 border border-amber-900/40 bg-amber-950/15 text-[10px] font-serif shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] flex flex-col gap-1">
                            <span className="text-[7.5px] uppercase tracking-widest text-zinc-550 capitalize">{category}</span>
                            <span className="text-zinc-200 font-bold leading-tight">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'stats' && (
                  <div className="flex flex-col gap-4.5">
                    {/* Stat Cards Grid */}
                    <div className="flex flex-col gap-3 bg-zinc-900/35 border border-zinc-900 p-4">
                      <span className="text-[8.5px] uppercase tracking-widest text-[#d4af37] font-black">Commander Record Stats</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Commander Level', val: `Lvl ${stats?.level || 1}` },
                          { label: 'Total Power', val: `${(stats?.level || 1) * 240 + 850} CP` },
                          { label: 'Battles Won', val: '42 Wins' },
                          { label: 'Battles Lost', val: '12 Defeats' },
                          { label: 'Resources Harvested', val: '1,420 Units' },
                          { label: 'Enemies Defeated', val: '180 Beasts' },
                          { label: 'Kingdom Wealth', val: `${(currencies?.gold ?? 0).toFixed(2)} Gold` },
                          { label: 'Exploration Rate', val: '82%' }
                        ].map((stat, i) => (
                          <div key={i} className="p-2.5 bg-zinc-950/60 border border-zinc-900 flex justify-between items-center text-[10px] font-serif">
                            <span className="text-zinc-500">{stat.label}:</span>
                            <span className="text-zinc-250 font-sans font-bold">{stat.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="flex flex-col gap-3 bg-zinc-900/35 border border-zinc-900 p-4">
                      <span className="text-[8.5px] uppercase tracking-widest text-game-gold font-bold">Commander Chronicle Timeline</span>
                      
                      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {[
                          { msg: 'Defeated Cave Ogre at Crystal Caverns', date: '2 hours ago' },
                          { msg: 'Harvested 35x Smelting Iron Ore at Emerald Woodlands', date: '4 hours ago' },
                          { msg: 'Upgraded Commander level to Lvl 24', date: '1 day ago' },
                          { msg: 'Relocated commander squad coordinates to Genesis Capital', date: '2 days ago' },
                          { msg: 'Completed Quest: Clearing the Trade Caravan Routes', date: '3 days ago' }
                        ].map((act, i) => (
                          <div key={i} className="p-2 bg-zinc-950 border border-zinc-900/80 flex flex-col gap-0.5 text-left text-[9.5px]">
                            <span className="text-zinc-300 font-serif leading-tight">{act.msg}</span>
                            <span className="text-[8px] text-zinc-550 font-sans">{act.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profileActiveTab === 'gallery' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center shrink-0">
                      <span className="text-[8.5px] uppercase tracking-widest text-[#d4af37] font-black">Commander Screen Dossier</span>
                      <label 
                        htmlFor="gallery-upload"
                        className="rpg-button px-3.5 py-1 text-[8.5px] uppercase tracking-widest cursor-pointer font-bold pointer-events-auto"
                      >
                        📷 Add Screenshot
                      </label>
                      <input 
                        type="file" 
                        id="gallery-upload" 
                        accept="image/*" 
                        onChange={handleScreenshotUpload} 
                        className="hidden" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {galleryScreenshots.map((scr, idx) => (
                        <div key={idx} className="relative aspect-video border border-zinc-900 bg-zinc-950 group/img flex items-center justify-center">
                          <img 
                            src={scr} 
                            alt={`Gallery screenshot ${idx}`} 
                            className="w-full h-full object-cover" 
                          />
                          <button 
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-red-950/80 border border-red-900/40 text-red-400 font-bold text-[9px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-auto hover:bg-red-900 hover:text-white"
                            title="Delete Screenshot"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      {galleryScreenshots.length === 0 && (
                        <p className="col-span-2 text-zinc-650 text-center py-12 font-serif text-xs italic">
                          No screen captures uploaded to dossier records yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {profileActiveTab === 'settings' && (
                  <div className="flex flex-col gap-4 bg-zinc-900/35 border border-zinc-900 p-4">
                    <span className="text-[8.5px] uppercase tracking-widest text-[#d4af37] font-black">Royal Archives Settings</span>
                    
                    <div className="flex flex-col gap-3.5 text-xs text-left">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-550 font-serif">Royal Email Address</label>
                        <input 
                          type="email" 
                          placeholder="commander@aegiskingdoms.com"
                          className="bg-zinc-950 border border-zinc-900 text-zinc-150 p-2 text-[11px] font-sans focus:outline-none"
                          disabled
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-550 font-serif">Commander Password</label>
                        <input 
                          type="password" 
                          value="••••••••••••••"
                          className="bg-zinc-950 border border-zinc-900 text-zinc-150 p-2 text-[11px] font-sans focus:outline-none"
                          disabled
                        />
                      </div>

                      <div className="flex flex-col gap-2 mt-2 border-t border-zinc-900 pt-3">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Preferences</span>
                        
                        <label className="flex items-center gap-2 cursor-pointer py-1 font-serif text-[11px] text-zinc-400 hover:text-zinc-200">
                          <input type="checkbox" defaultChecked className="rounded-none accent-[#e5c158]" />
                          <span>Receive Royal Edicts via Email</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer py-1 font-serif text-[11px] text-zinc-400 hover:text-zinc-200">
                          <input type="checkbox" defaultChecked className="rounded-none accent-[#e5c158]" />
                          <span>Enable Ambient Weather Audio Loops</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer py-1 font-serif text-[11px] text-zinc-400 hover:text-zinc-200">
                          <input type="checkbox" defaultChecked className="rounded-none accent-[#e5c158]" />
                          <span>Enable High-Performance CSS Transitions</span>
                        </label>
                      </div>

                      <button
                        onClick={async () => {
                          sfx.playClick();
                          showStatus("Signing out from Aegis Kingdoms coordinates...", true);
                          setTimeout(() => {
                            window.location.href = "/login";
                          }, 1000);
                        }}
                        className="rpg-button-crimson py-2.5 mt-4 text-[9.5px] uppercase tracking-widest w-full font-black text-center"
                      >
                        Logout and Seal Archives
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>

    </div>
  );
}
