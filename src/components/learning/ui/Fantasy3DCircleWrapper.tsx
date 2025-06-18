import { Canvas } from "@react-three/fiber";
import Fantasy3DCircle from "./Fantasy3DCircle";

interface Fantasy3DCircleWrapperProps {
    className?: string;
    count?: number;
    radius?: number;
    size?: number;
    color?: string;
    speed?: number;
}

const Fantasy3DCircleWrapper = ({
    className = "",
    count,
    radius,
    size,
    color,
    speed
}: Fantasy3DCircleWrapperProps) => {
    return (
        <div className={`w-full h-full min-h-[200px] ${className}`}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <Fantasy3DCircle
                    count={count}
                    radius={radius}
                    size={size}
                    color={color}
                    speed={speed}
                />
            </Canvas>
        </div>
    );
};

export default Fantasy3DCircleWrapper; 