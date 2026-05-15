"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { films } from "./data";

type SceneProps = {
    activeIndex: number;
    setActiveIndex: (index: number | ((prev: number) => number)) => void;
    isMobile: boolean;
};

type PosterProps = {
    virtualIndex: number;
    dragIndexRef: React.MutableRefObject<number>;
    activeIndex: number;
    setActiveIndex: (index: number) => void;
    isMobile: boolean;
    isDraggingRef: React.MutableRefObject<boolean>;
    hasMovedRef: React.MutableRefObject<boolean>;
};

const getFilmIndex = (index: number) => {
    return ((index % films.length) + films.length) % films.length;
};

function Poster({
                    virtualIndex,
                    dragIndexRef,
                    activeIndex,
                    setActiveIndex,
                    isMobile,
                    isDraggingRef,
                    hasMovedRef,
                }: PosterProps) {
    const groupRef = useRef<THREE.Group>(null);
    const mainMatRef = useRef<THREE.MeshBasicMaterial>(null);

    const stackRef = useRef<THREE.Mesh>(null);
    const stackMatRef = useRef<THREE.MeshBasicMaterial>(null);

    const filmIndex = getFilmIndex(virtualIndex);
    const film = films[filmIndex];

    const frontTexture = useTexture(film.image);
    const spineTexture = useTexture(film.spine || film.image);
    const backTexture = useTexture(film.back || film.image);

    const tempVec = useMemo(() => new THREE.Vector3(), []);

    const isCurrentActive = virtualIndex === activeIndex;

    useEffect(() => {
        [frontTexture, spineTexture, backTexture].forEach((texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
        });
    }, [frontTexture, spineTexture, backTexture]);

    useFrame(() => {
        if (!groupRef.current || !mainMatRef.current) return;

        const group = groupRef.current;

        const offset = virtualIndex - dragIndexRef.current;
        const abs = Math.abs(offset);
        const isActive = Math.abs(offset) < 0.35;

        const sideGap = isMobile ? 0.95 : 1.28;
        const spineGap = isMobile ? 0.48 : 0.45;

        const x =
            abs < 0.35
                ? offset * sideGap
                : Math.sign(offset) * (sideGap + (abs - 1) * spineGap);

        const y = isActive ? 0.06 : 0.08;
        const z = isActive ? 0.85 : -0.08 * abs;

        const rotY = isActive ? -0.08 : 0;
        const rotZ = isActive ? -0.045 : 0;

        const scaleX = isActive ? 1.18 : 0.4;
        const scaleY = isActive ? 1.18 : 1.04;

        const opacity = abs > 12 ? 0 : isActive ? 1 : 0.9;

        tempVec.set(x, y, z);

        group.position.lerp(tempVec, 0.1);

        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, rotY, 0.1);
        group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, rotZ, 0.1);

        group.scale.x = THREE.MathUtils.lerp(group.scale.x, scaleX, 0.1);
        group.scale.y = THREE.MathUtils.lerp(group.scale.y, scaleY, 0.1);

        mainMatRef.current.opacity = THREE.MathUtils.lerp(
            mainMatRef.current.opacity,
            opacity,
            0.1
        );
    });

    useEffect(() => {
        if (!stackRef.current || !stackMatRef.current) return;

        gsap.killTweensOf(stackRef.current.position);
        gsap.killTweensOf(stackRef.current.rotation);
        gsap.killTweensOf(stackMatRef.current);

        if (!isCurrentActive) {
            stackMatRef.current.opacity = 0;
            stackRef.current.position.set(0.02, -0.02, -0.065);
            stackRef.current.rotation.set(0, 0, 0);
            return;
        }

        stackMatRef.current.opacity = 0;
        stackRef.current.position.set(0.02, -0.02, -0.065);
        stackRef.current.rotation.set(0, 0, 0);

        const tl = gsap.timeline({ delay: 0.45 });

        tl.to(
            stackRef.current.position,
            {
                x: 0.08,
                y: -0.08,
                z: -0.065,
                duration: 0.65,
                ease: "power4.out",
            },
            0
        );

        tl.to(
            stackRef.current.rotation,
            {
                z: 0.025,
                duration: 0.65,
                ease: "power4.out",
            },
            0
        );

        tl.to(
            stackMatRef.current,
            {
                opacity: 0.82,
                duration: 0.45,
                ease: "power2.out",
            },
            0.08
        );
    }, [isCurrentActive]);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();

        if (isDraggingRef.current || hasMovedRef.current) return;
        if (virtualIndex === activeIndex) return;

        setActiveIndex(virtualIndex);
    };

    return (
        <group ref={groupRef} onClick={handleClick}>
            {isCurrentActive && (
                <mesh ref={stackRef} raycast={() => null}>
                    <planeGeometry args={[1.15, 1.68]} />

                    <meshBasicMaterial
                        ref={stackMatRef}
                        map={frontTexture}
                        transparent
                        opacity={0}
                        toneMapped={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            <group>
                {!isCurrentActive && (
                    <mesh position={[0, 0, -0.001]}>
                        <planeGeometry args={[0.75, 1.95]} />

                        <meshBasicMaterial
                            transparent
                            opacity={0}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                )}

                <mesh>
                    <planeGeometry
                        args={
                            isCurrentActive
                                ? [1.15, 1.68]
                                : [0.34, 1.68]
                        }
                    />

                    <meshBasicMaterial
                        ref={mainMatRef}
                        map={isCurrentActive ? frontTexture : spineTexture}
                        transparent
                        opacity={0}
                        toneMapped={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            {isCurrentActive && (
                <mesh
                    position={[0, 0, -0.035]}
                    rotation={[0, Math.PI, 0]}
                    raycast={() => null}
                >
                    <planeGeometry args={[1.15, 1.68]} />

                    <meshBasicMaterial
                        map={backTexture}
                        transparent
                        opacity={0.65}
                        toneMapped={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
}

export function Scene({
                          activeIndex,
                          setActiveIndex,
                          isMobile,
                      }: SceneProps) {
    const dragIndexRef = useRef(activeIndex);

    const dragStartX = useRef(0);
    const dragStartIndex = useRef(0);

    const isDragging = useRef(false);
    const hasMoved = useRef(false);

    const virtualPosters = useMemo(() => {
        return Array.from({ length: 61 }, (_, i) => i - 30);
    }, []);

    useEffect(() => {
        gsap.to(dragIndexRef, {
            current: activeIndex,
            duration: 0.9,
            ease: "power4.out",
        });
    }, [activeIndex]);

    const snapToIndex = (index: number) => {
        const snapped = Math.round(index);

        gsap.to(dragIndexRef, {
            current: snapped,
            duration: 0.85,
            ease: "power4.out",

            onUpdate: () => {
                setActiveIndex(Math.round(dragIndexRef.current));
            },

            onComplete: () => {
                setActiveIndex(snapped);
            },
        });
    };

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        isDragging.current = true;
        hasMoved.current = false;

        dragStartX.current = e.clientX;
        dragStartIndex.current = dragIndexRef.current;

        gsap.killTweensOf(dragIndexRef);

        (e.currentTarget as unknown as HTMLElement).setPointerCapture?.(
            e.pointerId
        );
    };

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isDragging.current) return;

        const deltaX = e.clientX - dragStartX.current;
        const dragStrength = isMobile ? 180 : 240;

        if (Math.abs(deltaX) > 4) {
            hasMoved.current = true;
        }

        dragIndexRef.current = dragStartIndex.current - deltaX / dragStrength;
    };

    const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (!isDragging.current) return;

        isDragging.current = false;

        (e.currentTarget as unknown as HTMLElement).releasePointerCapture?.(
            e.pointerId
        );

        snapToIndex(dragIndexRef.current);

        setTimeout(() => {
            hasMoved.current = false;
        }, 50);
    };

    const handlePointerLeave = () => {
        if (!isDragging.current) return;

        isDragging.current = false;

        snapToIndex(dragIndexRef.current);

        setTimeout(() => {
            hasMoved.current = false;
        }, 50);
    };

    const handleWheel = (e: ThreeEvent<WheelEvent>) => {
        e.stopPropagation();

        const delta = e.deltaY || e.deltaX;
        const next = dragIndexRef.current + delta * 0.004;

        snapToIndex(next);
    };

    return (
        <>
            <color attach="background" args={["#000000"]} />

            <ambientLight intensity={2.8} />

            <group
                position={[0, 0.1, 0]}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onWheel={handleWheel}
            >
                {virtualPosters.map((virtualIndex) => (
                    <Poster
                        key={virtualIndex}
                        virtualIndex={virtualIndex}
                        dragIndexRef={dragIndexRef}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        isMobile={isMobile}
                        isDraggingRef={isDragging}
                        hasMovedRef={hasMoved}
                    />
                ))}
            </group>
        </>
    );
}