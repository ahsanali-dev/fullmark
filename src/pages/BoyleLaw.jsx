import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlay, FiSquare, FiRotateCcw, FiEye, FiActivity, FiCpu } from 'react-icons/fi';
import Background3D from '../components/shared/Background3D';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function BoyleLaw() {
  const navigate = useNavigate();

  // --- React State for UI Readouts ---
  const [pressure, setPressure] = useState(1.0);
  const [volume, setVolume] = useState(10.0);
  const [showMolecules, setShowMolecules] = useState(true);
  const [animMolecules, setAnimMolecules] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Canvas References ---
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  // --- Refs for fast 60fps Physics & Loop ---
  const simStateRef = useRef({
    pressure: 1.0,
    volume: 10.0,
    rotY: 0.4,
    rotX: -0.3,
    autoRotate: true,
    pistonHovered: false,
    pistonDragging: false,
    sceneDragging: false,
    dragStartY: 0,
    dragStartPressure: 1.0,
    lastMX: 0,
    lastMY: 0,
  });

  const pvHistoryRef = useRef([]);
  const animIntervalRef = useRef(null);

  // --- Gas Molecules Setup ---
  const NUM_MOL = 60;
  const moleculesRef = useRef(
    Array.from({ length: NUM_MOL }, () => ({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
      vx: (Math.random() - 0.5) * 0.012,
      vy: (Math.random() - 0.5) * 0.012,
      vz: (Math.random() - 0.5) * 0.012,
      r: 0.025 + Math.random() * 0.02,
      hue: 190 + Math.random() * 50, // Cyber cyan/blue hues
    }))
  );

  // --- Update Simulation values & sync to React UI state ---
  const updateSimulationValues = (newPressure) => {
    const clampedPressure = Math.min(10.0, Math.max(1.0, newPressure));
    const newVolume = 10.0 / clampedPressure;

    simStateRef.current.pressure = clampedPressure;
    simStateRef.current.volume = newVolume;

    setPressure(clampedPressure);
    setVolume(newVolume);

    // Save history
    pvHistoryRef.current.push({ p: clampedPressure, v: newVolume });
    if (pvHistoryRef.current.length > 100) {
      pvHistoryRef.current.shift();
    }
  };

  // --- Math 3D Projection ---
  const project = (x, y, z, rX, rY, W, H) => {
    // Rotation Y
    let x1 = x * Math.cos(rY) - z * Math.sin(rY);
    let z1 = x * Math.sin(rY) + z * Math.cos(rY);
    // Rotation X
    let y2 = y * Math.cos(rX) - z1 * Math.sin(rX);
    let z2 = y * Math.sin(rX) + z1 * Math.cos(rX);

    const fov = 2.5;
    const depth = fov / (fov + z2 + 2);

    return {
      sx: W / 2 + x1 * depth * W * 0.35,
      sy: H / 2 + y2 * depth * H * 0.35,
      depth: z2,
      scale: depth,
    };
  };

  // --- Hit test for Piston Handle ---
  const getPistonHandleScreen = (W, H) => {
    const { rotX, rotY, volume } = simStateRef.current;
    const volFrac = volume / 10;
    const pistonZ = 0.5 * volFrac;
    const thickness = 0.06;
    const hh = 0.5;
    return project(0, -hh - 0.05, pistonZ + thickness / 2, rotX, rotY, W, H);
  };

  const checkNearPiston = (mx, my, W, H, DPR) => {
    const p = getPistonHandleScreen(W, H);
    const dx = mx * DPR - p.sx;
    const dy = my * DPR - p.sy;
    return Math.sqrt(dx * dx + dy * dy) < 36 * DPR;
  };

  // --- Animation loop ---
  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderLoop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const DPR = window.devicePixelRatio || 1;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Radial background inside canvas
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.75);
      bg.addColorStop(0, 'rgba(11, 12, 22, 0.85)');
      bg.addColorStop(1, 'rgba(8, 9, 17, 0.95)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Rotate Box
      if (simStateRef.current.autoRotate && !simStateRef.current.pistonDragging && !simStateRef.current.sceneDragging) {
        simStateRef.current.rotY += 0.004;
      }

      const { rotX, rotY, volume, pistonHovered, pressure } = simStateRef.current;
      const volFrac = volume / 10;
      const pressureRatio = (pressure - 1) / 9;

      // Dynamic color based on pressure (Blue/Cyan -> Magenta/Red)
      const currentHue = 200 - pressureRatio * 160;
      const themeColor = `hsla(${currentHue}, 100%, 60%, 1)`;
      const themeColorAlpha = (a) => `hsla(${currentHue}, 100%, 60%, ${a})`;

      // 1. DRAW 3D CONTAINER BOX
      const hw = 0.5, hh = 0.5, hz = 0.5 * volFrac;
      const corners = [
        [-hw, -hh, -hz], [hw, -hh, -hz], [hw, hh, -hz], [-hw, hh, -hz],
        [-hw, -hh, hz], [hw, -hh, hz], [hw, hh, hz], [-hw, hh, hz],
      ];
      const proj = corners.map(([x, y, z]) => project(x, y, z, rotX, rotY, W, H));
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Back face
        [4, 5], [5, 6], [6, 7], [7, 4], // Front face
        [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
      ];
      const faces = [
        [0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4],
        [2, 3, 7, 6], [0, 3, 7, 4], [1, 2, 6, 5],
      ];
      const faceColors = [
        themeColorAlpha(0.04), themeColorAlpha(0.02), themeColorAlpha(0.05),
        themeColorAlpha(0.06), themeColorAlpha(0.03), themeColorAlpha(0.04),
      ];

      // Draw faces
      faces.forEach((face, fi) => {
        ctx.beginPath();
        ctx.moveTo(proj[face[0]].sx, proj[face[0]].sy);
        face.slice(1).forEach((i) => ctx.lineTo(proj[i].sx, proj[i].sy));
        ctx.closePath();
        ctx.fillStyle = faceColors[fi];
        ctx.fill();
      });

      // Draw edges
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(proj[a].sx, proj[a].sy);
        ctx.lineTo(proj[b].sx, proj[b].sy);
        ctx.strokeStyle = themeColorAlpha(0.35);
        ctx.lineWidth = 1.5 * DPR;
        ctx.stroke();
      });

      // Draw corners
      proj.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = themeColorAlpha(0.7);
        ctx.fill();
      });

      // 2. DRAW GAS MOLECULES
      if (showMolecules) {
        const now = Date.now() * 0.001;
        const speed = 0.7 + (1 - volFrac) * 2.2;
        const bb = { x: 0.48, y: 0.48, z: 0.48 * volFrac };

        moleculesRef.current.forEach((mol, idx) => {
          if (animMolecules) {
            mol.x += mol.vx * speed;
            mol.y += mol.vy * speed;
            mol.z += mol.vz * speed;

            // Bouncing logic inside dynamic container
            if (Math.abs(mol.x) > bb.x) {
              mol.vx *= -1;
              mol.x = Math.sign(mol.x) * bb.x;
            }
            if (Math.abs(mol.y) > bb.y) {
              mol.vy *= -1;
              mol.y = Math.sign(mol.y) * bb.y;
            }
            if (Math.abs(mol.z) > bb.z) {
              mol.vz *= -1;
              mol.z = Math.sign(mol.z) * bb.z;
            }
          }

          const p = project(mol.x, mol.y, mol.z, rotX, rotY, W, H);
          const r = mol.r * p.scale * W * 0.35;
          const alpha = 0.5 + 0.5 * Math.sin(now * 3.5 + idx);

          const grad = ctx.createRadialGradient(
            p.sx - r * 0.3,
            p.sy - r * 0.3,
            0,
            p.sx,
            p.sy,
            r
          );
          grad.addColorStop(0, `hsla(${mol.hue}, 100%, 85%, ${alpha})`);
          grad.addColorStop(0.5, `hsla(${mol.hue}, 100%, 55%, ${alpha * 0.8})`);
          grad.addColorStop(1, `hsla(${mol.hue}, 100%, 30%, 0)`);

          ctx.beginPath();
          ctx.arc(p.sx, p.sy, Math.max(r, 2.5 * DPR), 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${mol.hue}, 100%, 60%, 0.06)`;
          ctx.fill();
        });
      }

      // 3. DRAW PISTON
      const pistonZ = 0.5 * volFrac;
      const thickness = 0.06;
      const pPts = [
        [-hw, -hh, pistonZ], [hw, -hh, pistonZ], [hw, hh, pistonZ], [-hw, hh, pistonZ],
        [-hw, -hh, pistonZ + thickness], [hw, -hh, pistonZ + thickness],
        [hw, hh, pistonZ + thickness], [-hw, hh, pistonZ + thickness],
      ];
      const pProj = pPts.map(([x, y, z]) => project(x, y, z, rotX, rotY, W, H));

      // Draw Piston main face (top sealing plate)
      ctx.beginPath();
      ctx.moveTo(pProj[0].sx, pProj[0].sy);
      [1, 2, 3].forEach((i) => ctx.lineTo(pProj[i].sx, pProj[i].sy));
      ctx.closePath();
      ctx.fillStyle = themeColorAlpha(pistonHovered ? 0.6 : 0.4);
      ctx.fill();
      ctx.strokeStyle = pistonHovered ? '#ffffff' : themeColor;
      ctx.lineWidth = (pistonHovered ? 2.5 : 1.5) * DPR;
      ctx.stroke();

      // Piston sides (3D thickness block)
      const pSides = [
        [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
      ];
      pSides.forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(pProj[side[0]].sx, pProj[side[0]].sy);
        side.slice(1).forEach((i) => ctx.lineTo(pProj[i].sx, pProj[i].sy));
        ctx.closePath();
        ctx.fillStyle = themeColorAlpha(0.25);
        ctx.fill();
        ctx.strokeStyle = themeColorAlpha(0.4);
        ctx.stroke();
      });

      // Piston Handle Rod
      const topCenter = project(0, -hh - 0.22, pistonZ + thickness / 2, rotX, rotY, W, H);
      const topBase = project(0, -hh, pistonZ + thickness / 2, rotX, rotY, W, H);
      ctx.beginPath();
      ctx.moveTo(topBase.sx, topBase.sy);
      ctx.lineTo(topCenter.sx, topCenter.sy);
      ctx.strokeStyle = pistonHovered ? '#ffffff' : 'rgba(200, 220, 255, 0.7)';
      ctx.lineWidth = 4.5 * DPR;
      ctx.stroke();

      // Handle Sphere
      ctx.beginPath();
      ctx.arc(topCenter.sx, topCenter.sy, 8.5 * DPR, 0, Math.PI * 2);
      ctx.fillStyle = pistonHovered ? '#ffffff' : themeColor;
      ctx.shadowBlur = pistonHovered ? 12 * DPR : 4 * DPR;
      ctx.shadowColor = themeColor;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow

      if (pistonHovered) {
        ctx.beginPath();
        ctx.arc(topCenter.sx, topCenter.sy, 15 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = themeColorAlpha(0.25);
        ctx.fill();
      }

      // Draw Arrows on top of Piston Handle
      const arrowPt = project(0, -hh - 0.4, pistonZ + thickness / 2, rotX, rotY, W, H);
      ctx.font = `bold ${pistonHovered ? 20 : 16}px system-ui`;
      ctx.fillStyle = themeColor;
      ctx.textAlign = 'center';
      ctx.fillText(pressureRatio > 0.05 ? '↓' : '↑', arrowPt.sx, arrowPt.sy);

      // 4. LABELS ON CANVAS
      const labelP = project(0.72, 0, 0, rotX, rotY, W, H);
      ctx.font = `bold ${11 * DPR}px 'Orbitron', monospace`;
      ctx.fillStyle = themeColor;
      ctx.textAlign = 'left';
      ctx.fillText(`P = ${pressure.toFixed(2)} atm`, labelP.sx + 6 * DPR, labelP.sy);

      const labelV = project(0, 0.72, 0, rotX, rotY, W, H);
      ctx.fillStyle = '#fb923c';
      ctx.textAlign = 'center';
      ctx.fillText(`V = ${volume.toFixed(2)} L`, labelV.sx, labelV.sy + 12 * DPR);

      // 5. DRAW GRAPH ON OTHER CANVAS
      drawGraph();

      animationId = requestAnimationFrame(renderLoop);
    };

    const drawGraph = () => {
      const graphCanvas = graphRef.current;
      if (!graphCanvas) return;
      const gCtx = graphCanvas.getContext('2d');
      if (!gCtx) return;

      const gDPR = window.devicePixelRatio || 1;
      const gW = graphCanvas.width;
      const gH = graphCanvas.height;

      gCtx.clearRect(0, 0, gW, gH);

      // Grid Lines
      gCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      gCtx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const yCoord = (i / 4) * (gH - 30 * gDPR) + 10 * gDPR;
        gCtx.beginPath();
        gCtx.moveTo(35 * gDPR, yCoord);
        gCtx.lineTo(gW - 10 * gDPR, yCoord);
        gCtx.stroke();

        const xCoord = 35 * gDPR + (i / 4) * (gW - 45 * gDPR);
        gCtx.beginPath();
        gCtx.moveTo(xCoord, 10 * gDPR);
        gCtx.lineTo(xCoord, gH - 20 * gDPR);
        gCtx.stroke();
      }

      // Axis Labels
      gCtx.font = `${9 * gDPR}px 'Orbitron', monospace`;
      gCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      gCtx.textAlign = 'center';
      gCtx.fillText('Pressure P (atm)', gW / 2 + 10 * gDPR, gH - 4 * gDPR);

      gCtx.save();
      gCtx.translate(12 * gDPR, gH / 2 - 5 * gDPR);
      gCtx.rotate(-Math.PI / 2);
      gCtx.fillText('Volume V (L)', 0, 0);
      gCtx.restore();

      // Draw Ideal Boyle's Law Curve (Hyperbola)
      gCtx.beginPath();
      let first = true;
      for (let px = 1; px <= 10; px += 0.05) {
        const vx = 10.0 / px;
        const sx = 35 * gDPR + ((px - 1) / 9) * (gW - 45 * gDPR);
        const sy = gH - 20 * gDPR - ((vx - 1) / 9) * (gH - 30 * gDPR);
        if (first) {
          gCtx.moveTo(sx, sy);
          first = false;
        } else {
          gCtx.lineTo(sx, sy);
        }
      }
      gCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      gCtx.lineWidth = 1.5 * gDPR;
      gCtx.stroke();

      // Draw historical trail
      const history = pvHistoryRef.current;
      if (history.length > 1) {
        gCtx.beginPath();
        history.forEach((pt, idx) => {
          const sx = 35 * gDPR + ((pt.p - 1) / 9) * (gW - 45 * gDPR);
          const sy = gH - 20 * gDPR - ((pt.v - 1) / 9) * (gH - 30 * gDPR);
          if (idx === 0) gCtx.moveTo(sx, sy);
          else gCtx.lineTo(sx, sy);
        });
        const currentPressureRatio = (simStateRef.current.pressure - 1) / 9;
        const pathHue = 200 - currentPressureRatio * 160;
        gCtx.strokeStyle = `hsla(${pathHue}, 100%, 65%, 0.45)`;
        gCtx.lineWidth = 2 * gDPR;
        gCtx.stroke();
      }

      // Draw current coordinates point
      const curP = simStateRef.current.pressure;
      const curV = simStateRef.current.volume;
      const csx = 35 * gDPR + ((curP - 1) / 9) * (gW - 45 * gDPR);
      const csy = gH - 20 * gDPR - ((curV - 1) / 9) * (gH - 30 * gDPR);

      const pRatio = (curP - 1) / 9;
      const dotHue = 200 - pRatio * 160;

      gCtx.beginPath();
      gCtx.arc(csx, csy, 5 * gDPR, 0, Math.PI * 2);
      gCtx.fillStyle = `hsla(${dotHue}, 100%, 60%, 1)`;
      gCtx.shadowColor = `hsla(${dotHue}, 100%, 60%, 0.8)`;
      gCtx.shadowBlur = 6 * gDPR;
      gCtx.fill();
      gCtx.shadowBlur = 0; // reset

      gCtx.beginPath();
      gCtx.arc(csx, csy, 10 * gDPR, 0, Math.PI * 2);
      gCtx.fillStyle = `hsla(${dotHue}, 100%, 60%, 0.2)`;
      gCtx.fill();
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [showMolecules, animMolecules]);

  // --- Resize handler ---
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = canvasRef.current.offsetWidth * dpr;
        canvasRef.current.height = canvasRef.current.offsetHeight * dpr;
      }
      if (graphRef.current) {
        const dpr = window.devicePixelRatio || 1;
        graphRef.current.width = graphRef.current.offsetWidth * dpr;
        graphRef.current.height = graphRef.current.offsetHeight * dpr;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- Pointer Event Handlers for Dragging/Rotation ---
  const getClientPos = (e) => {
    return e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = getClientPos(e);
    const mx = x - rect.left;
    const my = y - rect.top;
    const DPR = window.devicePixelRatio || 1;

    const isNear = checkNearPiston(mx, my, canvas.width, canvas.height, DPR);

    if (isNear) {
      simStateRef.current.pistonDragging = true;
      simStateRef.current.dragStartY = y;
      simStateRef.current.dragStartPressure = simStateRef.current.pressure;
      canvas.setPointerCapture(e.pointerId);

      // Stop Auto-Compress if running
      if (isAnimating) {
        handleStopAnimation();
      }
    } else {
      simStateRef.current.sceneDragging = true;
      simStateRef.current.dragStartY = y;
      simStateRef.current.lastMX = x;
      simStateRef.current.lastMY = y;
      simStateRef.current.autoRotate = false;
      setAutoRotate(false);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getClientPos(e);

    if (simStateRef.current.pistonDragging) {
      const dy = y - simStateRef.current.dragStartY;
      const canvasH = canvas.offsetHeight;
      const deltaPressure = -(dy / canvasH) * 18;
      const newPressure = simStateRef.current.dragStartPressure + deltaPressure;
      updateSimulationValues(newPressure);
    } else if (simStateRef.current.sceneDragging) {
      const dx = x - simStateRef.current.lastMX;
      const dy = y - simStateRef.current.lastMY;
      simStateRef.current.rotY += dx * 0.009;
      simStateRef.current.rotX += dy * 0.007;
      simStateRef.current.rotX = Math.max(-1.2, Math.min(0.4, simStateRef.current.rotX));
      simStateRef.current.lastMX = x;
      simStateRef.current.lastMY = y;
    } else {
      // Hover check
      const rect = canvas.getBoundingClientRect();
      const mx = x - rect.left;
      const my = y - rect.top;
      const DPR = window.devicePixelRatio || 1;
      const hovered = checkNearPiston(mx, my, canvas.width, canvas.height, DPR);

      if (hovered !== simStateRef.current.pistonHovered) {
        simStateRef.current.pistonHovered = hovered;
        // force render update
        setPressure(simStateRef.current.pressure);
      }
    }
  };

  const handlePointerUp = () => {
    simStateRef.current.pistonDragging = false;
    simStateRef.current.sceneDragging = false;
  };

  const handleSliderChange = (e) => {
    const sliderVal = Number(e.target.value);
    const newPressure = 1.0 + ((sliderVal - 10) / 90) * 9.0;
    updateSimulationValues(newPressure);
  };

  // --- Gradual Auto Compress Animation ---
  const handleStartAnimation = () => {
    if (isAnimating) {
      handleStopAnimation();
      return;
    }

    setIsAnimating(true);
    let dir = 1;
    let currentP = simStateRef.current.pressure;

    animIntervalRef.current = setInterval(() => {
      currentP += dir * 0.06;
      if (currentP >= 10.0) {
        currentP = 10.0;
        dir = -1;
      } else if (currentP <= 1.0) {
        currentP = 1.0;
        dir = 1;
      }
      updateSimulationValues(currentP);
    }, 35);
  };

  const handleStopAnimation = () => {
    if (animIntervalRef.current) {
      clearInterval(animIntervalRef.current);
      animIntervalRef.current = null;
    }
    setIsAnimating(false);
  };

  const handleReset = () => {
    handleStopAnimation();
    updateSimulationValues(1.0);
    pvHistoryRef.current = [];
  };

  // --- Cleanup interval on unmount ---
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, []);

  const pressureRatio = (pressure - 1) / 9;
  const currentHue = 200 - pressureRatio * 160;
  const dynamicColor = `hsla(${currentHue}, 100%, 60%, 1)`;

  // Circular gauge stroke configuration
  const circ = 2 * Math.PI * 35;
  const strokeDash = pressureRatio * circ * 0.8;

  // Density strings
  const getDensityString = () => {
    if (pressure > 7.5) return { text: 'Critical High', color: 'text-red-500' };
    if (pressure > 5.0) return { text: 'High', color: 'text-orange-500' };
    if (pressure > 2.5) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Low', color: 'text-emerald-400' };
  };
  const densityInfo = getDensityString();

  return (
    <div className="min-h-screen bg-[#080911] text-gray-100 font-sans relative overflow-x-hidden">
      {/* Dynamic particles space background */}
      <Background3D roleColor="teacher" />

      {/* --- TOPBAR --- */}
      <Navbar />

      {/* --- CONTENT CONTAINER --- */}
      <div className="max-w-[1250px] mx-auto px-6 pt-28 pb-16 relative z-10">
        
        {/* Header Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-blue-400 border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 rounded-full mb-4">
            <FiCpu className="animate-pulse" />
            <span>Virtual Chemistry Lab • 3D Simulator</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Boyle's Gas <span className="color-flow-text">Law Experiment</span>
          </h1>
          <p className="text-sm text-gray-400 font-semibold mt-2 tracking-wide font-mono">
            P × V = k (Constant) | Isothermal Process (Constant Temp)
          </p>
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: 3D INTERACTIVE CANVAS PANEL (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative bg-[#0c0d19]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              {/* Dynamic top glowing strip matching the pressure value */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${dynamicColor}, transparent)`,
                  boxShadow: `0 0 15px ${dynamicColor}`
                }}
              />
              
              <div className="absolute top-4 left-5 font-mono text-[10px] tracking-wider text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>3D_SIM_ACTIVE</span>
              </div>
              
              <div className="absolute top-4 right-5 font-mono text-[10px] tracking-wider text-orange-400 bg-orange-500/5 border border-orange-500/25 px-2.5 py-1 rounded-md">
                🖱️ Drag Piston Handle ↕ or Container 🔄
              </div>

              {/* Simulation Canvas */}
              <canvas 
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-full h-[520px] block cursor-grab active:cursor-grabbing"
              />

              {/* Helper Drag Hints */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-sans text-xs text-gray-400 bg-[#080911]/90 border border-gray-800/80 px-4 py-2 rounded-full pointer-events-none shadow-lg max-w-[90%] text-center">
                Drag the <span className="text-white font-bold">top piston sphere ↕</span> to change volume. Drag container backgrounds to <span className="text-white font-bold">rotate chamber 🔄</span>.
              </div>
            </div>

            {/* Secondary Row under the Canvas: Graph & Math Equation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* P-V Isotherm Graph */}
              <div className="relative bg-[#0c0d19]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-4">
                  P-V Curve (Isotherm Graph)
                </h3>
                <div className="flex-grow flex items-center justify-center">
                  <canvas 
                    ref={graphRef}
                    className="w-full h-[180px] bg-black/40 border border-gray-800/60 rounded-xl block"
                  />
                </div>
              </div>

              {/* Boyle's Law Math Verification */}
              <div className="relative bg-[#0c0d19]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between h-full">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-4">
                    Boyle's Mathematical Equation
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold mb-4 leading-relaxed">
                    At a constant temperature, the product of pressure and volume of an ideal gas is always constant:
                  </p>
                </div>
                <div className="bg-[#080911]/80 border border-gray-800/50 rounded-xl p-4.5 text-center mt-auto">
                  <div className="font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 tracking-wider mb-2">
                    P₁V₁ = P₂V₂
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Verified Constant (k) = <span className="font-mono text-emerald-400 font-bold">10.00 L·atm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROL DASHBOARD (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. Real-Time Readings Panel */}
            <div className="relative bg-[#0c0d19]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <FiActivity className="text-red-500" />
                <span>Real-Time Sensor Readings</span>
              </h3>

              <div className="flex items-center gap-6">
                
                {/* Circular Gauge */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                    <circle 
                      className="fill-none stroke-gray-800" 
                      cx="45" 
                      cy="45" 
                      r="35" 
                      strokeWidth="6" 
                      strokeDasharray="175 220" 
                      strokeLinecap="round"
                    />
                    <circle 
                      className="fill-none transition-all duration-300" 
                      cx="45" 
                      cy="45" 
                      r="35" 
                      strokeWidth="6" 
                      strokeDasharray={`${strokeDash} 220`}
                      stroke={dynamicColor}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div 
                      className="font-mono text-lg font-black tracking-tight transition-colors duration-300"
                      style={{ color: dynamicColor }}
                    >
                      {pressure.toFixed(1)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">ATM</div>
                  </div>
                </div>

                {/* Digital Labels */}
                <div className="flex-grow flex flex-col gap-2 font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50">
                    <span className="text-xs text-gray-500 font-bold uppercase">Pressure (P)</span>
                    <span className="text-sm font-black tracking-tight" style={{ color: dynamicColor }}>
                      {pressure.toFixed(2)} atm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50">
                    <span className="text-xs text-gray-500 font-bold uppercase">Volume (V)</span>
                    <span className="text-sm font-black text-orange-400 tracking-tight">
                      {volume.toFixed(2)} L
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-gray-500 font-bold uppercase">Gas Density</span>
                    <span className={`text-xs font-black uppercase ${densityInfo.color}`}>
                      {densityInfo.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* P x V Constant check readout */}
              <div className="mt-5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Boyle's constant (P × V)</span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {(pressure * volume).toFixed(2)}
                </span>
              </div>
            </div>

            {/* 2. Piston Control & Temperature */}
            <div className="relative bg-[#0c0d19]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-6">
                Piston Compression Slider
              </h3>

              {/* Slider wrapper */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs text-gray-400 font-medium">Adjust Pressure Input</span>
                  <span className="font-mono text-sm font-black" style={{ color: dynamicColor }}>
                    {pressure.toFixed(1)}x
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={Math.round(10 + ((pressure - 1) / 9) * 90)}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 outline-none"
                  style={{
                    background: `linear-gradient(90deg, ${dynamicColor} 0%, #1f2937 100%)`
                  }}
                />
              </div>

              {/* Temperature Readout (Constant) */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 mb-5">
                <span className="text-2xl">🌡️</span>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black font-mono">Chamber Temperature</div>
                  <div className="text-sm font-black text-orange-400 font-mono">298 K (25°C) • Fixed</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleStartAnimation}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isAnimating 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' 
                      : 'bg-gradient-to-r from-red-600 to-rose-500 text-white hover:scale-[1.02] shadow-red-500/20'
                  }`}
                >
                  {isAnimating ? (
                    <>
                      <FiSquare size={13} />
                      <span>Stop Auto</span>
                    </>
                  ) : (
                    <>
                      <FiPlay size={13} />
                      <span>Auto Compress</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleReset}
                  className="px-4.5 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <FiRotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* 3. Visualizer Configurations */}
            <div className="relative bg-[#0c0d19]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-4">
                Visualizer Configurations
              </h3>

              <div className="flex flex-col gap-3 font-medium text-xs text-gray-300">
                {/* Option 1 */}
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-2">
                    <FiEye className="text-blue-400" />
                    <span>Show Gas Molecules</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showMolecules}
                      onChange={(e) => setShowMolecules(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white" />
                  </label>
                </div>

                {/* Option 2 */}
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-2">
                    <FiActivity className="text-orange-400" />
                    <span>Kinetic Molecular Motion</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={animMolecules}
                      onChange={(e) => setAnimMolecules(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white" />
                  </label>
                </div>

                {/* Option 3 */}
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-2">
                    <FiRotateCcw className="text-purple-400" />
                    <span>Auto Rotate Container</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoRotate}
                      onChange={(e) => {
                        setAutoRotate(e.target.checked);
                        simStateRef.current.autoRotate = e.target.checked;
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white" />
                  </label>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
