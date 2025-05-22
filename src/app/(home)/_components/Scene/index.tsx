"use client"
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function NoiseBackground() {
  const mountRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
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
    let clock = new THREE.Clock();
    let material;
    let overlayMaterial;
    let darkOverlayMaterial;
    let noiseBackground;
    let overlay;
    let darkOverlay;
    let currentScale = 1.0;
    let initialAnimation = {
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
      setMousePosition(newPosition);
      mousePositionRef.current = newPosition;

      isMouseMovingRef.current = true;

      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }

      mouseTimerRef.current = setTimeout(() => {
        isMouseMovingRef.current = false;
      }, 200); // Increased timeout for better detection
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
    
    // Modified shader material with distortion only - no color changes
    const createModelShaderMaterial = (fogNoiseTexture) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uMouseWorldPos: { value: new THREE.Vector3(0, 0, 0) },
          uIsMouseMoving: { value: 0.0 },
          uFogNoise: { value: fogNoiseTexture },
          uBaseColor: { value: new THREE.Color(0x000000) },
          uTileColor: { value: new THREE.Color(0xffffff) },
          uTileScale: { value: 200.0 },
          uMouseInfluenceRadius: { value: 100.0 },
          uBrightnessVariation: { value: 0.5 },
          uAnimationSpeed: { value: 0.2 },
          uLightSpeed: { value: 0.5 },
          uWaveFrequency: { value: 1.0 },
          uThreshold: { value: 0.5 },
          uStateDelay: { value: 0.8 },
          uMaxBrightness: { value: 0.7 },
          uMouseVelocity: { value: new THREE.Vector2(0, 0) },
          uDistortionStrength: { value: 30.0 },
          uRelaxation: { value: 0.95 },
          uWaveSpeed: { value: 2.0 },
          uWaveAmplitude: { value: 0.5 }
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

          // Enhanced water-like smooth falloff function
          float waterFalloff(float x) {
            float falloff = 1.0 - smoothstep(0.0, 1.0, x);
            return falloff * falloff * (3.0 - 2.0 * falloff);
          }

          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vMouseVelocity = uMouseVelocity;
            vPosition = position;
            
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            float mouseDistance = distance(worldPosition.xyz, uMouseWorldPos);
            vMouseDistance = mouseDistance;
            
            // Calculate mouse influence with enhanced falloff
            float rawInfluence = 1.0 - smoothstep(0.0, uMouseInfluenceRadius, mouseDistance);
            vMouseInfluence = waterFalloff(mouseDistance / uMouseInfluenceRadius) * rawInfluence;
            vMouseInfluence *= uIsMouseMoving;
            
            // Apply enhanced distortion
            vec3 distortedPosition = position;
            
            if (vMouseInfluence > 0.01) {
              // Enhanced wave effect
              float wave = sin(position.x * 8.0 + uTime * uWaveSpeed) * 
                          cos(position.z * 4.0 + uTime * uWaveSpeed * 0.5);
              
              // Add secondary wave for more complex motion
              float secondaryWave = sin(position.x * 4.0 - uTime * uWaveSpeed * 0.7) * 
                                  cos(position.z * 8.0 + uTime * uWaveSpeed * 0.3);
              
              // Combine waves with enhanced influence
              float combinedWave = mix(wave, secondaryWave, 0.5);
              
              // Apply stronger distortion to Y
              float waveInfluence = combinedWave * uWaveAmplitude * vMouseInfluence * 2.0;
              
              // Add stronger velocity influence
              float velocityInfluence = uMouseVelocity.y * vMouseInfluence * 0.8;
              
              // Combine effects with enhanced strength
              distortedPosition.y += waveInfluence + velocityInfluence;
              
              // Add stronger ripple effect
              float ripple = sin(mouseDistance * 2.0 - uTime * 3.0) * vMouseInfluence * 0.3;
              distortedPosition.y += ripple;
              
              // Add subtle X and Z distortion
              distortedPosition.x += sin(uTime * 2.0 + position.y) * vMouseInfluence * 0.2;
              distortedPosition.z += cos(uTime * 2.0 + position.y) * vMouseInfluence * 0.2;
            }
            
            // Apply relaxation with smoother transition
            distortedPosition = mix(position, distortedPosition, uRelaxation);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPosition, 1.0);
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
          uniform vec3 uTileColor;
          uniform float uTileScale;
          uniform float uMouseInfluenceRadius;
          uniform float uBrightnessVariation;
          uniform float uAnimationSpeed;
          uniform float uLightSpeed;
          uniform float uWaveFrequency;
          uniform float uThreshold;
          uniform float uStateDelay;
          uniform float uMaxBrightness;
          uniform vec2 uMouseVelocity;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vWorldPosition;
          varying float vMouseInfluence;
          varying float vMouseDistance;
          varying vec2 vMouseVelocity;

          float random(in vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }

          vec2 truchetPattern(vec2 fpos, float random) {
            vec2 tile;
            if (random < 0.25) {
              tile = vec2(fpos.x, fpos.y);
            } else if (random < 0.5) {
              tile = vec2(1.0 - fpos.x, fpos.y);
            } else if (random < 0.75) {
              tile = vec2(fpos.x, 1.0 - fpos.y);
            } else {
              tile = vec2(1.0 - fpos.x, 1.0 - fpos.y);
            }
            return tile;
          }

          vec2 worldToTileCoords(vec3 worldPos, vec3 normal) {
            vec2 tileCoords;
            vec3 absNormal = abs(normal);
            
            if (absNormal.x > absNormal.y && absNormal.x > absNormal.z) {
              tileCoords = worldPos.yz;
            } else if (absNormal.y > absNormal.z) {
              tileCoords = worldPos.xz;
            } else {
              tileCoords = worldPos.xy;
            }
            
            return tileCoords;
          }

          void main() {
            vec2 tileCoords = worldToTileCoords(vWorldPosition, vNormal);
            vec2 st = tileCoords * uTileScale * 0.1;
            vec2 ipos = floor(st);
            vec2 fpos = fract(st);
            
            float tileRandom = random(ipos);
        
            vec2 tile = truchetPattern(fpos, tileRandom);
            float pattern = smoothstep(tile.x - 0.3, tile.x, tile.y) -
                            smoothstep(tile.x, tile.x + 0.3, tile.y);
            
            // Base lighting
            vec2 lightCoords = tileCoords * 0.1;
            float delayedTime = floor(uTime / uStateDelay) * uStateDelay;
            float timeBasedRandom = fract(sin(dot(lightCoords, vec2(12.9898, 78.233))) * 43758.5453 + delayedTime * 0.2);
            float binaryState = step(uThreshold, timeBasedRandom);
            
            vec2 noiseCoord = tileCoords * 0.05 + delayedTime * 0.1;
            float noiseValue = texture2D(uFogNoise, noiseCoord).r;
            
            float tileBrightness = binaryState * (0.4 + noiseValue * 0.6);
            float randomPulse = step(0.5, fract(delayedTime * uAnimationSpeed + tileRandom * PI * 2.0));
            tileBrightness *= (0.7 + randomPulse * 0.5);
            
            pattern *= tileBrightness;
            
            // Base color calculation
            vec3 finalColor = mix(uBaseColor, uTileColor, pattern);
            
            // Adjust gamma for better contrast
            finalColor = pow(finalColor, vec3(0.7));
            
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
          uStepSize: { value: 13.5 },
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

         float getCellAnimationOffset(vec2 cell) {
             return hash(cell * 9.87) * 1.0;
         }

         float getBrightness(vec2 cell, float cellRandom, float blendFactor) {
           vec2 noiseSampleCoord = cell * 0.05 + uTime * 0.01;
           float noiseValue = texture2D(uNoiseTexture, fract(noiseSampleCoord)).r;
           float h = hash(cell * 7.29);
           float combinedRandom = (h + noiseValue) * 0.5;
           float baseBrightness = pow(combinedRandom, 2.0) * 3.0;
           
           float pulse = 0.9 + sin(uTime * 0.2 + cellRandom * 6.28) * 0.2;
           float transitionBrightness = 1.0 - abs(blendFactor - 0.5) * 0.5;
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
           float swapInterval = 2.0;

           float cellAnimationOffset = getCellAnimationOffset(cellCoord);
           float cellPhase = mod(uSwapTime + cellAnimationOffset, swapInterval);
           float blendFactor = smoothstep(swapInterval - swapDuration, swapInterval, cellPhase);

           float cellRandom = hash(cellCoord);
           float brightness = getBrightness(cellCoord, cellRandom, blendFactor);
           
           float numTiles = 7.0;
           float currentPatternFloat = floor(cellPhase / swapInterval * numTiles);
           float nextPatternFloat = mod(currentPatternFloat + 1.0, numTiles);

           int currentPatternIndex = int(currentPatternFloat);
           int nextPatternIndex = int(nextPatternFloat);

           vec2 animatedCellPos = fract(cellPos + vec2(0.0, uTime * uVerticalSpeed + cellRandom * 0.1));

           vec4 currentTileColor = getTileColor(currentPatternIndex, animatedCellPos);
           vec4 nextTileColor = getTileColor(nextPatternIndex, animatedCellPos);
           vec4 finalTileColor = mix(currentTileColor, nextTileColor, blendFactor);

           vec2 noiseCoord1 = cellPos * 2.0 + vec2(cellRandom * 10.0, uTime * 0.5);
           vec2 noiseCoord2 = cellPos * 3.5 + vec2(0.3, 0.7) + vec2(cellRandom * 5.0, -uTime * 0.3);

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

           float pulse = 0.9 + sin(uTime * 0.2 + cellRandom * 6.28) * 0.2;
           brightness *= pulse;

           vec3 finalColor = uBaseColor;
           finalColor = mix(finalColor, uHighlightColor, mouseInfluence * 0.8);
           brightness *= 1.0 + mouseInfluence * 0.8;
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
     const tileW = 25;
     const tileH = 25;
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
   let mouseVelocity = { x: 0, y: 0 };
   let velocitySmoothing = 0.1;
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

     if (mountRef.current && renderer) {
       mountRef.current.removeChild(renderer.domElement);
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