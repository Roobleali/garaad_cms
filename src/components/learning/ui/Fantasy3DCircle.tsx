// Fantasy3DCircle.tsx
import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

interface Fantasy3DCircleProps {
    count?: number;
    radius?: number;
    size?: number;
    color?: string;
    speed?: number;
}

const Fantasy3DCircle = memo(({
    count = 2000,
    radius = 2,
    size = 0.02,
    color = "#ffffff",
    speed = 0.1
}: Fantasy3DCircleProps) => {
    const points = useRef<THREE.Points>(null!);

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * 0.2;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        return positions;
    }, [count, radius]);

    useFrame((state) => {
        if (points.current) {
            points.current.rotation.z += speed * 0.01;
        }
    });

    return (
        <Points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <PointMaterial
                transparent
                size={size}
                sizeAttenuation={true}
                depthWrite={false}
                color={color}
            />
        </Points>
    );
});

Fantasy3DCircle.displayName = "Fantasy3DCircle";

export default Fantasy3DCircle; 