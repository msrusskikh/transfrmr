// WelcomePopup.tsx
// Welcome popup component with 4 screens - shown on first login to /learn

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const welcomeScreens = [
  {
    title: 'Добро пожаловать!',
    content: 'Искусственный интеллект — это не магия, а инструмент вроде Excel или поиска. Стоит начать пользоваться, и всё станет очевидным.\n\nМы не даем списки инструкций. Мы учим думать об ИИ: как он устроен, в чем его сила, а где он беспомощен. Наша цель — ваш фундамент, а не просто лайфхаки.',
    image: '/welcome-hands.png', // Image for first screen
  },
  {
    title: 'Как учиться?',
    content: (
      <>
        <strong>Ваш ориентир:</strong> Фиолетовая кнопка «Play» вверху. Просто нажимайте её, чтобы перейти к следующему уроку.{'\n\n'}
        <strong>В закладки:</strong> Добавьте сайт в браузер — в поиске нас пока найти непросто.
      </>
    ),
    image: '/welcome-learn.png',
  },
  {
    title: 'Пара технических моментов',
    content: (
      <>
        Все уроки адаптированы под телефон, но лабораторные работы (их 3, в конце первых трёх модулей) удобнее проходить на компьютере или планшете.{'\n\n'}

        <strong>Важно:</strong> Для лабораторных нужен VPN – мы отправляем запросы в OpenAI, без VPN это не работает.
      </>
    ),
    image: '/welcome-devices.png',
  },
  {
    title: 'Это бета-версия курса',
    content: 'Что-то может глючить или быть непонятным. Если столкнулись с проблемой или есть идея – нажмите «Проблема или предложение» внизу слева. Мы всё починим 💕',
    image: '/welcome-feedback.png',
  },
];

