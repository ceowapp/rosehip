"use client"
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function NoiseBackground() {
  const mountRef = useRef(null)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const prevMousePositionRef = useRef({ x: 0, y: 0 })
  const mouseTrailRef = useRef([])
  const isMouseMovingRef = useRef(false)
  const mouseTimerRef = useRef(null)
  const gltfModelRef = useRef(null)
  const modelShaderMaterialRef = useRef(null)
  const darkOverlayRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)

  useEffect(() => {
    let animationId;
    let scene;
    let camera;
    let renderer;
    const clock = new THREE.Clock();
    let material;
    let overlayMaterial;
    let darkOverlayMaterial;
    let noiseBackground;
    let overlay;
    let darkOverlay;
    let currentScale = 1.0;
    const initialAnimation = {
      complete: false,
      startTime: 0,
      phase: 'zoomIn'
    };
    let elementsAdded = false;

    // Enhanced mouse tracking with better coordinate conversion
    const handleMouseMove = (event) => {
      prevMousePositionRef.current = { ...mousePositionRef.current };

      // Convert screen coordinates to normalized device coordinates
      const newPosition = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };

      const trail = [...mouseTrailRef.current];
      trail.push(newPosition);

      if (trail.length > 10) {
        trail.shift();
      }

      mouseTrailRef.current = trail;
      mousePositionRef.current = newPosition;

      isMouseMovingRef.current = true;

      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }

      mouseTimerRef.current = setTimeout(() => {
        isMouseMovingRef.current = false;
      }, 200);
    };

    const init = () => {
      scene = new THREE.Scene();

      // Enhanced lighting for better model visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight2.position.set(-10, -10, 5);
      scene.add(directionalLight2);

      const aspectRatio = window.innerWidth / window.innerHeight;
      const frustumSize = 100;
      camera = new THREE.OrthographicCamera(
        frustumSize * aspectRatio / -2,
        frustumSize * aspectRatio / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      );
      camera.position.z = 2;
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 1);
      rendererRef.current = renderer;

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      initialAnimation.startTime = clock.getElapsedTime();

      const textureLoader = new THREE.TextureLoader();

      const createFallbackTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        for (let x = 0; x < 64; x++) {
          for (let y = 0; y < 64; y++) {
            const value = Math.floor(Math.random() * 255);
            ctx.fillStyle = `rgb(${value},${value},${value})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
      };

      const fallbackTexture = createFallbackTexture();

      Promise.all([
        new Promise(resolve => {
          textureLoader.load(
            '/images/textures/pattern.jpg',
            resolve,
            undefined,
            () => resolve(fallbackTexture)
          );
        }),
        new Promise(resolve => {
          textureLoader.load(
            '/images/textures/fognoise.jpg',
            resolve,
            undefined,
            () => resolve(fallbackTexture)
          );
        })
      ]).then(([patternTexture, fogNoiseTexture]) => {
        createNoiseBackground(patternTexture, fogNoiseTexture);
        animate();
      });

      const mountElement = mountRef.current;
      window.addEventListener('mousemove', handleMouseMove);
    };

    const createDarkOverlay = () => {
      const darkOverlayGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
      darkOverlayMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.9 },
          uColor: { value: new THREE.Color(0x000000) },
          uAspectRatio: { value: window.innerWidth / window.innerHeight }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uOpacity;
          uniform vec3 uColor;
          uniform float uAspectRatio;
          varying vec2 vUv;

          void main() {
            vec2 center = vec2(0.5, 0.5);

            vec2 scaled;
            if (uAspectRatio > 1.0) {
              scaled = (vUv - center) * vec2(uAspectRatio, 1.0);
            } else {
              scaled = (vUv - center) * vec2(1.0, 1.0/uAspectRatio);
            }

            float ellipseDist = dot(scaled, scaled);

            if (ellipseDist > 1.0) discard;

            float gradient = smoothstep(0.0, 1.0, 1.0 - ellipseDist);
            float finalOpacity = 0.3;

            gl_FragColor = vec4(uColor, finalOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      darkOverlay = new THREE.Mesh(darkOverlayGeometry, darkOverlayMaterial);
      darkOverlay.position.set(40, -10, 1);
      scene.add(darkOverlay);
      darkOverlayRef.current = darkOverlay;
    };

    const createOverlay = () => {
      const overlayGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
      overlayMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.76 },
          uColor: { value: new THREE.Color(0x000000) },
          uAspectRatio: { value: window.innerWidth / window.innerHeight }
        },
        vertexShader: `
          varying vec2 vUv;

           void main() {
             vUv = uv;
             gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);
           }
        `,
        fragmentShader: `
           uniform float uTime;
           uniform float uOpacity;
           uniform vec3 uColor;
           uniform float uAspectRatio;
           varying vec2 vUv;

           void main() {
             vec2 center = vec2(0.5, 0.5);

             vec2 scaled;
             if (uAspectRatio > 1.0) {
               scaled = (vUv - center) * vec2(uAspectRatio, 1.0);
             } else {
               scaled = (vUv - center) * vec2(1.0, 1.0/uAspectRatio);
             }

             float ellipseDist = dot(scaled, scaled);

             if (ellipseDist > 1.0) discard;

             float gradient = smoothstep(0.0, 1.0, 1.0 - ellipseDist);
             float pulse = 0.1 * sin(uTime * 0.2);
             float finalOpacity = uOpacity * (0.9 - gradient * 0.1 + pulse);

             gl_FragColor = vec4(uColor, finalOpacity);
           }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
      overlay.position.z = 6;
      scene.add(overlay);
    };
    
    const createModelShaderMaterial = (fogNoiseTexture) => {
      return new THREE.ShaderMaterial({
          uniforms: {
              uTime: { value: 0 },
              uMouse: { value: new THREE.Vector2(0, 0) },
              uMouseWorldPos: { value: new THREE.Vector3(0, 0, 0) },
              uIsMouseMoving: { value: 0.0 },
              uFogNoise: { value: fogNoiseTexture },
              uBaseColor: { value: new THREE.Color(0x000000) }, // Model background color, very dark
              uParticleColor: { value: new THREE.Color(0xffffff) }, // Particle color set to white
              uTileScale: { value: 100.0 }, // Increased from 1.0 to make tiles slightly larger
              uMouseInfluenceRadius: { value: 150.0 }, // Larger radius for model vs background (was 100.0)
              uBrightnessVariation: { value: 0.2 },
              uAnimationSpeed: { value: 0.3 },
              uLightSpeed: { value: 0.2 },
              uWaveFrequency: { value: 0.5 },
              uThreshold: { value: 0.3 },
              uStateDelay: { value: 4.0 },
              uParticleSpeed: { value: 0.05 },
              uParticleSize: { value: 0.25 }, // Slightly increased particle size again
              uMaxBrightness: { value: 0.9 },
              uMouseVelocity: { value: new THREE.Vector2(0, 0) },
              uDistortionStrength: { value: 30.0 },
              uRelaxation: { value: 0.95 },
              uWaveSpeed: { value: 2.0 },
              uWaveAmplitude: { value: 0.5 },
              uVerticalSpeed: { value: 0.2 }, // Reduced from 0.1 for slower vertical movement
              // New uniforms for hover effect
              uHoverColor: { value: new THREE.Color(0xffff00) },
              uHoverIntensity: { value: 4.0 },
              uHoverRadius: { value: 0.6 },
              uHoverSmoothness: { value: 0.8 },
              uEdgeBrightness: { value: 0.8 }, // New uniform for edge brightness control
              uBaseBrightness: { value: 1.2 },
          },
          vertexShader: `
              uniform float uTime;
              uniform vec3 uMouseWorldPos;
              uniform float uIsMouseMoving;
              uniform float uMouseInfluenceRadius;
              uniform vec2 uMouseVelocity;
              uniform float uDistortionStrength;
              uniform float uRelaxation;
              uniform float uWaveSpeed;
              uniform float uWaveAmplitude;
              
              varying vec2 vUv;
              varying vec3 vNormal;
              varying vec3 vPosition;
              varying vec3 vWorldPosition;
              varying float vMouseInfluence;
              varying float vMouseDistance;
              varying vec2 vMouseVelocity;
    
              void main() {
                  vUv = uv;
                  vNormal = normalize(normalMatrix * normal);
                  vMouseVelocity = uMouseVelocity;
                  vPosition = position;
                  
                  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                  vWorldPosition = worldPosition.xyz;
                  
                  float mouseDistance = distance(worldPosition.xyz, uMouseWorldPos);
                  vMouseDistance = mouseDistance;
                  
                  float rawInfluence = 1.0 - smoothstep(0.0, uMouseInfluenceRadius, mouseDistance);
                  vMouseInfluence = rawInfluence * uIsMouseMoving;
                  
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
          `,
          fragmentShader: `
              #define PI 3.14159265358979323846
    
              uniform float uTime;
              uniform vec2 uMouse;
              uniform vec3 uMouseWorldPos;
              uniform float uIsMouseMoving;
              uniform sampler2D uFogNoise;
              uniform vec3 uBaseColor;
              uniform vec3 uParticleColor;
              uniform float uTileScale;
              uniform float uMouseInfluenceRadius;
              uniform float uBrightnessVariation;
              uniform float uAnimationSpeed; // Global animation speed multiplier
              uniform float uLightSpeed;
              uniform float uWaveFrequency;
              uniform float uThreshold;
              uniform float uStateDelay;     // Duration of delay at each edge
              uniform float uParticleSpeed;  // Speed of particle travel (lower for slower)
              uniform float uParticleSize;
              uniform float uMaxBrightness;
              uniform vec2 uMouseVelocity;
              uniform float uVerticalSpeed;
              // New hover effect uniforms
              uniform vec3 uHoverColor;
              uniform float uHoverIntensity;
              uniform float uHoverRadius;
              uniform float uHoverSmoothness;
              uniform float uEdgeBrightness;
              uniform float uBaseBrightness;
    
              varying vec2 vUv;
              varying vec3 vNormal;
              varying vec3 vPosition;
              varying vec3 vWorldPosition;
              varying float vMouseInfluence;
              varying float vMouseDistance;
              varying vec2 vMouseVelocity;
    
              // Hash function for random numbers (from https://www.shadertoy.com/view/4djSRW)
              float hash12(vec2 p) {
                  vec3 p3  = fract(vec3(p.xyx) * .1031);
                  p3 += dot(p3, p3.yzx + 33.33);
                  return fract((p3.x + p3.y) * p3.z);
              }
    
              // Function to get a random integer within a range
              float randomInt(float seed, float maxVal) {
                  return floor(hash12(vec2(seed, seed * 123.45)) * maxVal);
              }
    
              // Define 8 key points within a tile: 4 mid-edges and 4 corners
              vec2 getTilePoint(int index) {
                  if (index == 0) return vec2(0.0, 0.5); // Left-mid
                  if (index == 1) return vec2(1.0, 0.5); // Right-mid
                  if (index == 2) return vec2(0.5, 0.0); // Bottom-mid
                  if (index == 3) return vec2(0.5, 1.0); // Top-mid
                  if (index == 4) return vec2(0.0, 0.0); // BL corner
                  if (index == 5) return vec2(1.0, 0.0); // BR corner
                  if (index == 6) return vec2(0.0, 1.0); // TL corner
                  if (index == 7) return vec2(1.0, 1.0); // TR corner
                  return vec2(0.5, 0.5); // Default to center (shouldn't happen)
              }
    
              void main() {
                  // Use world position directly for more consistent tiling on a sphere
                  vec2 planarCoords = vWorldPosition.xy; // Or perhaps try vUv if the model has good UVs
    
                  // Grid tiling
                  vec2 st = planarCoords * uTileScale;
                  vec2 tileId = floor(st); // Integer coordinates for each tile
                  vec2 localPos = fract(st); // Position within the current tile (0.0 to 1.0)
    
                  // --- Modified for Grouping ---
                  const float GROUP_SIZE_X = 1.0; // Set to 1 to ensure each tile has its own particles
                  const float GROUP_SIZE_Y = 1.0; // Set to 1 to ensure each tile has its own particles
    
                  // Calculate the group ID - now each tile is its own group
                  vec2 groupId = tileId; // Use tileId directly instead of grouping
                  float groupRandomBase = hash12(groupId);
    
                  // --- Particle Effect Logic ---
                  const float NUM_SEGMENTS = 8.0;
                  float moveDurationPerSegment = 1.0 / uParticleSpeed;
                  float totalCycleDuration = (moveDurationPerSegment + uStateDelay) * NUM_SEGMENTS;
    
                  // Time for this specific tile
                  float groupTime = fract((uTime * uAnimationSpeed + groupRandomBase * 0.1) / totalCycleDuration);
    
                  vec2 particlePosInTile = vec2(0.5);
                  float particleVisibility = 1.0; // Always visible
    
                  // Determine the current segment and phase within it
                  float segmentProgress = groupTime * NUM_SEGMENTS;
                  int currentSegmentIndex = int(floor(segmentProgress));
                  float progressInSegment = fract(segmentProgress);
    
                  // Each segment consists of a move phase and a delay phase
                  float movePhaseRatio = moveDurationPerSegment / (moveDurationPerSegment + uStateDelay);
    
                  // Ensure particles move along all edges in sequence
                  int startIndex = currentSegmentIndex;
                  int endIndex = (currentSegmentIndex + 1) % 8;
    
                  vec2 startPoint = getTilePoint(startIndex);
                  vec2 endPoint = getTilePoint(endIndex);
    
                  if (progressInSegment < movePhaseRatio) {
                      // Move Phase
                      float moveLerp = progressInSegment / movePhaseRatio;
                      particlePosInTile = mix(startPoint, endPoint, moveLerp);
                  } else {
                      // Delay Phase
                      particlePosInTile = endPoint;
                  }
                  
                  // Calculate actual particle visibility based on distance to its center
                  float distToParticle = distance(localPos, particlePosInTile);
                  float particleAlpha = smoothstep(uParticleSize, 0.0, distToParticle);
    
                 // --- NEW HOVER EFFECT CALCULATION ---
                float mouseWorldDistance = distance(vWorldPosition, uMouseWorldPos);
                float hoverInfluence = 1.0 - smoothstep(0.0, uHoverRadius * 60.0, mouseWorldDistance);
                hoverInfluence = pow(hoverInfluence, uHoverSmoothness);
                hoverInfluence *= uIsMouseMoving;

                float hoverPulse = 0.9 + 0.1 * sin(uTime * 2.0);
                hoverInfluence *= hoverPulse;

                // Start with base color
                vec3 baseColor = uBaseColor * uBaseBrightness;

                // Apply particle effect
                vec3 particleColor = mix(baseColor, uParticleColor, particleAlpha * particleVisibility);

                // --- APPLY HOVER EFFECT WITH BRIGHTNESS CONTROL ---
                // Calculate hover color with increased brightness
                vec3 hoverColor = mix(particleColor, uHoverColor, 0.7); // Increased from 0.5

                // Apply hover effect with increased brightness
                vec3 finalColor = mix(particleColor, hoverColor, hoverInfluence);

                // Apply brightness increase with higher multiplier
                float maxBrightnessMultiplier = 2.0; // Increased from 1.5
                float brightnessIncrease = hoverInfluence * maxBrightnessMultiplier;

                // Modulate brightness based on particle visibility
                float brightnessModulation = 0.4 + (particleAlpha * 0.8); // Increased from 0.3 + 0.7
                brightnessIncrease *= brightnessModulation;

                finalColor *= 1.0 + brightnessIncrease;

                // Ensure we don't exceed reasonable brightness limits
                finalColor = clamp(finalColor, vec3(0.0), vec3(3.0)); // Increased max from 2.0 to 3.0

                gl_FragColor = vec4(finalColor, 1.0);
              }
          `,
          transparent: false,
          side: THREE.DoubleSide
      });
    };

    const loadModel = (fogNoiseTexture) => {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        '/models/sphere.glb',
        (gltf) => {
          const model = gltf.scene;
          model.position.set(40, -30, 10);
          model.scale.set(3, 3, 3);
          
          const shaderMaterial = createModelShaderMaterial(fogNoiseTexture);
          modelShaderMaterialRef.current = shaderMaterial;
          
          model.traverse((child) => {
            if (child.isMesh) {
              child.userData.originalMaterial = child.material;
              child.material = shaderMaterial;
            }
          });
          
          gltfModelRef.current = model;
          scene.add(model);
          console.log('GLTF model loaded with distortion-only shader material:', model);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('An error occurred while loading the GLTF model:', error);        
        }
      );
    };

    const createNoiseBackground = (patternTexture, fogNoiseTexture) => {
      const tileTextures = createTileTextures(patternTexture.image);
      const planeGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
    
      material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uTile0: { value: tileTextures[0] },
          uTile1: { value: tileTextures[1] },
          uTile2: { value: tileTextures[2] },
          uTile3: { value: tileTextures[3] },
          uTile4: { value: tileTextures[4] },
          uTile5: { value: tileTextures[5] },
          uTile6: { value: tileTextures[6] },
          uNoiseTexture: { value: fogNoiseTexture },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uPrevMouse: { value: new THREE.Vector2(0, 0) },
          uTrailPositions: { value: [
            new THREE.Vector2(0, 0), new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0), new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0), new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0), new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)
          ]},
          uBaseColor: { value: new THREE.Color(0xffffff) },
          uHighlightColor: { value: new THREE.Color(0xffff00) },
          uIsMouseMoving: { value: 0.0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uStepSize: { value: 15 },
          uPatternThreshold: { value: 0.25 },
          uNumColumns: { value: 7.0 },
          uNumRows: { value: 1.0 },
          uMouseInfluenceRadius: { value: 0.2 },
          uPatternBrightness: { value: 0.8 },
          uSwapTime: { value: 0 },
          uVerticalSpeed: { value: 0.1 },
          uWorldScale: { value: 1.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec2 vScreenCoord;
          varying vec3 vWorldPosition;
    
          void main() {
            vUv = uv;
    
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vec4 viewPosition = viewMatrix * worldPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
    
            gl_Position = projectedPosition;
            vScreenCoord = gl_Position.xy * 0.5 + 0.5;
            vWorldPosition = worldPosition.xyz;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTile0;
          uniform sampler2D uTile1;
          uniform sampler2D uTile2;
          uniform sampler2D uTile3;
          uniform sampler2D uTile4;
          uniform sampler2D uTile5;
          uniform sampler2D uTile6;
          uniform sampler2D uNoiseTexture;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform vec2 uPrevMouse;
          uniform vec2 uTrailPositions[10];
          uniform vec3 uBaseColor;
          uniform vec3 uHighlightColor;
          uniform float uIsMouseMoving;
          uniform vec2 uResolution;
          uniform float uStepSize;
          uniform float uPatternThreshold;
          uniform float uMouseInfluenceRadius;
          uniform float uPatternBrightness;
          uniform float uSwapTime;
          uniform float uVerticalSpeed;
          uniform float uWorldScale;
    
          varying vec2 vUv;
          varying vec2 vScreenCoord;
          varying vec3 vWorldPosition;
    
          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }
    
          // Modified to create column-based offsets that ensure vertical movement
          float getCellAnimationOffset(vec2 cell) {
            // Use only the Y coordinate with a strong multiplier to create row-based timing
            // Add a small X component to prevent perfect synchronization but keep it minimal
            return hash(vec2(cell.x * 0.1, cell.y * 10.0)) * 2.0;
          }
    
          float getBrightness(vec2 cell, float cellRandom, float blendFactor) {
            vec2 noiseSampleCoord = cell * 0.05 + uTime * 0.01;
            float noiseValue = texture2D(uNoiseTexture, fract(noiseSampleCoord)).r;
            float h = hash(cell * 7.29);
            float combinedRandom = (h + noiseValue) * 0.5;
            float baseBrightness = pow(combinedRandom, 1.5) * 3.0;
            
            float pulse = 0.95 + sin(uTime * 0.2 + cellRandom * 6.28) * 0.1;
            float transitionBrightness = 1.0 - abs(blendFactor - 0.5) * 0.3;
            return baseBrightness * pulse * transitionBrightness;
          }
    
          vec4 getTileColor(int tileIndex, vec2 uv) {
            if(tileIndex == 0) return texture2D(uTile0, uv);
            else if(tileIndex == 1) return texture2D(uTile1, uv);
            else if(tileIndex == 2) return texture2D(uTile2, uv);
            else if(tileIndex == 3) return texture2D(uTile3, uv);
            else if(tileIndex == 4) return texture2D(uTile4, uv);
            else if(tileIndex == 5) return texture2D(uTile5, uv);
            else return texture2D(uTile6, uv);
          }
    
          void main() {
            vec2 worldCoord = vWorldPosition.xy;
            float scaledStepSize = uStepSize / uWorldScale;
            vec2 cellCoord = floor(worldCoord / scaledStepSize);
            vec2 cellPos = fract(worldCoord / scaledStepSize);
    
            float swapDuration = 0.4;
            float swapInterval = 3.0; // Increased interval to reduce frequency of swaps
    
            // Modified animation offset calculation for better vertical flow
            float cellAnimationOffset = getCellAnimationOffset(cellCoord);
            
            // Add a wave-like offset based on X coordinate to create diagonal flow patterns
            // but keep it subtle to maintain primarily vertical movement
            float waveOffset = sin(cellCoord.x * 0.5) * 0.3;
            
            float cellPhase = mod(uSwapTime + cellAnimationOffset + waveOffset, swapInterval);
            float blendFactor = smoothstep(swapInterval - swapDuration, swapInterval, cellPhase);
    
            float cellRandom = hash(cellCoord);
            float brightness = getBrightness(cellCoord, cellRandom, blendFactor);
            
            float numTiles = 7.0;
            
            // Modified pattern selection to be more row-dependent
            float rowBasedRandom = hash(vec2(cellCoord.y * 3.0, floor(cellPhase)));
            float currentPatternFloat = floor(rowBasedRandom * numTiles);
            float nextPatternFloat = mod(currentPatternFloat + 1.0, numTiles);
    
            int currentPatternIndex = int(currentPatternFloat);
            int nextPatternIndex = int(nextPatternFloat);
    
            // Enhanced vertical movement with reduced horizontal influence
            vec2 verticalOffset = vec2(0.0, uTime * uVerticalSpeed + cellRandom * 0.05);
            vec2 animatedCellPos = fract(cellPos + verticalOffset);
    
            vec4 currentTileColor = getTileColor(currentPatternIndex, animatedCellPos);
            vec4 nextTileColor = getTileColor(nextPatternIndex, animatedCellPos);
            vec4 finalTileColor = mix(currentTileColor, nextTileColor, blendFactor);
    
            // Noise coordinates modified to emphasize vertical movement
            vec2 noiseCoord1 = cellPos * 2.0 + vec2(cellRandom * 2.0, uTime * 0.8);
            vec2 noiseCoord2 = cellPos * 3.5 + vec2(0.1, 0.9) + vec2(cellRandom * 1.0, -uTime * 0.6);
    
            vec4 noise1 = texture2D(uNoiseTexture, noiseCoord1);
            vec4 noise2 = texture2D(uNoiseTexture, noiseCoord2);
    
            float tileFactor = (finalTileColor.r + finalTileColor.g + finalTileColor.b) / 3.0;
            float noiseFactor = noise1.r * 0.4 + noise2.g * 0.3;
            float combinedFactor = tileFactor * noiseFactor;
    
            vec2 mousePos = uMouse * 0.5 + 0.5;
            vec2 cellCenter = (cellCoord * scaledStepSize) / 100.0 * 0.5 + 0.5;
            float mouseDistance = distance(cellCenter, mousePos);
            float mouseInfluence = 1.0 - smoothstep(0.0, uMouseInfluenceRadius, mouseDistance);
            mouseInfluence *= uIsMouseMoving;
    
            float pulse = 0.95 + sin(uTime * 0.2 + cellRandom * 6.28) * 0.1;
            brightness *= pulse;
    
            vec3 finalColor = uBaseColor;
            finalColor = mix(finalColor, uHighlightColor, mouseInfluence * 0.7);
            brightness *= 1.0 + mouseInfluence * 0.7;
            finalColor *= brightness;
    
            float isPattern = step(uPatternThreshold, tileFactor);
            float alpha = isPattern * combinedFactor * brightness * 1.5;
    
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
    
      noiseBackground = new THREE.Mesh(planeGeometry, material);
      noiseBackground.scale.set(1, 1, 1);
      currentScale = 1;
      scene.add(noiseBackground);
    };

   function createTileTextures(image) {
     const tileW = 50;
     const tileH = 50;
     const numTiles = 7;
     const textures = [];

     const canvas = document.createElement('canvas');
     canvas.width = image ? image.width : tileW * numTiles;
     canvas.height = image ? image.height : tileH;
     const ctx = canvas.getContext('2d');

     if (image) {
       ctx.drawImage(image, 0, 0);
     } else {
       for (let i = 0; i < numTiles; i++) {
         ctx.fillStyle = i % 2 === 0 ? 'white' : 'lightgray';
         ctx.fillRect(i * tileW, 0, tileW, tileH);
       }
     }

     for (let tileIndex = 0; tileIndex < numTiles; tileIndex++) {
       const tileCanvas = document.createElement('canvas');
       tileCanvas.width = tileW;
       tileCanvas.height = tileH;
       const tileCtx = tileCanvas.getContext('2d');

       tileCtx.drawImage(
         canvas,
         tileIndex * tileW, 0,
         tileW, tileH,
         0, 0,
         tileW, tileH
       );

       const texture = new THREE.CanvasTexture(tileCanvas);
       texture.needsUpdate = true;
       textures.push(texture);
     }

     return textures;
   }

   const easeInOutQuart = (t) => {
     return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
   };

   const easeOutExpo = (t) => {
     return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
   };

   // Enhanced mouse velocity tracking
   const mouseVelocity = { x: 0, y: 0 };
   const velocitySmoothing = 0.1;
   let lastMouseTime = 0;

   const animate = () => {
    animationId = requestAnimationFrame(animate);
  
    const elapsedTime = clock.getElapsedTime();
    const currentTime = performance.now();
    
    // Enhanced mouse velocity calculation with smoothing
    if (currentTime - lastMouseTime > 0) {
      const deltaTime = Math.max((currentTime - lastMouseTime) / 1000, 0.001);
      const instantVelocity = {
        x: (mousePositionRef.current.x - prevMousePositionRef.current.x) / deltaTime,
        y: (mousePositionRef.current.y - prevMousePositionRef.current.y) / deltaTime
      };
      
      // Apply smoothing to velocity
      mouseVelocity.x = mouseVelocity.x * (1 - velocitySmoothing) + instantVelocity.x * velocitySmoothing;
      mouseVelocity.y = mouseVelocity.y * (1 - velocitySmoothing) + instantVelocity.y * velocitySmoothing;
      
      // Apply decay when not moving
      if (!isMouseMovingRef.current) {
        mouseVelocity.x *= 0.95;
        mouseVelocity.y *= 0.95;
      }
    }
    lastMouseTime = currentTime;
    
    if (!initialAnimation.complete) {
      const zoomInDuration = 3.0;
      const elapsed = elapsedTime - initialAnimation.startTime;
  
      if (initialAnimation.phase === 'zoomIn') {
        const progress = easeInOutQuart(Math.min(elapsed / zoomInDuration, 1));
        const scale = 1 + (6 * progress);
  
        if (noiseBackground) {
          noiseBackground.scale.set(scale, scale, scale);
          currentScale = scale;
        }
  
        if (elapsed >= zoomInDuration && !elementsAdded) {
          initialAnimation.complete = true;
          elementsAdded = true;
  
          createDarkOverlay();
          createOverlay();
          
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load('/images/textures/fognoise.jpg', (fogNoiseTexture) => {
              loadModel(fogNoiseTexture);
          });
        }
      }
    }
  
    // Update background shader uniforms
    if (material && material.uniforms) {
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uSwapTime.value = elapsedTime;
      material.uniforms.uWorldScale.value = currentScale;
      material.uniforms.uIsMouseMoving.value = isMouseMovingRef.current ? 1.0 : 0.0;
  
      const worldMouseX = mousePositionRef.current.x;
      const worldMouseY = mousePositionRef.current.y;
      material.uniforms.uMouse.value.set(worldMouseX, worldMouseY);
      material.uniforms.uPrevMouse.value.set(prevMousePositionRef.current.x, prevMousePositionRef.current.y);
  
      for (let i = 0; i < mouseTrailRef.current.length; i++) {
        const pos = mouseTrailRef.current[i];
        material.uniforms.uTrailPositions.value[i].set(pos.x, pos.y);
      }
  
      material.uniforms.uNumColumns.value = 7.0;
      material.uniforms.uNumRows.value = 1.0;
      material.uniforms.uPatternThreshold.value = 0.25 + Math.sin(elapsedTime * 0.2) * 0.05;
    }
  
    // Update overlay shader uniforms
    if (overlayMaterial && overlayMaterial.uniforms) {
      overlayMaterial.uniforms.uTime.value = elapsedTime;
      overlayMaterial.uniforms.uAspectRatio.value = window.innerWidth / window.innerHeight;
    }
  
    // Update dark overlay shader uniforms
    if (darkOverlayMaterial && darkOverlayMaterial.uniforms) {
      darkOverlayMaterial.uniforms.uTime.value = elapsedTime;
      darkOverlayMaterial.uniforms.uAspectRatio.value = window.innerWidth / window.innerHeight;
    }
  
    // Enhanced GLTF model shader uniforms with proper coordinate conversion
    if (modelShaderMaterialRef.current && 
        modelShaderMaterialRef.current.uniforms && 
        gltfModelRef.current) {
      
      const uniforms = modelShaderMaterialRef.current.uniforms;
      
      uniforms.uTime.value = elapsedTime;
      uniforms.uIsMouseMoving.value = isMouseMovingRef.current ? 1.0 : 0.0;
      uniforms.uMouseVelocity.value.set(mouseVelocity.x, mouseVelocity.y);

      // Proper mouse world position conversion
      if (camera && uniforms.uMouseWorldPos) {
        // Convert normalized device coordinates to world coordinates
        const halfWidth = (camera.right - camera.left) / 2;
        const halfHeight = (camera.top - camera.bottom) / 2;
        const mouseWorldX = mousePositionRef.current.x * halfWidth;
        const mouseWorldY = mousePositionRef.current.y * halfHeight;
        const mouseWorldZ = gltfModelRef.current.position.z;
        
        uniforms.uMouseWorldPos.value.set(mouseWorldX, mouseWorldY, mouseWorldZ);
      }

      // Log for debugging
      if (isMouseMovingRef.current) {
        console.log('Mouse moving - distortion only:', {
          mouse: mousePositionRef.current,
          velocity: mouseVelocity,
          worldPos: uniforms.uMouseWorldPos.value,
          influence: uniforms.uMouseInfluenceRadius.value
        });
      }
    }
  
    renderer.render(scene, camera);
  };

  const handleResize = () => {
    if (!camera || !renderer) return;
  
    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 100;
  
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
  
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    if (material && material.uniforms) {
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
      material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  
    if (overlayMaterial && overlayMaterial.uniforms) {
      overlayMaterial.uniforms.uAspectRatio.value = aspectRatio;
    }
  
    if (darkOverlayMaterial && darkOverlayMaterial.uniforms) {
      darkOverlayMaterial.uniforms.uAspectRatio.value = aspectRatio;
    }
  
    // Update model shader uniforms on resize
    if (modelShaderMaterialRef.current && modelShaderMaterialRef.current.uniforms) {
      const uniforms = modelShaderMaterialRef.current.uniforms;
      
      // Update mouse world position based on new camera dimensions
      if (camera && uniforms.uMouseWorldPos) {
        const halfWidth = (camera.right - camera.left) / 2;
        const halfHeight = (camera.top - camera.bottom) / 2;
        const mouseWorldX = mousePositionRef.current.x * halfWidth;
        const mouseWorldY = mousePositionRef.current.y * halfHeight;
        const mouseWorldZ = gltfModelRef.current ? gltfModelRef.current.position.z : 0;
        
        uniforms.uMouseWorldPos.value.set(mouseWorldX, mouseWorldY, mouseWorldZ);
      }
  
      // Keep tile scale consistent - remove the scaling based on window width
      // uniforms.uTileScale.value = 100.0 * (window.innerWidth / 1920); // Remove this line
      // uniforms.uMouseInfluenceRadius.value = 100.0 * (window.innerWidth / 1920); // Remove this line
      
      // Keep these values constant instead:
      uniforms.uTileScale.value = 100.0;
      uniforms.uMouseInfluenceRadius.value = 150.0; // Larger than background
      uniforms.uHoverRadius.value = 0.3; // Keep hover radius consistent
      uniforms.uHoverSmoothness.value = 0.8; // Add smoothness uniform update
      uniforms.uEdgeBrightness.value = 0.8; // Add edge brightness uniform update
      uniforms.uBaseBrightness.value = 1.2;
    }
  };

   window.addEventListener('resize', handleResize);
   init();

   return () => {
     window.removeEventListener('resize', handleResize);
     window.removeEventListener('mousemove', handleMouseMove);

     if (mouseTimerRef.current) {
       clearTimeout(mouseTimerRef.current);
     }

     if (animationId) {
       cancelAnimationFrame(animationId);
     }

     const mountElement = mountRef.current;
     if (mountElement && renderer) {
       mountElement.removeChild(renderer.domElement);
     }

     if (gltfModelRef.current) {
       gltfModelRef.current.traverse((child) => {
         if (child.isMesh) {
           if (child.geometry) {
             child.geometry.dispose();
           }
           if (child.material) {
             if (Array.isArray(child.material)) {
               child.material.forEach((mat) => mat.dispose());
             } else {
               child.material.dispose();
             }
           }
         }
       });
       scene.remove(gltfModelRef.current);
     }

     if (noiseBackground && noiseBackground.geometry) {
       noiseBackground.geometry.dispose();
     }

     if (overlay && overlay.geometry) {
       overlay.geometry.dispose();
     }

     if (darkOverlay && darkOverlay.geometry) {
       darkOverlay.geometry.dispose();
     }

     if (material) {
       material.dispose();
     }

     if (overlayMaterial) {
       overlayMaterial.dispose();
     }

     if (darkOverlayMaterial) {
       darkOverlayMaterial.dispose();
     }

     if (scene) {
       scene.clear();
     }
   };
 }, []);

 return (
   <div
     ref={mountRef}
     style={{
       position: 'fixed',
       top: 0,
       left: 0,
       width: '100%',
       height: '100%',
       zIndex: -1,
       background: '#000'
     }}
   />
 );
}