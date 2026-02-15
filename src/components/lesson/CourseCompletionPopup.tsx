// CourseCompletionPopup.tsx
// Complete component with inline styles - copy this entire file into your project

import React, { useState, useEffect } from 'react';
import { Star, Send, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CourseCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  courseData?: {
    lessons: number;
    timeSpent: string;
    score: string;
  };
  onDownloadCertificate?: () => void;
  onViewNextCourse?: () => void;
}

interface ReviewData {
  rating: number
  review: string
}

const CourseCompletionPopup: React.FC<CourseCompletionPopupProps> = ({ 
  isOpen, 
  onClose, 
  courseData = {
    lessons: 12,
    timeSpent: '2.5h',
    score: '94%'
  },
  onDownloadCertificate,
  onViewNextCourse 
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    review: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  const handleDownloadCertificate = () => {
    onDownloadCertificate?.();
  };

  const handleViewNextCourse = () => {
    onViewNextCourse?.();
  };

  const handleReviewClick = () => {
    setShowReviewForm(true);
  };

  const handleBackToCompletion = () => {
    setShowReviewForm(false);
  };

  const handleRatingClick = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewData.rating === 0 || !reviewData.review.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Reset form and go back to completion view
      setReviewData({
        rating: 0,
        review: ''
      });
      setShowReviewForm(false);
      console.log('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
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
    iconContainer: {
      marginBottom: '32px',
      position: 'relative' as const
    },
    completionIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #0d9488, #0a7c6f)',
      borderRadius: '50%',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      margin: '0 auto',
      position: 'relative' as const,
      animation: 'glow 2s ease-in-out infinite'
    },
    checkmark: {
      color: 'white',
      fontSize: '36px',
      fontWeight: '300'
    },
    sparkles: {
      position: 'absolute' as const,
      width: '100%',
      height: '100%',
      pointerEvents: 'none' as const
    },
    sparkle: {
      position: 'absolute' as const,
      width: '4px',
      height: '4px',
      background: '#0d9488',
      borderRadius: '50%',
      animation: 'sparkle 2s ease-in-out infinite'
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: isDark ? '#f9fafb' : '#202123',
      marginBottom: '12px',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '16px',
      color: isDark ? '#d1d5db' : '#6e6e80',
      marginBottom: '32px',
      lineHeight: '1.5',
      fontWeight: '400'
    },
    stats: {
      display: 'flex' as const,
      justifyContent: 'space-around',
      marginBottom: '32px',
      padding: '24px',
      background: isDark ? 'rgba(16, 163, 127, 0.1)' : 'rgba(16, 163, 127, 0.05)',
      borderRadius: '12px',
      border: isDark ? '1px solid rgba(16, 163, 127, 0.2)' : '1px solid rgba(16, 163, 127, 0.1)'
    },
    stat: {
      textAlign: 'center' as const
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#0d9488',
      display: 'block',
      marginBottom: '2px'
    },
    statLabel: {
      fontSize: '13px',
      color: isDark ? '#9ca3af' : '#8e8ea0',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    actions: {
      display: 'flex' as const,
      gap: '12px',
      justifyContent: 'center' as const
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
    btnSecondary: {
      background: 'transparent',
      color: isDark ? '#d1d5db' : '#6e6e80',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e5e5'
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
    }
  };

  // CSS animations as a style tag (since we need keyframes)
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
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(16, 163, 127, 0.3); }
      50% { box-shadow: 0 0 40px rgba(16, 163, 127, 0.5); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .btn-primary:hover {
      background: #0a7c6f !important;
      box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
    }
    .btn-secondary:hover {
      background: ${isDark ? '#4b5563' : '#f7f7f8'} !important;
      border-color: ${isDark ? '#6b7280' : '#d0d0d0'} !important;
      border-width: 1px !important;
    }
    .close-btn:hover {
      background: ${isDark ? '#374151' : '#f0f0f0'} !important;
      color: ${isDark ? '#f9fafb' : '#202123'} !important;
    }
    @media (max-width: 640px) {
      .popup-mobile {
        padding: 32px 24px !important;
        margin: 20px !important;
      }
      .title-mobile {
        font-size: 24px !important;
      }
      .actions-mobile {
        flex-direction: column !important;
      }
      .btn-mobile {
        width: 100% !important;
        justify-content: center !important;
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
      .close-btn-mobile span {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 100% !important;
        line-height: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  `;

  const sparklePositions = [
    { top: '20%', left: '20%', animationDelay: '0s' },
    { top: '30%', right: '25%', animationDelay: '0.3s' },
    { bottom: '25%', left: '30%', animationDelay: '0.6s' },
    { bottom: '20%', right: '20%', animationDelay: '0.9s' },
    { top: '50%', left: '10%', animationDelay: '1.2s' },
    { top: '50%', right: '10%', animationDelay: '1.5s' }
  ];

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
              ×
            </span>
          </button>
          
          <div style={styles.iconContainer}>
            <div style={styles.completionIcon}>
              <span style={styles.checkmark}>✓</span>
            </div>
            <div style={styles.sparkles}>
              {sparklePositions.map((pos, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.sparkle,
                    ...pos
                  }}
                />
              ))}
            </div>
          </div>
          
          {!showReviewForm ? (
            <>
              <h1 style={styles.title} className="title-mobile">
                Поздравляем!
              </h1>
              <p style={styles.subtitle}>
                Вы успешно освоили основы искусственного интеллекта. Теперь вперед – использовать знания и делиться с коллегами 💖
              </p>
              
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>{courseData.lessons}</span>
                  <span style={styles.statLabel}>Уроков</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>{courseData.timeSpent}</span>
                  <span style={styles.statLabel}>Время</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statNumber}>{courseData.score}</span>
                  <span style={styles.statLabel}>Оценка</span>
                </div>
              </div>
              
              <div style={styles.actions} className="actions-mobile">
                <button 
                  style={{...styles.btn, ...styles.btnPrimary}} 
                  className="btn-primary btn-mobile"
                  onClick={handleReviewClick}
                >
                  Похвалить / Поругать
                </button>
                <button 
                  style={{...styles.btn, ...styles.btnSecondary}} 
                  className="btn-secondary btn-mobile"
                  onClick={() => router.push('/learn')}
                >
                  На главную
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 style={styles.title} className="title-mobile">
                Поделитесь впечатлениями
              </h1>
              <p style={styles.subtitle}>
                Ваш отзыв очень поможет нам сделать курс лучше. Все отзывы непубличны и видны только команде. Спасибо!
              </p>
              
              <form onSubmit={handleReviewSubmit} style={{ textAlign: 'left' as const }}>
                {/* Rating */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: isDark ? '#f9fafb' : '#374151', 
                    marginBottom: '12px' 
                  }}>
                    Оцените курс
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '24px',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        <Star
                          style={{
                            width: '32px',
                            height: '32px',
                            color: star <= reviewData.rating ? '#eab308' : '#d1d5db',
                            fill: star <= reviewData.rating ? '#eab308' : 'none'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>



                {/* Review */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: isDark ? '#f9fafb' : '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Ваш отзыв
                  </label>
                  <textarea
                    value={reviewData.review}
                    onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                    placeholder="Что понравилось, а что не очень?"
                    required
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 0.2s ease',
                      background: isDark ? '#374151' : 'white',
                      color: isDark ? '#f9fafb' : '#374151'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0d9488';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
                    }}
                  />
                </div>


                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleBackToCompletion}
                    disabled={isSubmitting}
                    style={{
                      ...styles.btn,
                      ...styles.btnSecondary,
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
                      minWidth: '180px',
                      display: 'flex' as const,
                      alignItems: 'center' as const,
                      justifyContent: 'center' as const
                    }}
                  >
                    Вернуться назад
                  </button>
                  <button
                    type="submit"
                    disabled={reviewData.rating === 0 || !reviewData.review.trim() || isSubmitting}
                    style={{
                      ...styles.btn,
                      ...styles.btnPrimary,
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: (reviewData.rating === 0 || !reviewData.review.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                      opacity: (reviewData.rating === 0 || !reviewData.review.trim() || isSubmitting) ? 0.6 : 1,
                      display: 'flex' as const,
                      alignItems: 'center' as const,
                      gap: '8px',
                      minWidth: '160px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Отправляем...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: '16px', height: '16px' }} />
                        Отправить отзыв
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseCompletionPopup;