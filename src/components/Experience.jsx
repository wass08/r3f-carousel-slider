import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { Suspense } from "react";
import * as THREE from "three";
import { ImageCarousel } from "./ImageCarousel";

export const Experience = () => {
  const { scene } = useThree();

  const sampleImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop&sat=-100",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1000&fit=crop",
  ];

  const controls = useControls({
    // Carousel settings
    radius: { value: 4.5, min: 3, max: 12, step: 0.1 },

    // Image settings
    imageWidth: { value: 1.9, min: 1, max: 8, step: 0.1 },
    imageHeight: { value: 1.4, min: 1, max: 10, step: 0.1 },

    // Visual settings
    cornerRadius: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
    bendAmount: { value: 0.1, min: 0, max: 2, step: 0.05 },
    backgroundColor: "#e2e2e2",

    // Opacity settings
    centerOpacity: { value: 1.0, min: 0.1, max: 1.0, step: 0.05 },
    adjacentOpacity: { value: 0.9, min: 0.1, max: 1.0, step: 0.05 },
    farOpacity: { value: 0.8, min: 0.0, max: 1.0, step: 0.05 },

    // Physics settings
    friction: { value: 90, min: 80, max: 99, step: 1 },
    wheelSensitivity: { value: 100, min: 1, max: 500, step: 5 },
    dragSensitivity: { value: 300, min: 1, max: 1000, step: 10 },
    enableSnapping: true,
  });

  // Update scene background color
  scene.background = new THREE.Color(controls.backgroundColor);

  return (
    <>
      <Suspense
        fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="gray" />
          </mesh>
        }
      >
        <ImageCarousel
          images={sampleImages}
          radius={controls.radius}
          imageWidth={controls.imageWidth}
          imageHeight={controls.imageHeight}
          cornerRadius={controls.cornerRadius}
          bendAmount={controls.bendAmount}
          centerOpacity={controls.centerOpacity}
          adjacentOpacity={controls.adjacentOpacity}
          farOpacity={controls.farOpacity}
          friction={controls.friction / 100}
          wheelSensitivity={controls.wheelSensitivity}
          dragSensitivity={controls.dragSensitivity}
          enableSnapping={controls.enableSnapping}
        />
      </Suspense>
    </>
  );
};
