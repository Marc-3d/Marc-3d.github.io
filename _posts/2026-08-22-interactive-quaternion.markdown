---
layout: post
title: "Interactive Axis-Angle Quaternion Visualizer"
---

<!-- UI Controls Panel -->
<div id="controls" style="background: #ffffff; color: #1f2937; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; font-family: system-ui, sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-around; align-items: center;">
  
  <!-- Dial 1: Angle Theta -->
  <div style="text-align: center;">
    <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 6px; color: #4b5563;">Rotation Angle (&theta;)</div>
    <div id="dial-angle" style="touch-action: none; cursor: pointer; display: inline-block;"></div>
    <div style="margin-top: 4px;">
      <input type="number" id="input-angle" min="0" max="360" value="45" style="width: 65px; text-align: center; font-weight: bold; color: #2563eb; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px 4px; font-family: monospace;"> °
    </div>
  </div>

  <!-- Dial 2: Yaw -->
  <div style="text-align: center;">
    <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 6px; color: #4b5563;">Axis Yaw (Azimuth)</div>
    <div id="dial-yaw" style="touch-action: none; cursor: pointer; display: inline-block;"></div>
    <div style="margin-top: 4px;">
      <input type="number" id="input-yaw" min="0" max="360" value="0" style="width: 65px; text-align: center; font-weight: bold; color: #d97706; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px 4px; font-family: monospace;"> °
    </div>
  </div>

  <!-- Dial 3: Pitch -->
  <div style="text-align: center;">
    <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 6px; color: #4b5563;">Axis Pitch (Elevation)</div>
    <div id="dial-pitch" style="touch-action: none; cursor: pointer; display: inline-block;"></div>
    <div style="margin-top: 4px;">
      <input type="number" id="input-pitch" min="-90" max="90" value="45" style="width: 65px; text-align: center; font-weight: bold; color: #16a34a; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px 4px; font-family: monospace;"> °
    </div>
  </div>

</div>

<!-- Live Mathematical Readout Box -->
<div id="math-display" style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px; font-family: system-ui, sans-serif; display: flex; flex-wrap: wrap; justify-content: space-around; gap: 16px; font-size: 0.9rem;">
  
  <div style="background: #ffffff; padding: 10px 16px; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
    <span style="color: #64748b; font-weight: 600;">Unit Axis u: </span>
    <span style="font-family: monospace; font-weight: bold; color: #0f172a;">
      (<span id="val-ux" style="color: #d97706;">0.000</span>, 
       <span id="val-uy" style="color: #16a34a;">0.000</span>, 
       <span id="val-uz" style="color: #d97706;">0.000</span>)
    </span>
  </div>

  <div style="background: #ffffff; padding: 10px 16px; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
    <span style="color: #64748b; font-weight: 600;">Quaternion q: </span>
    <span style="font-family: monospace; font-weight: bold; color: #0f172a;">
      w = <span id="val-qw" style="color: #2563eb;">0.000</span>, 
      x = <span id="val-qx" style="color: #0284c7;">0.000</span>, 
      y = <span id="val-qy" style="color: #0284c7;">0.000</span>, 
      z = <span id="val-qz" style="color: #0284c7;">0.000</span>
    </span>
  </div>

  <div style="background: #ffffff; padding: 10px 16px; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
    <span style="color: #64748b; font-weight: 600;">Norm ||q||: </span>
    <span id="val-norm" style="font-family: monospace; font-weight: bold; color: #059669;">1.0000</span>
  </div>

</div>

<div id="canvas-container" style="width: 100%; height: 500px; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;"></div>

<script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
    }
  }
</script>

