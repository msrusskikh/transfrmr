import React from 'react';
import { ROUNDS_CONTENT, FRAMEWORK_ELEMENTS } from '../data/content';

interface RoundGuidanceProps {
  currentRound: number;
  detectedElements: string[];
}

const RoundGuidance: React.FC<RoundGuidanceProps> = ({ 
  currentRound, 
  detectedElements 
}) => {
  const roundData = ROUNDS_CONTENT[currentRound as keyof typeof ROUNDS_CONTENT];
  
  if (!roundData) return null;
  
  // Type guard to check if frameworkElements exists
  const hasFrameworkElements = 'frameworkElements' in roundData && Array.isArray(roundData.frameworkElements);
  const frameworkElements = hasFrameworkElements ? roundData.frameworkElements : [];
  
  return (
    <div className="rounded-lg p-6 border border-border/60 bg-card/60">
      <h3 className="text-lg font-semibold text-foreground mb-3">
        {roundData.title}
      </h3>
      
      <p className="text-muted-foreground mb-4">
        {roundData.description}
      </p>
      
      {/* Starter prompt for Round 1 */}
      {currentRound === 1 && 'starterPrompt' in roundData && roundData.starterPrompt && (
        <div className="bg-card dark:bg-gray-900/60 p-4 rounded border border-border/60 mb-4">
          <h4 className="font-medium text-foreground mb-2">Промпт:</h4>
          <code className="text-sm bg-muted/70 dark:bg-gray-800 text-foreground px-2 py-1 rounded">
            {roundData.starterPrompt}
          </code>
        </div>
      )}
      
      {/* Framework Elements Checklist */}
      {frameworkElements.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-3 text-base">
            Элементы фреймворка для этого раунда:
          </h4>
          <div className="bg-card dark:bg-gray-900/60 rounded-lg border border-border/60 p-4">
            <div className="grid grid-cols-1 gap-3">
              {frameworkElements.map((elementKey) => {
                const element = FRAMEWORK_ELEMENTS[elementKey as keyof typeof FRAMEWORK_ELEMENTS];
                if (!element) return null;
                
                const isPresent = detectedElements.includes(elementKey);
                
                return (
                  <div 
                    key={elementKey}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      isPresent
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                        : 'bg-muted/60 dark:bg-gray-800/80 border-border/60 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{element.icon}</span>
                      <span className="font-medium">{element.name}</span>
                      <span className="text-xs">
                        {isPresent ? '✓' : '○'}
                      </span>
                    </div>
                    <p className="text-xs ml-7 text-gray-600 dark:text-gray-400">
                      {element.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      

      
      {/* Examples */}
      {'examples' in roundData && roundData.examples && roundData.examples.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-3 text-base">
            Примеры:
          </h4>
          <div className="bg-card dark:bg-gray-900/60 rounded-lg border border-border/60 p-4">
            <div className="space-y-3">
              {roundData.examples.map((example, index) => (
                <div key={index} className="px-3 py-2 rounded-md text-sm bg-muted/60 dark:bg-gray-800/80 border border-border/60">
                  <code className="text-foreground">{example}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Expected output */}
      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-3 text-base">
          Ожидаемый результат:
        </h4>
        <div className="bg-card dark:bg-gray-900/60 rounded-lg border border-border/60 p-4">
          <p className="text-sm text-muted-foreground">{roundData.expectedOutput}</p>
        </div>
      </div>
    </div>
  );
};

export default RoundGuidance;
