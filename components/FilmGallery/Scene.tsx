"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { SPINE_ASPECT, type Film } from "./data";

type SceneProps = {
  films: Film[];
  activeIndex: number;
  setActiveIndex: (index: number | ((prev: number) => number)) => void;
  isMobile: boolean;
};

type PosterProps = {
  films: Film[];
  virtualIndex: number;
  dragIndexRef: React.MutableRefObject<number>;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isMobile: boolean;
  isDraggingRef: React.MutableRefObject<boolean>;
  hasMovedRef: React.MutableRefObject<boolean>;
};

const POSTER_H = 1.68;

// Group scale of an inactive poster (it is shown as a spine).
const SPINE_SCALE = {
  desktop: { x: 0.4, y: 1.04 },
  mobile: { x: 0.78, y: 0.81 },
};

// Plane width that, after the non-uniform spine scale, shows the spine at SPINE_ASPECT.
const spinePlaneWidth = (s: { x: number; y: number }) => (SPINE_ASPECT * POSTER_H * s.y) / s.x;

const POSTER_MAX_W = 1.15;

// Fit a texture inside the poster box without cropping it.
const fitPoster = (t: THREE.Texture): [number, number] => {
  const { width, height } = t.image as { width: number; height: number };
  const aspect = width / height;
  return aspect > POSTER_MAX_W / POSTER_H
    ? [POSTER_MAX_W, POSTER_MAX_W / aspect]
    : [POSTER_H * aspect, POSTER_H];
};

// Centre-crop a texture to the spine aspect (used when a project has no spine image).
const spineFromImage = (t: THREE.Texture) => {
  const c = t.clone();
  const { width, height } = t.image as { width: number; height: number };
  const scale = SPINE_ASPECT / (width / height);
  c.repeat.set(scale, 1);
  c.offset.set((1 - scale) / 2, 0);
  c.needsUpdate = true;
  return c;
};

// Camera framing (must match the <Canvas> camera in FilmGallery.tsx).
const CAMERA_Z = 6.2;
const CAMERA_FOV = 34;
const SCENE_Y = 0.1;
const ACTIVE_Z = 0.85;
const ACTIVE_VISIBLE_H = 2 * (CAMERA_Z - ACTIVE_Z) * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180));

// Free band for the active card, in px from the canvas edges: clears the
// gallery header on top and the title / counter block at the bottom.
// maxScale keeps the card clear of the first spines (desktop) / the screen edges (mobile).
const BAND = {
  desktop: { top: 170, bottom: 200, maxScale: 1.6 },
  mobile: { top: 130, bottom: 220, maxScale: 0.92 },
};
const STACK_DROP = 0.08; // back card peeks out this far below the front
const TILT_MARGIN = 0.06;

// Scale and y that fit the active card plus its back card inside the band.
const activeFrame = (canvasH: number, isMobile: boolean) => {
  const { top, bottom, maxScale } = isMobile ? BAND.mobile : BAND.desktop;
  const unitsPerPx = ACTIVE_VISIBLE_H / canvasH;
  const band = (canvasH - top - bottom) * unitsPerPx;
  const scale = Math.min(maxScale, (band - TILT_MARGIN) / (POSTER_H + STACK_DROP));
  const bandCenterY = ((bottom - top) / 2) * unitsPerPx;
  return { scale, y: bandCenterY - SCENE_Y + (STACK_DROP * scale) / 2 };
};

const getFilmIndex = (index: number, length: number) =>
  ((index % length) + length) % length;

