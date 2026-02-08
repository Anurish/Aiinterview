"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.001);

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Group for all objects to apply global animations (breathing/intro)
        const group = new THREE.Group();
        scene.add(group);

        // Particles
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities: { x: number; y: number; z: number }[] = [];
        const originalPositions: { x: number; y: number; z: number }[] = [];

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions.push({ x, y, z });

            velocities.push({
                x: (Math.random() - 0.5) * 0.05,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.05,
            });
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x8b5cf6, // Violet-500
            size: 0.25,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(geometry, particleMaterial);
        group.add(particles);

        // Lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x6366f1, // Indigo-500
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
        });

        const linesGeometry = new THREE.BufferGeometry();
        const lines = new THREE.LineSegments(linesGeometry, lineMaterial);
        group.add(lines);

        // Interaction state
        const mouse = new THREE.Vector2();
        const targetRotation = new THREE.Vector2();

        const handleMouseMove = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const rect = container.getBoundingClientRect();
                mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: false });

        // Animation loop
        let frameId: number;
        let time = 0;
        let introProgress = 0; // 0 to 1

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            time += 0.01;

            // Intro Expansion (Neural Network "Booting up")
            if (introProgress < 1) {
                introProgress += 0.015;
                if (introProgress > 1) introProgress = 1;

                // Ease out cubic
                const ease = 1 - Math.pow(1 - introProgress, 3);
                group.scale.setScalar(ease);
                group.rotation.z = (1 - ease) * Math.PI; // Spin in
            } else {
                // "Breathing" Effect (Neural Pulse)
                const breath = 1 + Math.sin(time * 0.8) * 0.03;
                group.scale.setScalar(breath);
            }

            // Scroll interaction
            const scrollY = window.scrollY;
            const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);

            // Rotate based on scroll
            const targetScrollRot = scrollProgress * Math.PI * 2; // Full rotation over page scroll
            group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetScrollRot + mouse.x * 0.2, 0.05);
            group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, scrollProgress * 0.5 + mouse.y * 0.2, 0.05);

            const positions = particles.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < particleCount; i++) {
                // Update position based on velocity
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                // Simple boundary check
                const limit = 25;
                if (Math.abs(positions[i * 3]) > limit) velocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > limit * 0.6) velocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2]) > limit * 0.6) velocities[i].z *= -1;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // Connect nearby particles with lines
            const linePositions = [];
            const connectDistance = 7; // Slightly increased

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < connectDistance) {
                        // Alpha based on distance
                        const alpha = 1 - dist / connectDistance;
                        // Use a global opacity hack or just push positions. 
                        // Three.js LineSegments doesn't support per-vertex alpha easily without custom shader.
                        // We'll stick to geometry updates.
                        linePositions.push(
                            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                        );
                    }
                }
            }

            lines.geometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(frameId);
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            particleMaterial.dispose();
            linesGeometry.dispose();
            lineMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-50 bg-gradient-to-b from-slate-950 via-black to-slate-950"
            style={{ touchAction: 'none' }}
        />
    );
}
