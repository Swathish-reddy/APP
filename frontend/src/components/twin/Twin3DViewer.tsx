"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Cylinder, Capsule, ContactShadows, Float, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { TwinState } from "@/types";

interface Twin3DViewerProps {
  twinState: TwinState | null;
  selectedOrgan: string | null;
  onSelectOrgan: (organ: string) => void;
}

interface OrganNodeProps {
  position: [number, number, number];
  color: string;
  name: string;
  isSelected: boolean;
  onClick: (organ: string) => void;
  scale?: number;
  shape?: "sphere" | "box" | "cylinder";
}

const OrganNode = ({
  position,
  color,
  name,
  isSelected,
  onClick,
  scale = 1,
  shape = "sphere",
}: OrganNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;

      if (isSelected) {
        meshRef.current.rotation.y += 0.05;
        meshRef.current.rotation.x += 0.02;
      }
    }
  });

  const material = new THREE.MeshPhysicalMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: isSelected ? 1.5 : 0.8,
    roughness: 0.1,
    metalness: 0.3,
    transmission: 0.2,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: isSelected ? 1 : 0.9,
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick(name);
      }}
      // Change cursor on hover
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {shape === "sphere" && (
        <Sphere
          ref={meshRef as React.Ref<THREE.Mesh>}
          args={[0.3 * scale, 32, 32]}
          material={material}
        />
      )}
      {shape === "box" && (
        <Box
          ref={meshRef as React.Ref<THREE.Mesh>}
          args={[0.5 * scale, 0.5 * scale, 0.5 * scale]}
          material={material}
        />
      )}
      {shape === "cylinder" && (
        <Cylinder
          ref={meshRef as React.Ref<THREE.Mesh>}
          args={[0.2 * scale, 0.2 * scale, 0.6 * scale, 32]}
          material={material}
        />
      )}
      
      {isSelected && (
        <Sphere args={[0.4 * scale, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

const HumanoidBody = () => {
  const { scene } = useGLTF("/human_body.glb");
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  // Bright cyan holographic glass material
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: "#0ea5e9", // Bright cyan
    emissive: "#0369a1", // Deep blue glow
    emissiveIntensity: 0.5,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.9, 
    thickness: 1.0,
    ior: 1.5,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.7,
    wireframe: false,
  });

  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = bodyMaterial;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [clonedScene, bodyMaterial]);

  return (
    <group position={[0, 0, 0]}>
      <Center scale={3.5} top>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
};
useGLTF.preload("/human_body.glb");

export default function Twin3DViewer({
  twinState,
  selectedOrgan,
  onSelectOrgan,
}: Twin3DViewerProps) {
  const getColor = (score: number | undefined) => {
    if (score === undefined || score === null) return "#334155"; // Slate for no data
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Yellow
    if (score >= 40) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <div className="w-full h-[500px] bg-background/80 rounded-2xl overflow-hidden border border-border relative shadow-inner">
      <div className="dark absolute top-4 left-4 z-10 bg-card/80 p-3 rounded-lg border border-border backdrop-blur-sm">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Organ Status Legend
        </h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>{" "}
            Optimal (80-100)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>{" "}
            Mild Risk (60-79)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></div>{" "}
            Moderate Risk (40-59)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>{" "}
            Critical (&lt;40)
          </div>
        </div>
      </div>
      
      <Canvas camera={{ position: [0, 2, 10], fov: 40 }} shadows>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={1.5} />
        
        

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={!selectedOrgan}
          autoRotateSpeed={0.8}
          target={[0, 1, 0]}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* We scale the whole group up and move it down so the humanoid fits the screen */}
          <group position={[0, -5, 0]} scale={1.8}>
            
            <HumanoidBody />

            {/* The Internal Organs positioned to match the inner chest cavity of the GLB */}
            {/* The GLB is centered, so Y=0 is the center of the body. We need to position organs relatively. */}
            {/* Assuming GLB height is ~4 units after scaling by 1.8, head is at ~+2, chest at ~+0.8, abdomen at ~-0.2 */}
            <group position={[0, 0, 0]}>
              <OrganNode
                name="Brain"
                position={[0, 3.2, 0]}
                shape="sphere"
                scale={0.8}
                color={getColor(twinState?.brain_health)}
                isSelected={selectedOrgan === "Brain"}
                onClick={onSelectOrgan}
              />
              
              <OrganNode
                name="Heart"
                position={[-0.3, 1.4, 0.2]}
                shape="sphere"
                scale={0.7}
                color={getColor(twinState?.cardiac_health)}
                isSelected={selectedOrgan === "Heart"}
                onClick={onSelectOrgan}
              />
              
              {/* Lungs (Left & Right) */}
              <OrganNode
                name="Lungs"
                position={[0.5, 1.4, 0]}
                shape="cylinder"
                scale={0.9}
                color={getColor(twinState?.lung_health)}
                isSelected={selectedOrgan === "Lungs"}
                onClick={onSelectOrgan}
              />
              <OrganNode
                name="Lungs"
                position={[-0.8, 1.4, 0]}
                shape="cylinder"
                scale={0.9}
                color={getColor(twinState?.lung_health)}
                isSelected={selectedOrgan === "Lungs"}
                onClick={onSelectOrgan}
              />
          
          <OrganNode
            name="Liver"
            position={[0.4, 0.8, 0.2]}
            shape="box"
            scale={0.9}
            color={getColor(twinState?.liver_health)}
            isSelected={selectedOrgan === "Liver"}
            onClick={onSelectOrgan}
          />
          
          {/* Kidneys (Left & Right) */}
          <OrganNode
            name="Kidneys"
            position={[0.3, 0.5, -0.2]}
            shape="sphere"
            scale={0.5}
            color={getColor(twinState?.renal_health)}
            isSelected={selectedOrgan === "Kidneys"}
            onClick={onSelectOrgan}
          />
          <OrganNode
            name="Kidneys"
            position={[-0.3, 0.5, -0.2]}
            shape="sphere"
            scale={0.5}
            color={getColor(twinState?.renal_health)}
            isSelected={selectedOrgan === "Kidneys"}
            onClick={onSelectOrgan}
          />
          
          <OrganNode
            name="Metabolic"
            position={[0, 0.2, 0.2]}
            shape="box"
            scale={0.7}
            color={getColor(twinState?.metabolic_health)}
            isSelected={selectedOrgan === "Metabolic"}
            onClick={onSelectOrgan}
          />
        </group>
      </group>
    </Float>

        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.7}
          scale={15}
          blur={2}
          far={10}
        />
      </Canvas>
    </div>
  );
}