<script type="module">
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

  let state = { angle: 45, yaw: 0, pitch: 45 };

  // 1. Scene Setup
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4, 3, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 2. Lights & Helpers
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 12, 8);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const grid = new THREE.GridHelper(10, 10, 0xcbd5e1, 0xe2e8f0);
  grid.position.y = -0.01;
  scene.add(grid);

  // 3. Static Axle Line
  const axleMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 3 });
  const axleGeo = new THREE.BufferGeometry();
  const axleLine = new THREE.Line(axleGeo, axleMat);
  scene.add(axleLine);

  // 4. Ground Yaw & Pitch Arc Helpers
  const yawRingGeo = new THREE.BufferGeometry();
  const ringPoints = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(2 * Math.sin(a), 0, 2 * Math.cos(a)));
  }
  yawRingGeo.setFromPoints(ringPoints);
  const yawRing = new THREE.Line(yawRingGeo, new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.1, gapSize: 0.05 }));
  yawRing.computeLineDistances();
  scene.add(yawRing);

  const yawLineGeo = new THREE.BufferGeometry();
  const yawLine = new THREE.Line(yawLineGeo, new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2 }));
  scene.add(yawLine);

  const pitchArcGeo = new THREE.BufferGeometry();
  const pitchArc = new THREE.Line(pitchArcGeo, new THREE.LineBasicMaterial({ color: 0x16a34a, linewidth: 2 }));
  scene.add(pitchArc);

  // 5. Rotating Mesh
  const meshGroup = new THREE.Group();
  const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.1 })
  );
  boxMesh.position.set(0, 0, 0.6);
  boxMesh.castShadow = true;
  meshGroup.add(boxMesh);
  scene.add(meshGroup);

  // 6. Math & Scene Updates
  function updateScene() {
    const radAngle = THREE.MathUtils.degToRad(state.angle);
    const radYaw = THREE.MathUtils.degToRad(state.yaw);
    const radPitch = THREE.MathUtils.degToRad(state.pitch);

    // Compute unit vector u from Pitch & Yaw
    const ux = Math.cos(radPitch) * Math.sin(radYaw);
    const uy = Math.sin(radPitch);
    const uz = Math.cos(radPitch) * Math.cos(radYaw);
    const axis = new THREE.Vector3(ux, uy, uz).normalize();

    // Redraw Axle Line
    axleGeo.setFromPoints([axis.clone().multiplyScalar(-3.5), axis.clone().multiplyScalar(3.5)]);

    // Update Ground Projections
    const groundDir = new THREE.Vector3(Math.sin(radYaw), 0, Math.cos(radYaw)).multiplyScalar(2);
    yawLineGeo.setFromPoints([new THREE.Vector3(0, 0, 0), groundDir]);

    // Update Elevation Arc
    const arcPoints = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * radPitch;
      arcPoints.push(new THREE.Vector3(2 * Math.cos(t) * Math.sin(radYaw), 2 * Math.sin(t), 2 * Math.cos(t) * Math.cos(radYaw)));
    }
    pitchArcGeo.setFromPoints(arcPoints);

    // Construct Quaternion
    const q = new THREE.Quaternion().setFromAxisAngle(axis, radAngle);
    meshGroup.quaternion.copy(q);

    // Calculate Quaternion Norm
    const norm = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);

    // Update Math Readout Elements
    document.getElementById('val-ux').innerText = axis.x.toFixed(3);
    document.getElementById('val-uy').innerText = axis.y.toFixed(3);
    document.getElementById('val-uz').innerText = axis.z.toFixed(3);

    document.getElementById('val-qw').innerText = q.w.toFixed(3);
    document.getElementById('val-qx').innerText = q.x.toFixed(3);
    document.getElementById('val-qy').innerText = q.y.toFixed(3);
    document.getElementById('val-qz').innerText = q.z.toFixed(3);

    document.getElementById('val-norm').innerText = norm.toFixed(4);
  }

  // 7. Circular Dial Generator
  function createCircularDial(containerId, inputId, initialVal, minVal, maxVal, color, isHalfDial, onChange) {
    const size = 80, r = 28, cx = 40, cy = 40;
    const parent = document.getElementById(containerId);
    const input = document.getElementById(inputId);

    const trackSVG = isHalfDial
      ? `<path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}" stroke="#e2e8f0" stroke-width="6" fill="none" stroke-linecap="round" />`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="#e2e8f0" stroke-width="6" fill="none" />`;

    parent.innerHTML = `
      <svg width="${size}" height="${size}" style="user-select: none;">
        ${trackSVG}
        <line id="line" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <circle id="handle" cx="${cx}" cy="${cy - r}" r="7" fill="${color}" style="cursor: pointer;" />
      </svg>
    `;

    const svg = parent.querySelector('svg');
    const handle = parent.querySelector('#handle');
    const line = parent.querySelector('#line');

    function updateVisual(val) {
      const angleRad = isHalfDial ? THREE.MathUtils.degToRad(-val) : THREE.MathUtils.degToRad(val - 90);
      const x = cx + r * Math.cos(angleRad);
      const y = cy + r * Math.sin(angleRad);
      handle.setAttribute('cx', x);
      handle.setAttribute('cy', y);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
    }

    function handleDrag(e) {
      const rect = svg.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - (rect.left + cx);
      const dy = clientY - (rect.top + cy);

      let val;
      if (isHalfDial) {
        let deg = -THREE.MathUtils.radToDeg(Math.atan2(dy, dx));
        val = Math.round(Math.max(minVal, Math.min(maxVal, deg)));
      } else {
        let deg = THREE.MathUtils.radToDeg(Math.atan2(dy, dx)) + 90;
        if (deg < 0) deg += 360;
        val = Math.round(deg);
      }

      input.value = val;
      updateVisual(val);
      onChange(val);
    }

    let isDragging = false;
    svg.addEventListener('mousedown', (e) => { isDragging = true; handleDrag(e); });
    svg.addEventListener('touchstart', (e) => { isDragging = true; handleDrag(e); });
    window.addEventListener('mousemove', (e) => { if (isDragging) handleDrag(e); });
    window.addEventListener('touchmove', (e) => { if (isDragging) handleDrag(e); });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('touchend', () => isDragging = false);

    input.addEventListener('input', () => {
      let val = parseFloat(input.value) || 0;
      val = Math.max(minVal, Math.min(maxVal, val));
      updateVisual(val);
      onChange(val);
    });

    updateVisual(initialVal);
  }

  // Initialize Controls
  createCircularDial('dial-angle', 'input-angle', state.angle, 0, 360, '#2563eb', false, (v) => { state.angle = v; updateScene(); });
  createCircularDial('dial-yaw', 'input-yaw', state.yaw, 0, 360, '#d97706', false, (v) => { state.yaw = v; updateScene(); });
  createCircularDial('dial-pitch', 'input-pitch', state.pitch, -90, 90, '#16a34a', true, (v) => { state.pitch = v; updateScene(); });

  updateScene();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
</script>