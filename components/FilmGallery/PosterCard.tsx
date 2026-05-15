import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Film } from './data';

interface PosterCardProps {
  film: Film;
  index: number;
  activeIndex: number;
  total: number;
  onClick: () => void;
  isMobile: boolean;
}

export function PosterCard({ film, index, activeIndex, total, onClick, isMobile }: PosterCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false); 
  
  // Use texture loader for better reliability
  const texture = useLoader(THREE.TextureLoader, film.image);
  
  const isActive = index === activeIndex;
  const offset = index - activeIndex;
  
  useFrame((state) => {
    if (!meshRef.current) return;
    if (isActive) {
      // Gentle floating animation
      meshRef.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;

    const ctx = gsap.context(() => {
      // Position and Rotation
      gsap.to(meshRef.current!.position, {
        x: isActive ? 0 : offset * (isMobile ? 0.3 : 0.38),
        z: isActive ? 1.2 : 0,
        duration: 1.2,
        ease: 'power4.out'
      });

      gsap.to(meshRef.current!.rotation, {
        y: isActive ? 0 : offset * -0.1,
        duration: 1.2,
        ease: 'power4.out'
      });

      // Scale: Narrow for spine, Wide for active box
      gsap.to(meshRef.current!.scale, {
        x: isActive ? (isMobile ? 1.0 : 1.2) : 0.12, 
        y: isActive ? (isMobile ? 1.0 : 1.2) : 1.0,
        duration: 1.2,
        ease: 'power4.out'
      });
    });

    return () => ctx.revert();
  }, [activeIndex, index, offset, isActive, isMobile]);

  return (
    <group 
      ref={meshRef} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          opacity={isActive ? 1 : 0.8}
          color={isActive ? "#fff" : "#888"}
        />
      </mesh>
      
      {/* Glow effect for active poster */}
      {isActive && (
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.2, 3.2]} />
          <meshBasicMaterial color="#ff2a1f" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Decorative Border for Active */}
      {isActive && (
        <lineSegments position={[0, 0, 0.01]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(2, 3)]} />
          <lineBasicMaterial color="#ff2a1f" linewidth={2} />
        </lineSegments>
      )}

      {/* Top Metadata labels like festival UI */}
      {isActive && (
        <group position={[0, 1.8, 0.1]}>
          <Text
            fontSize={0.06}
            color="#ff2a1f"
            anchorX="center"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.ttf"
          >
            ALL / すべて // SYSTEM: NTSC
          </Text>
        </group>
      )}
    </group>
  );
}
