import React from 'react';
import { COMPARISON_CONTENT } from '../data/content';

// Helper function to process inline markdown formatting
const processInlineMarkdown = (text: string) => {
  const parts = []
  let currentIndex = 0
  
  // Process **bold** text
  const boldRegex = /\*\*(.*?)\*\*/g
  let boldMatch
  while ((boldMatch = boldRegex.exec(text)) !== null) {
    if (boldMatch.index > currentIndex) {
      parts.push(text.slice(currentIndex, boldMatch.index))
    }
    parts.push(
      <strong key={`bold-${boldMatch.index}`} className="font-bold">
        {boldMatch[1]}
      </strong>
    )
    currentIndex = boldMatch.index + boldMatch[0].length
  }
  
  // Process *italic* text
  const italicRegex = /\*(.*?)\*/g
  let italicMatch
  while ((italicMatch = italicRegex.exec(text)) !== null) {
    if (italicMatch.index > currentIndex) {
      parts.push(text.slice(currentIndex, italicMatch.index))
    }
    parts.push(
      <em key={`italic-${currentIndex}`} className="italic">
        {italicMatch[1]}
      </em>
    )
    currentIndex = italicMatch.index + italicMatch[0].length
  }
  
  // Process `code` text
  const codeRegex = /`(.*?)`/g
  let codeMatch
  while ((codeMatch = codeRegex.exec(text)) !== null) {
    if (codeMatch.index > currentIndex) {
      parts.push(text.slice(currentIndex, codeMatch.index))
    }
    parts.push(
      <code key={`code-${currentIndex}`} className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {codeMatch[1]}
      </code>
    )
    currentIndex = codeMatch.index + codeMatch[0].length
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex))
  }
  
  return parts.length > 0 ? parts : [text]
}

