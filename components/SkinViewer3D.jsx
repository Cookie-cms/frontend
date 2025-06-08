"use client";

import { useEffect, useRef, useState } from "react";

const SkinViewer3D = ({ 
  skinUrl = "", 
  capeUrl = null,
  width = 300,
  height = 400
}) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // console.log("SkinViewer3D mounted with skinUrl:", skinUrl);
    
    // Предотвращаем повторную инициализацию
    if (viewerRef.current) {
      // Если viewer уже существует, обновляем URL скина и плаща
      try {
        if (skinUrl) {
          viewerRef.current.loadSkin(skinUrl)
            .catch(err => {
              console.warn("Ошибка при загрузке скина:", err);
              // Не прерываем выполнение, просто логируем ошибку
            });
        }
        
        if (capeUrl) {
          viewerRef.current.loadCape(capeUrl)
            .catch(err => {
              console.warn("Ошибка при загрузке плаща:", err);
              // Не прерываем выполнение, просто логируем ошибку
            });
        } else {
          // Если capeUrl отсутствует, снимаем плащ
          viewerRef.current.loadCape(null);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Ошибка при обновлении модели:", err);
        setError(err.message);
        setIsLoading(false);
      }
      return;
    }
    
    // Создаем новый viewer только если его еще нет
    if (containerRef.current && !viewerRef.current) {
      setIsLoading(true);
      setError(null);
      
      // Динамический импорт skinview3d для работы на стороне клиента
      import("skinview3d").then((skinview3d) => {
        try {
          if (!containerRef.current) return; // На случай, если компонент размонтирован
          
          // Очищаем container перед созданием нового viewer
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
          
          // Создаем новый canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          containerRef.current.appendChild(canvas);
          
          // Инициализируем viewer
          const skinViewer = new skinview3d.SkinViewer({
            canvas: canvas,
            width: width,
            height: height,
            skin: skinUrl || undefined
          });
          
          // Настройка камеры
          // skinViewer.camera.position.x = 15;
          // skinViewer.camera.position.y = 0;
          skinViewer.camera.position.z = 60;
          skinViewer.autoRotate = false;
          skinViewer.autoRotateSpeed = 1;
          
          // Добавляем анимацию ходьбы
          const animation = new skinview3d.IdleAnimation();
          animation.speed = 0.6;
          skinViewer.animation = animation;
          
          // Загружаем скин
          if (skinUrl) {
            skinViewer.loadSkin(skinUrl)
              .catch(err => {
                console.warn("Ошибка при загрузке скина:", err);
                // Не прерываем выполнение, просто логируем ошибку
                // Загружаем стандартный скин Стива при ошибке
                skinViewer.loadSkin("https://assets.mojang.com/SkinTemplates/steve.png")
                  .catch(e => console.error("Ошибка при загрузке стандартного скина:", e));
              });
          }
          
          // Загружаем плащ если есть
          if (capeUrl) {
            skinViewer.loadCape(capeUrl)
              .catch(err => {
                console.warn("Ошибка при загрузке плаща:", err);
                // Не прерываем выполнение, просто логируем ошибку
              });
          }
          
          // Сохраняем ссылку на viewer
          viewerRef.current = skinViewer;
          setIsLoading(false);
        } catch (err) {
          console.error("Ошибка при создании viewer:", err);
          setError(err.message);
          setIsLoading(false);
        }
      }).catch(err => {
        console.error("Ошибка при загрузке библиотеки skinview3d:", err);
        setError(err.message);
        setIsLoading(false);
      });
    }
    
    // Очистка при размонтировании
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, [skinUrl, capeUrl, width, height]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-red-500 text-center p-2 text-sm">
            Error loading model
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinViewer3D;