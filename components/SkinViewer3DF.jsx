"use client";

import { useEffect, useRef, useState } from "react";

// SkinViewer3DF component - renders a static (frozen) image of the skin
export default function SkinViewer3DF({
  skinUrl = "",
  capeUrl = null,
  width = 280,
  height = 350,
  zoom = 0.8,
  backEquipment = "cape",
  pose = "default" // can be 'default', 'walking', 'running', etc.
}) {
  const [renderedImage, setRenderedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const renderAttempted = useRef(false);

  useEffect(() => {
    // Skip if already rendered or no skinUrl provided
    if (renderAttempted.current || !skinUrl) return;
    
    renderAttempted.current = true;
    setLoading(true);
    setError(null);
    
    // Function to render the skin
    const renderSkin = async () => {
      try {
        // Import skinview3d library
        const skinview3d = await import('skinview3d');
        
        // Create a temporary canvas element for rendering
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Create and configure the skin viewer
        const skinViewer = new skinview3d.SkinViewer({
          canvas: tempCanvas,
          width: width,
          height: height,
          renderPaused: true // Freeze rendering
        });
        
        // Configure camera position for a nice view
        skinViewer.camera.rotation.x = -0.62;
        skinViewer.camera.rotation.y = 0.534;
        skinViewer.camera.rotation.z = 0.348;
        skinViewer.camera.position.x = 30.5;
        skinViewer.camera.position.y = 30.0;
        skinViewer.camera.position.z = 42.0;
        
        // Set zoom level
        skinViewer.zoom = zoom;
        
        // Apply specified pose if needed
        if (pose === "walking") {
          const animation = new skinview3d.WalkingAnimation();
          animation.speed = 0; // Set speed to 0 to freeze at a specific frame
          animation.progress = 0.5; // Set animation progress (0 to 1)
          skinViewer.animation = animation;
        }
        
        // Load skin and cape if provided
        await Promise.all([
          skinViewer.loadSkin(skinUrl),
          capeUrl ? skinViewer.loadCape(capeUrl, { backEquipment }) : Promise.resolve()
        ]);
        
        // Render a single frame
        skinViewer.render();
        
        // Get image data URL
        const imageDataUrl = tempCanvas.toDataURL('image/png');
        setRenderedImage(imageDataUrl);
        
        // Dispose of the viewer to free resources
        skinViewer.dispose();
        setLoading(false);
      } catch (err) {
        console.error("Error rendering skin:", err);
        setError("Failed to render skin");
        setLoading(false);
      }
    };
    
    renderSkin();
    
  }, [skinUrl, capeUrl, width, height, zoom, backEquipment, pose]);

  // Show loading state
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className="flex items-center justify-center"
        style={{ width: '100%', height }}
      >
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div 
        ref={containerRef}
        className="flex items-center justify-center"
        style={{ width: '100%', height }}
      >
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Show rendered image с центрированием на странице
  return renderedImage ? (
    <div className="flex items-center justify-center">
      <img
        src={renderedImage}
        alt="Minecraft Skin"
        className="rounded-lg mx-auto"
        width={width}
        height={height}
      />
    </div>
  ) : null;
}