// Helper function to format AI response text with proper structure
const formatResponseText = (text: string) => {
  if (!text) return <div className="text-gray-500 dark:text-gray-400 italic">Ответ отсутствует</div>;
  
  return (
    <div className="prose prose-sm max-w-none">
      {text.split('\n').map((line, index) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return <div key={index} className="mb-1">&nbsp;</div>
        
        // Enhanced markdown detection
        const isHeading1 = /^#\s/.test(trimmedLine)
        const isHeading2 = /^##\s/.test(trimmedLine)
        const isHeading3 = /^###\s/.test(trimmedLine)
        const isHeading = isHeading1 || isHeading2 || isHeading3
        const isNumberedList = /^\d+\.\s/.test(trimmedLine)
        const isBulletList = /^[\•\-\*]\s/.test(trimmedLine)
        const isSubBullet = /^\s+[\•\-\*]\s/.test(trimmedLine)
        const isBold = /\*\*(.*?)\*\*/.test(trimmedLine)
        const isItalic = /\*(.*?)\*/.test(trimmedLine)
        const isCode = /`(.*?)`/.test(trimmedLine)
        
        // Special case: if line starts with bullet but contains bold text, treat as bold heading
        const isBulletWithBold = isBulletList && isBold
        
        // Determine styling and content
        let className = 'mb-2'
        let content: string | JSX.Element | (string | JSX.Element)[] = trimmedLine
        
        if (isHeading1) {
          className = 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 first:mt-0'
          content = trimmedLine.replace(/^#\s/, '')
        } else if (isHeading2) {
          className = 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 mt-5'
          content = trimmedLine.replace(/^##\s/, '')
        } else if (isHeading3) {
          className = 'text-base font-bold text-gray-900 dark:text-gray-100 mb-3 mt-4'
          content = trimmedLine.replace(/^###\s/, '')
        } else if (isBulletWithBold) {
          // Treat bullet + bold as a bold heading, remove the bullet marker and bold markers
          className = 'text-base font-bold text-gray-900 dark:text-gray-100 mb-3 mt-4'
          content = trimmedLine.replace(/^[\•\-\*]\s/, '').replace(/\*\*(.*?)\*\*/g, '$1')
        } else if (isNumberedList) {
          className = 'ml-6 mb-2 flex items-start'
          const listContent = trimmedLine.replace(/^\d+\.\s/, '')
          content = (
            <>
              <span className="text-gray-600 dark:text-gray-400 font-medium mr-2 flex-shrink-0">
                {trimmedLine.match(/^\d+\./)?.[0]}
              </span>
              <span>{processInlineMarkdown(listContent)}</span>
            </>
          )
        } else if (isBulletList) {
          className = 'ml-6 mb-2 flex items-start'
          const bulletContent = trimmedLine.replace(/^[\•\-\*]\s/, '')
          content = (
            <>
              <span className="text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0">•</span>
              <span>{processInlineMarkdown(bulletContent)}</span>
            </>
          )
        } else if (isSubBullet) {
          className = 'ml-12 mb-2 flex items-start'
          const bulletContent = trimmedLine.replace(/^\s+[\•\-\*]\s/, '')
          content = (
            <>
              <span className="text-gray-600 dark:text-gray-400 mr-2 flex-shrink-0">◦</span>
              <span>{processInlineMarkdown(bulletContent)}</span>
            </>
          )
        }
        
        // Apply inline formatting to content (only for non-list items and non-bullet-with-bold)
        if (typeof content === 'string' && !isBulletWithBold) {
          content = processInlineMarkdown(content)
        }
        
        return (
          <div key={index} className={className}>
            {content}
          </div>
        )
      })}
    </div>
  )
}

interface RoundResult {
  userPrompt: string;
  aiResponse: string;
  qualityScore: string; // Changed to string for hardcoded quality levels
  frameworkElements: string[];
}

interface ComparisonViewProps {
  rounds: Record<number, RoundResult>;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ rounds }) => {
  const getQualityLabel = (score: string) => {
    return score; // Return the quality string directly
  };
  
  const getQualityColor = (score: string) => {
    switch (score) {
      case 'Не очень': return 'red';
      case 'Лучше': return 'yellow';
      case 'Хорошее': return 'blue';
      case 'Супер!': return 'green';
      default: return 'gray';
    }
  };
  
  const getReadinessLabel = (round: number) => {
    const level = COMPARISON_CONTENT.readinessLevels[round as keyof typeof COMPARISON_CONTENT.readinessLevels];
    return level ? level.label : 'Неизвестно';
  };
  
  const getReadinessColor = (round: number) => {
    const level = COMPARISON_CONTENT.readinessLevels[round as keyof typeof COMPARISON_CONTENT.readinessLevels];
    return level ? level.color : 'gray';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {COMPARISON_CONTENT.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{COMPARISON_CONTENT.subtitle}</p>
      
      {/* Table view */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                {COMPARISON_CONTENT.headers.round}
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                {COMPARISON_CONTENT.headers.promptQuality}
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                {COMPARISON_CONTENT.headers.outputQuality}
              </th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                {COMPARISON_CONTENT.headers.executiveReadiness}
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((roundNum) => {
              const roundData = rounds[roundNum];
              if (!roundData) return null;
              
              return (
                <tr key={roundNum} className="bg-white dark:bg-gray-800">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                    {roundNum}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border bg-muted/60 ${
                      getQualityColor(roundData.qualityScore) === 'red' ? 'border-red-400/70 text-red-700 dark:text-red-300' :
                      getQualityColor(roundData.qualityScore) === 'yellow' ? 'border-amber-400/70 text-amber-700 dark:text-amber-300' :
                      getQualityColor(roundData.qualityScore) === 'blue' ? 'border-sky-400/70 text-sky-700 dark:text-sky-300' :
                      getQualityColor(roundData.qualityScore) === 'green' ? 'border-emerald-400/70 text-emerald-700 dark:text-emerald-300' :
                      'border-border/60 text-muted-foreground'
                    }`}>
                      {getQualityLabel(roundData.qualityScore)}
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border bg-muted/60 ${
                      getQualityColor(roundData.qualityScore) === 'red' ? 'border-red-400/70 text-red-700 dark:text-red-300' :
                      getQualityColor(roundData.qualityScore) === 'yellow' ? 'border-amber-400/70 text-amber-700 dark:text-amber-300' :
                      getQualityColor(roundData.qualityScore) === 'blue' ? 'border-sky-400/70 text-sky-700 dark:text-sky-300' :
                      getQualityColor(roundData.qualityScore) === 'green' ? 'border-emerald-400/70 text-emerald-700 dark:text-emerald-300' :
                      'border-border/60 text-muted-foreground'
                    }`}>
                      {getQualityLabel(roundData.qualityScore)}
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border bg-muted/60 ${
                      getReadinessColor(roundNum) === 'red' ? 'border-red-400/70 text-red-700 dark:text-red-300' :
                      getReadinessColor(roundNum) === 'yellow' ? 'border-amber-400/70 text-amber-700 dark:text-amber-300' :
                      getReadinessColor(roundNum) === 'blue' ? 'border-sky-400/70 text-sky-700 dark:text-sky-300' :
                      getReadinessColor(roundNum) === 'green' ? 'border-emerald-400/70 text-emerald-700 dark:text-emerald-300' :
                      'border-border/60 text-muted-foreground'
                    }`}>
                      {getReadinessLabel(roundNum)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Detailed responses */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((roundNum) => {
          const roundData = rounds[roundNum];
          if (!roundData) return null;
          
          return (
            <div key={roundNum} className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Раунд {roundNum} - {getQualityLabel(roundData.qualityScore)}
              </h3>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Промпт:</h4>
                <div className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded text-sm font-mono">
                  {roundData.userPrompt || 'Промпт отсутствует'}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ответ ИИ:</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {formatResponseText(roundData.aiResponse)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonView;