function Poster({
  films,
  virtualIndex,
  dragIndexRef,
  activeIndex,
  setActiveIndex,
  isMobile,
  isDraggingRef,
  hasMovedRef,
}: PosterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flipRef = useRef<THREE.Group>(null);
  const mainMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const stackRef = useRef<THREE.Mesh>(null);
  const stackMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const filmIndex = getFilmIndex(virtualIndex, films.length);
  const film = films[filmIndex];

  const frontTexture = useTexture(film.image);
  const spineSource  = useTexture(film.spine || film.image);
  const backTexture  = useTexture(film.back  || film.image);

  const spineTexture = useMemo(
    () => (film.spine ? spineSource : spineFromImage(spineSource)),
    [film.spine, spineSource]
  );
  const frontSize = useMemo(() => fitPoster(frontTexture), [frontTexture]);
  const backSize  = useMemo(() => fitPoster(backTexture), [backTexture]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const isCurrentActive = virtualIndex === activeIndex;
  const canvasH = useThree((s) => s.size.height);
  const frame = useMemo(() => activeFrame(canvasH, isMobile), [canvasH, isMobile]);

  // Flipped = turned around to show the back of the cassette.
  const [flipped, setFlipped] = useState(false);
  if (!isCurrentActive && flipped) setFlipped(false);

  useEffect(() => {
    [frontTexture, spineTexture, backTexture].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
  }, [frontTexture, spineTexture, backTexture]);

  useFrame(() => {
    if (!groupRef.current || !flipRef.current || !mainMatRef.current) return;

    const group = groupRef.current;
    const flip = flipRef.current;
    const offset = virtualIndex - dragIndexRef.current;
    const abs = Math.abs(offset);
    const isActive = abs < 0.35;

    const sideGap = isMobile ? 0.7 : 1.28;
    const spineGap = isMobile ? 0.42 : 0.45;

    const x =
      abs < 0.35
        ? offset * sideGap
        : Math.sign(offset) * (sideGap + (abs - 1) * spineGap);

    const activeScale = frame.scale;
    const showBack = isActive && isCurrentActive && flipped;
    const y = isActive ? frame.y : 0.08;
    const z = isActive ? ACTIVE_Z : -0.08 * abs;
    const rotY = isActive ? (showBack ? Math.PI + 0.08 : -0.08) : 0;
    const rotZ = isActive ? (showBack ? 0.045 : -0.045) : 0;
    const spineScale = isMobile ? SPINE_SCALE.mobile : SPINE_SCALE.desktop;
    const scaleX = isActive ? activeScale : spineScale.x;
    const scaleY = isActive ? activeScale : spineScale.y;
    const opacity = abs > 12 ? 0 : isActive ? 1 : isMobile ? 0.35 : 0.9;

    tempVec.set(x, y, z);
    group.position.lerp(tempVec, 0.1);
    flip.rotation.y = THREE.MathUtils.lerp(flip.rotation.y, rotY, 0.1);
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, rotZ, 0.1);
    group.scale.x = THREE.MathUtils.lerp(group.scale.x, scaleX, 0.1);
    group.scale.y = THREE.MathUtils.lerp(group.scale.y, scaleY, 0.1);
    mainMatRef.current.opacity = THREE.MathUtils.lerp(
      mainMatRef.current.opacity,
      opacity,
      0.1
    );

    // The back card sits behind the front; hide it while the cassette faces away.
    if (stackRef.current) stackRef.current.visible = Math.cos(flip.rotation.y) > 0;
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
    tl.to(stackRef.current.position, { x: 0.08, y: -0.08, z: -0.065, duration: 0.65, ease: "power4.out" }, 0);
    tl.to(stackRef.current.rotation, { z: 0.025, duration: 0.65, ease: "power4.out" }, 0);
    tl.to(stackMatRef.current, { opacity: 0.82, duration: 0.45, ease: "power2.out" }, 0.08);
  }, [isCurrentActive]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isDraggingRef.current || hasMovedRef.current) return;
    if (virtualIndex === activeIndex) {
      // desktop flips on hover; touch flips on tap
      if (isMobile) setFlipped((f) => !f);
      return;
    }
    setActiveIndex(virtualIndex);
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Hover target that does not rotate, so the flip can't move the card out from under the pointer. */}
      {isCurrentActive && (
        <mesh
          position={[0, 0, 0.06]}
          onPointerOver={() => { if (!isMobile && !isDraggingRef.current) setFlipped(true); }}
          onPointerOut={() => { if (!isMobile) setFlipped(false); }}
        >
          <planeGeometry args={frontSize} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <group ref={flipRef}>
        {isCurrentActive && (
          <mesh ref={stackRef} raycast={() => null}>
            <planeGeometry args={backSize} />
            <meshBasicMaterial ref={stackMatRef} map={backTexture} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        )}

        <group>
          {!isCurrentActive && (
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[0.75, 1.95]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          )}

          <mesh>
            <planeGeometry
              args={isCurrentActive
                ? frontSize
                : [spinePlaneWidth(isMobile ? SPINE_SCALE.mobile : SPINE_SCALE.desktop), POSTER_H]}
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
          <mesh position={[0, 0, -0.035]} rotation={[0, Math.PI, 0]} raycast={() => null}>
            <planeGeometry args={backSize} />
            <meshBasicMaterial map={backTexture} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function Scene({ films, activeIndex, setActiveIndex, isMobile }: SceneProps) {
  const dragIndexRef = useRef(activeIndex);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);

  const virtualPosters = useMemo(
    () => Array.from({ length: 61 }, (_, i) => i - 30),
    []
  );

  useEffect(() => {
    gsap.to(dragIndexRef, { current: activeIndex, duration: 0.9, ease: "power4.out" });
  }, [activeIndex]);

  const snapToIndex = (index: number) => {
    const snapped = Math.round(index);
    gsap.to(dragIndexRef, {
      current: snapped,
      duration: 0.85,
      ease: "power4.out",
      onUpdate: () => setActiveIndex(Math.round(dragIndexRef.current)),
      onComplete: () => setActiveIndex(snapped),
    });
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    hasMoved.current = false;
    dragStartX.current = e.clientX;
    dragStartIndex.current = dragIndexRef.current;
    gsap.killTweensOf(dragIndexRef);
    (e.currentTarget as unknown as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    const dragStrength = isMobile ? 180 : 240;
    if (Math.abs(deltaX) > 4) hasMoved.current = true;
    dragIndexRef.current = dragStartIndex.current - deltaX / dragStrength;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as unknown as HTMLElement).releasePointerCapture?.(e.pointerId);
    snapToIndex(dragIndexRef.current);
    setTimeout(() => { hasMoved.current = false; }, 50);
  };

  const handlePointerLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    snapToIndex(dragIndexRef.current);
    setTimeout(() => { hasMoved.current = false; }, 50);
  };

  const handleWheel = (e: ThreeEvent<WheelEvent>) => {
    e.stopPropagation();
    snapToIndex(dragIndexRef.current + (e.deltaY || e.deltaX) * 0.004);
  };

  if (films.length === 0) return null;

  return (
    <>
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
            films={films}
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