const WelcomePopup: React.FC<WelcomePopupProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [imageOpacity, setImageOpacity] = useState(1);

  // Preload all images when popup opens
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentScreen(0);
      
      // Preload all images
      const imagePaths = welcomeScreens
        .map(screen => screen.image)
        .filter(Boolean) as string[];
      
      imagePaths.forEach((imagePath) => {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => new Set(prev).add(imagePath));
        };
        img.src = imagePath;
      });
    }
  }, [isOpen]);

  // Handle image transition when screen changes
  useEffect(() => {
    const currentImage = welcomeScreens[currentScreen]?.image;
    if (currentImage) {
      if (imagesLoaded.has(currentImage)) {
        // Image is already preloaded, show immediately with no fade
        setImageOpacity(1);
      } else {
        // Image not yet loaded, fade out briefly then fade in when ready
        setImageOpacity(0);
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => new Set(prev).add(currentImage));
          // Small delay to ensure smooth transition
          requestAnimationFrame(() => {
            setImageOpacity(1);
          });
        };
        img.src = currentImage;
      }
    } else {
      // No image for this screen
      setImageOpacity(1);
    }
  }, [currentScreen, imagesLoaded]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  const handleNext = () => {
    if (currentScreen < welcomeScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  // Dynamic styles based on theme
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  
  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      animation: isVisible ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.2s ease-out'
    },
    popup: {
      background: isDark ? '#1f2937' : 'white',
      borderRadius: '16px',
      padding: '48px',
      maxWidth: '480px',
      width: '90%',
      boxShadow: isDark ? '0 25px 50px rgba(0, 0, 0, 0.4)' : '0 25px 50px rgba(0, 0, 0, 0.15)',
      textAlign: 'center' as const,
      position: 'relative' as const,
      animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      overflow: 'hidden' as const,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      border: isDark ? '1px solid #374151' : 'none'
    },
    imageContainer: {
      marginBottom: '12px',
      marginTop: '0',
      position: 'relative' as const,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: '100%',
      minHeight: 'auto'
    },
    imageWrapper: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '400px',
      height: 'auto',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    image: {
      width: '100%',
      height: 'auto',
      maxWidth: '400px',
      objectFit: 'contain' as const,
      transition: 'opacity 0.2s ease-in-out',
    },
    placeholderIcon: {
      width: '64px',
      height: '64px',
      color: '#0d9488',
      opacity: 0.6
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: isDark ? '#f9fafb' : '#202123',
      marginBottom: '16px',
      letterSpacing: '-0.02em',
      textAlign: 'left' as const
    },
    content: {
      fontSize: '16px',
      color: isDark ? '#d1d5db' : '#6e6e80',
      marginBottom: '32px',
      lineHeight: '1.6',
      fontWeight: '400',
      textAlign: 'left' as const,
      whiteSpace: 'pre-line' as const
    },
    contentStrong: {
      fontWeight: '600' as const
    },
    bottomSection: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      gap: '12px'
    },
    actions: {
      display: 'flex' as const,
      gap: '12px',
      justifyContent: 'flex-end' as const
    },
    btn: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      textDecoration: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      gap: '8px'
    },
    btnPrimary: {
      background: '#0d9488',
      color: 'white'
    },
    closeBtn: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: isDark ? '#9ca3af' : '#8e8ea0',
      cursor: 'pointer',
      fontSize: '24px',
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      transition: 'all 0.2s ease',
      minWidth: '48px',
      minHeight: '48px',
      touchAction: 'manipulation' as const,
      WebkitTouchCallout: 'none' as const,
      WebkitUserSelect: 'none' as const,
      userSelect: 'none' as const,
      lineHeight: '1',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box' as const
    },
    dots: {
      display: 'flex' as const,
      gap: '8px',
      justifyContent: 'flex-start' as const
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    dotActive: {
      background: '#0d9488',
      transform: 'scale(1.2)'
    },
    dotInactive: {
      background: isDark ? '#4b5563' : '#d1d5db'
    }
  };

  // CSS animations as a style tag
  const animations = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .btn-primary:hover {
      background: #0a7c6f !important;
      box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
    }
    .close-btn:hover {
      background: ${isDark ? '#374151' : '#f0f0f0'} !important;
      color: ${isDark ? '#f9fafb' : '#202123'} !important;
    }
    .popup-mobile strong {
      font-weight: 600;
      color: ${isDark ? '#f9fafb' : '#202123'};
    }
    @media (max-width: 640px) {
      .popup-mobile {
        padding: 32px 24px !important;
        margin: 20px !important;
      }
      .title-mobile {
        font-size: 24px !important;
      }
      .close-btn-mobile {
        width: 56px !important;
        height: 56px !important;
        min-width: 56px !important;
        min-height: 56px !important;
        top: 8px !important;
        right: 8px !important;
        font-size: 28px !important;
        background: rgba(0, 0, 0, 0.05) !important;
        border-radius: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }
      .close-btn-mobile:hover {
        background: rgba(0, 0, 0, 0.1) !important;
      }
      .close-btn-mobile:active {
        background: rgba(0, 0, 0, 0.15) !important;
        transform: scale(0.95) !important;
      }
      .image-wrapper-mobile {
        max-width: 320px !important;
      }
      .image-wrapper-mobile img {
        max-width: 100% !important;
        height: auto !important;
      }
    }
  `;

  const currentScreenData = welcomeScreens[currentScreen];
  const isLastScreen = currentScreen === welcomeScreens.length - 1;

  return (
    <>
      <style>{animations}</style>
      <div 
        style={styles.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div 
          style={styles.popup} 
          className="popup-mobile"
        >
          <button 
            style={styles.closeBtn} 
            className="close-btn close-btn-mobile"
            onClick={handleClose}
            aria-label="Закрыть"
            title="Закрыть"
          >
            <span style={{ 
              display: 'flex' as const, 
              alignItems: 'center' as const, 
              justifyContent: 'center' as const,
              width: '100%',
              height: '100%',
              lineHeight: '1'
            }}>
              <X size={20} />
            </span>
          </button>
          
          {currentScreenData.image ? (
            <div style={styles.imageContainer}>
              <div style={styles.imageWrapper} className="image-wrapper-mobile">
                <img
                  src={currentScreenData.image}
                  alt=""
                  style={{
                    ...styles.image,
                    opacity: imageOpacity
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={styles.imageContainer}>
              <Sparkles 
                style={styles.placeholderIcon}
                strokeWidth={1.5}
              />
            </div>
          )}
          
          <h1 style={styles.title} className="title-mobile">
            {currentScreenData.title}
          </h1>
          <p style={styles.content}>
            {currentScreenData.content}
          </p>
          
          <div style={styles.bottomSection}>
            <div style={styles.dots}>
              {welcomeScreens.map((_, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.dot,
                    ...(index === currentScreen ? styles.dotActive : styles.dotInactive)
                  }}
                  onClick={() => setCurrentScreen(index)}
                />
              ))}
            </div>
            <div style={styles.actions}>
              <button 
                style={{...styles.btn, ...styles.btnPrimary}} 
                className="btn-primary"
                onClick={handleNext}
              >
                {isLastScreen ? 'Поехали!' : 'Далее'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePopup;
