"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Avatar3DProps {
    isListening?: boolean;
    isSpeaking?: boolean;
    questionText?: string;
    audioLevel?: number;
}

// Realistic skin texture with proper PBR
function createRealisticSkinTexture(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Realistic base skin tone (caucasian)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#f5deb3");
    gradient.addColorStop(0.5, "#f0d9a7");
    gradient.addColorStop(1, "#e8c89f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subsurface scattering effect with micro-variations
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 0.3;
        const alpha = Math.random() * 0.15;
        ctx.fillStyle = `rgba(220, 180, 160, ${alpha})`;
        ctx.fillRect(x, y, size, size);
    }

    // Subtle pore structure (Perlin-like noise)
    for (let i = 0; i < 1500; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 0.2;
        ctx.fillStyle = `rgba(180, 140, 120, ${Math.random() * 0.08})`;
        ctx.fillRect(x, y, size, size);
    }

    return new THREE.CanvasTexture(canvas);
}

export function Avatar3D({ isListening = false, isSpeaking = false, questionText = "", audioLevel = 0 }: Avatar3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const avatarRef = useRef<THREE.Group | null>(null);
    const animationIdRef = useRef<number | null>(null);
    const headRef = useRef<THREE.Mesh | null>(null);
    const jawRef = useRef<THREE.Mesh | null>(null);
    const leftEyeRef = useRef<THREE.Mesh | null>(null);
    const rightEyeRef = useRef<THREE.Mesh | null>(null);
    const armRefsRef = useRef<{ left: THREE.Mesh; right: THREE.Mesh } | null>(null);
    const spokenQuestionsRef = useRef<Set<string>>(new Set());
    const [isSpeakingState, setIsSpeakingState] = useState(false);

    // Handle text-to-speech
    useEffect(() => {
        if (!questionText || spokenQuestionsRef.current.has(questionText)) {
            return;
        }

        const speak = () => {
            setIsSpeakingState(true);
            spokenQuestionsRef.current.add(questionText);

            const utterance = new SpeechSynthesisUtterance(questionText);
            utterance.rate = 0.95;
            utterance.pitch = 1.1;
            utterance.volume = 1;

            utterance.onend = () => {
                setIsSpeakingState(false);
            };

            utterance.onerror = () => {
                setIsSpeakingState(false);
            };

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        };

        const timer = setTimeout(speak, 300);
        return () => clearTimeout(timer);
    }, [questionText]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            45,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 1.8;
        camera.position.y = 0.1;
        cameraRef.current = camera;

        // Renderer with better quality
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Professional lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Key light (warm)
        const keyLight = new THREE.DirectionalLight(0xffe0c0, 1.4);
        keyLight.position.set(3.5, 4, 2.5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        scene.add(keyLight);

        // Fill light (cool, from left)
        const fillLight = new THREE.DirectionalLight(0xa0c0e8, 0.5);
        fillLight.position.set(-3, 2, 1);
        scene.add(fillLight);

        // Back rim light
        const rimLight = new THREE.PointLight(0xffffff, 0.4);
        rimLight.position.set(0, 1.5, -2.5);
        scene.add(rimLight);

        // Avatar group
        const avatarGroup = new THREE.Group();
        scene.add(avatarGroup);
        avatarRef.current = avatarGroup;

        // Create realistic skin texture
        const skinTexture = createRealisticSkinTexture(512, 512);

        // Head - smooth geodesic sphere
        const headGeometry = new THREE.IcosahedronGeometry(0.65, 7);
        const skinMaterial = new THREE.MeshPhysicalMaterial({
            map: skinTexture,
            color: 0xf5deb3,
            metalness: 0.0,
            roughness: 0.35,
            emissive: 0x0a0a0a,
            side: THREE.FrontSide,
            flatShading: false,
        });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.0;
        head.castShadow = true;
        head.receiveShadow = true;
        headRef.current = head;
        avatarGroup.add(head);

        // Realistic neck
        const neckGeometry = new THREE.CylinderGeometry(0.26, 0.30, 0.45, 24);
        const neckMaterial = new THREE.MeshPhysicalMaterial({
            map: skinTexture,
            color: 0xf0d9a7,
            metalness: 0.0,
            roughness: 0.35,
        });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = 0.70;
        neck.castShadow = true;
        neck.receiveShadow = true;
        avatarGroup.add(neck);

        // Eyes with depth and realism
        const eyeGeometry = new THREE.SphereGeometry(0.18, 32, 32);
        const eyeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.1,
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.22, 1.35, 0.52);
        leftEye.castShadow = true;
        leftEyeRef.current = leftEye;
        avatarGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.22, 1.35, 0.52);
        rightEye.castShadow = true;
        rightEyeRef.current = rightEye;
        avatarGroup.add(rightEye);

        // Realistic iris
        const irisGeometry = new THREE.SphereGeometry(0.11, 32, 32);
        const irisMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x4a7c8f,
            metalness: 0.15,
            roughness: 0.25,
            emissive: 0x1a1a1a,
        });

        const leftIris = new THREE.Mesh(irisGeometry, irisMaterial);
        leftIris.position.set(-0.22, 1.35, 0.62);
        avatarGroup.add(leftIris);

        const rightIris = new THREE.Mesh(irisGeometry, irisMaterial);
        rightIris.position.set(0.22, 1.35, 0.62);
        avatarGroup.add(rightIris);

        // Pupils with shine
        const pupilGeometry = new THREE.SphereGeometry(0.055, 16, 16);
        const pupilMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            metalness: 0.5,
            roughness: 0.05,
            emissive: 0x0a0a0a,
        });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.22, 1.35, 0.70);
        avatarGroup.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.22, 1.35, 0.70);
        avatarGroup.add(rightPupil);

        // Natural eyebrows
        const browGeometry = new THREE.BoxGeometry(0.32, 0.065, 0.04);
        const browMaterial = new THREE.MeshStandardMaterial({
            color: 0x6b5544,
            metalness: 0,
            roughness: 0.9,
        });

        const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
        leftBrow.position.set(-0.18, 1.58, 0.55);
        leftBrow.rotation.z = -0.08;
        avatarGroup.add(leftBrow);

        const rightBrow = new THREE.Mesh(browGeometry, browMaterial);
        rightBrow.position.set(0.18, 1.58, 0.55);
        rightBrow.rotation.z = 0.08;
        avatarGroup.add(rightBrow);

        // Nose (subtle)
        const noseGeometry = new THREE.ConeGeometry(0.065, 0.28, 8);
        const noseMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xedaa8f,
            metalness: 0,
            roughness: 0.6,
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.05, 0.58);
        nose.rotation.x = Math.PI / 2;
        avatarGroup.add(nose);

        // Mouth with realistic proportions (jaw-driven)
        const jawGeometry = new THREE.BoxGeometry(0.35, 0.12, 0.08);
        const mouthMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xd97a7a,
            metalness: 0.05,
            roughness: 0.5,
            emissive: 0x1a0a0a,
        });
        const jaw = new THREE.Mesh(jawGeometry, mouthMaterial);
        jaw.position.set(0, 0.60, 0.58);
        jaw.castShadow = true;
        jaw.receiveShadow = true;
        jawRef.current = jaw;
        avatarGroup.add(jaw);

        // Natural hair (more refined)
        const hairGeometry = new THREE.SphereGeometry(0.72, 24, 24);
        const hairMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x5a4a3a,
            metalness: 0.1,
            roughness: 0.7,
            emissive: 0x0a0806,
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.2;
        hair.scale.set(1.0, 1.15, 0.9);
        hair.castShadow = true;
        avatarGroup.add(hair);

        // Realistic torso
        const torsoGeometry = new THREE.CylinderGeometry(0.48, 0.42, 1.1, 24);
        const torsoMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a3e,
            metalness: 0.1,
            roughness: 0.8,
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = -0.35;
        torso.castShadow = true;
        torso.receiveShadow = true;
        avatarGroup.add(torso);

        // Refined shoulders
        const shoulderGeometry = new THREE.SphereGeometry(0.32, 20, 20);
        const shoulderMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a3e,
            metalness: 0.1,
            roughness: 0.8,
        });

        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.position.set(-0.52, 0.35, 0);
        leftShoulder.scale.set(1.1, 0.9, 0.85);
        leftShoulder.castShadow = true;
        avatarGroup.add(leftShoulder);

        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.position.set(0.52, 0.35, 0);
        rightShoulder.scale.set(1.1, 0.9, 0.85);
        rightShoulder.castShadow = true;
        avatarGroup.add(rightShoulder);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.13, 0.11, 0.95, 20);
        const armMaterial = new THREE.MeshPhysicalMaterial({
            map: skinTexture,
            color: 0xf0d9a7,
            metalness: 0.0,
            roughness: 0.35,
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.72, 0.05, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        avatarGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.72, 0.05, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        avatarGroup.add(rightArm);

        armRefsRef.current = { left: leftArm, right: rightArm };

        // Hands
        const handGeometry = new THREE.SphereGeometry(0.12, 20, 20);
        const handMaterial = new THREE.MeshPhysicalMaterial({
            map: skinTexture,
            color: 0xf0d9a7,
            metalness: 0.0,
            roughness: 0.35,
        });

        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-1.15, -0.3, 0);
        leftHand.castShadow = true;
        avatarGroup.add(leftHand);

        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(1.15, -0.3, 0);
        rightHand.castShadow = true;
        avatarGroup.add(rightHand);

        // Animation loop
        let time = 0;
        const randPhaseArm = Math.random() * Math.PI * 2;
        const randPhaseHead = Math.random() * Math.PI * 2;

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            time += 0.016;

            // Subtle breathing (reduced)
            avatarGroup.position.y = Math.sin(time * 0.5) * 0.02;

            // Smooth natural head movement
            if (headRef.current) {
                const targetHeadY = Math.sin(time * 0.18 + randPhaseHead) * 0.035;
                const targetHeadX = Math.cos(time * 0.15 + randPhaseHead) * 0.02;
                headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadY, 0.08);
                headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadX, 0.08);
            }

            // Natural blinking
            const blinkCycle = (Math.sin(time * 0.8) + 1) / 2;
            if (leftEyeRef.current && rightEyeRef.current) {
                let targetScaleY = 1;
                if (blinkCycle > 0.95) {
                    targetScaleY = 0.08;
                }
                leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, targetScaleY, 0.3);
                rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, targetScaleY, 0.3);
            }

            // Listening state
            if (isListening) {
                avatarGroup.rotation.z = THREE.MathUtils.lerp(avatarGroup.rotation.z, Math.sin(time * 0.8) * 0.012, 0.1);
            } else {
                avatarGroup.rotation.z = THREE.MathUtils.lerp(avatarGroup.rotation.z, 0, 0.1);
            }

            // Jaw movement driven by audio level + speaking
            if (jawRef.current) {
                const level = Math.min(1, (audioLevel ?? 0) * 2);
                const speakingBoost = isSpeakingState ? 0.15 : 0;
                const jawOpen = level * 0.08 + speakingBoost;
                jawRef.current.position.y = THREE.MathUtils.lerp(jawRef.current.position.y, 0.60 - jawOpen, 0.2);
                jawRef.current.scale.y = THREE.MathUtils.lerp(jawRef.current.scale.y, 1 + jawOpen * 0.5, 0.18);
            }

            // Natural arm movement
            if (armRefsRef.current) {
                const armAmp = 0.22 * (isSpeakingState ? 1.2 : 0.5);
                armRefsRef.current.left.rotation.z = THREE.MathUtils.lerp(armRefsRef.current.left.rotation.z, 0.3 + Math.sin(time * 1.4 + randPhaseArm) * armAmp, 0.12);
                armRefsRef.current.right.rotation.z = THREE.MathUtils.lerp(armRefsRef.current.right.rotation.z, -0.3 - Math.sin(time * 1.4 - randPhaseArm) * armAmp, 0.12);
            }

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (containerRef.current && renderer.domElement && renderer.domElement.parentNode) {
                containerRef.current.removeChild(renderer.domElement);
            }
            window.speechSynthesis.cancel();
            renderer.dispose();
            skinTexture.dispose();
        };
    }, [isSpeakingState, isListening, audioLevel]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        />
    );
}
