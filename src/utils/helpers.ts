/**
 * Enhanced Skill Bar Generation Utilities
 * Complete redesign with modern terminal aesthetics
 */

import type { 
  SkillLevel, 
  SkillBarConfig, 
  SkillBarStyle,
  ProgressSegment, 
  EnhancedSkillBar,
  SkillMetadata 
} from '@/types';
import { ASCII_CHARS } from '@/utils/constants';

/**
 * Generate enhanced skill bar configuration with multiple visual styles
 */
export const generateSkillBarConfig = (
  level: SkillLevel, 
  style: SkillBarStyle = 'terminal',
  skillName?: string,
  skillData?: any
): SkillBarConfig => {
  const percentage = skillLevelToPercentage(level);
  
  switch (style) {
    case 'terminal':
      return generateTerminalStyleBar(level, percentage, skillName, skillData);
    case 'matrix':
      return generateMatrixStyleBar(level, percentage, skillName);
    case 'execution':
      return generateExecutionStyleBar(level, percentage, skillName, skillData);
    case 'meter':
      return generateMeterStyleBar(level, percentage, skillName, skillData);
    case 'classic':
    default:
      return generateClassicStyleBar(level, percentage);
  }
};

/**
 * Modern minimalist skill bar
 * Clean, simple, elegant design
 */
const generateTerminalStyleBar = (
  level: SkillLevel, 
  percentage: number, 
  skillName?: string,
  skillData?: any
): SkillBarConfig => {
  // Create a sleek modern bar design
  const html = `
    <div class="modern-skill-bar">
      <div class="skill-header">
        <span class="skill-percentage">${percentage}%</span>
        <span class="skill-level">${level}</span>
      </div>
      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${percentage}%">
            <span class="progress-glow"></span>
          </div>
        </div>
      </div>
      <div class="skill-meta-info">
        ${skillData?.years ? `<span class="meta-item">${skillData.years}</span>` : ''}
        ${skillData?.projects ? `<span class="meta-item">${skillData.projects}</span>` : ''}
        ${skillData?.highlight ? `<span class="meta-highlight">${skillData.highlight}</span>` : ''}
      </div>
    </div>
  `;

  return {
    level,
    style: 'terminal',
    bar: `${percentage}%`,
    html,
    percentage,
    animated: true,
    interactive: true
  };
};

/**
 * Matrix loading style skill bar
 * LOADING: Flutter/Dart...
 * [■■■■■■■■■■■■■■■■□□□□] 80% █ EXPERT
 */
const generateMatrixStyleBar = (
  level: SkillLevel, 
  percentage: number, 
  skillName?: string
): SkillBarConfig => {
  const filled = Math.floor(percentage / 5); // 20 blocks max
  const empty = 20 - filled;
  
  const filledBlocks = '■'.repeat(filled);
  const emptyBlocks = '□'.repeat(empty);
  
  const loadingText = skillName ? 
    `LOADING: ${skillName}...` :
    `LOADING: SKILL_ASSESSMENT...`;
    
  const matrixSymbol = getMatrixSymbol(level);
  
  const bar = `${loadingText}\n[${filledBlocks}${emptyBlocks}] ${percentage}% ${matrixSymbol} ${level.toUpperCase()}`;
  const html = `
    <div class="matrix-bar">
      <div class="loading-text">${loadingText}</div>
      <div class="matrix-progress">
        [<span class="matrix-filled">${filledBlocks}</span><span class="matrix-empty">${emptyBlocks}</span>] 
        <span class="matrix-percentage">${percentage}%</span> 
        <span class="matrix-symbol">${matrixSymbol}</span>
        <span class="matrix-level">${level.toUpperCase()}</span>
      </div>
    </div>
  `;

  return {
    level,
    style: 'matrix',
    bar,
    html,
    percentage,
    animated: true,
    interactive: true
  };
};

/**
 * Code execution tree style
 * > executing skill_assessment("Flutter")
 *   ├─ syntax_mastery: ████████████ 100%
 *   ├─ architecture: ██████████   83%
 *   └─ result: EXPERT_LEVEL ✓
 */
const generateExecutionStyleBar = (
  level: SkillLevel, 
  percentage: number, 
  skillName?: string,
  skillData?: any
): SkillBarConfig => {
  const skillNameFormatted = skillName?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'skill';
  
  const subSkills = generateSubSkillBreakdown(level, percentage);
  const execTime = Math.floor(Math.random() * 50 + 10); // Random execution time
  const result = percentage >= 90 ? 'EXPERT_LEVEL ✓' : 
                percentage >= 75 ? 'ADVANCED_LEVEL ✓' :
                percentage >= 60 ? 'PROFICIENT_LEVEL ✓' :
                percentage >= 40 ? 'INTERMEDIATE_LEVEL ⚠' : 'BEGINNER_LEVEL ⚠';

  const executionTree = subSkills.map((skill, index) => {
    const isLast = index === subSkills.length - 1;
    const prefix = isLast ? '└─' : '├─';
    const blocks = '█'.repeat(Math.floor(skill.percentage / 10));
    const spaces = ' '.repeat(10 - Math.floor(skill.percentage / 10));
    return `  ${prefix} ${skill.name}: ${blocks}${spaces} ${skill.percentage}%`;
  }).join('\n');

  const bar = `> executing skill_assessment("${skillNameFormatted}")\n${executionTree}\n  └─ result: ${result} (${execTime}ms)`;
  
  const html = `
    <div class="execution-bar">
      <div class="exec-command">> executing skill_assessment("${skillNameFormatted}")</div>
      <div class="exec-tree">
        ${subSkills.map((skill, index) => {
          const isLast = index === subSkills.length - 1;
          const prefix = isLast ? '└─' : '├─';
          const blocks = '█'.repeat(Math.floor(skill.percentage / 10));
          const spaces = ' '.repeat(10 - Math.floor(skill.percentage / 10));
          return `<div class="exec-line">  ${prefix} ${skill.name}: <span class="exec-blocks">${blocks}</span><span class="exec-spaces">${spaces}</span> ${skill.percentage}%</div>`;
        }).join('')}
      </div>
      <div class="exec-result">  └─ result: <span class="exec-status">${result}</span> <span class="exec-time">(${execTime}ms)</span></div>
    </div>
  `;

  return {
    level,
    style: 'execution',
    bar,
    html,
    percentage,
    animated: true,
    interactive: true
  };
};

/**
 * Retro terminal meter style
 * [SKILL] Flutter/Dart        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% EXPERT
 * [IMPACT] $2M+ transactions  ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
 */
const generateMeterStyleBar = (
  level: SkillLevel, 
  percentage: number, 
  skillName?: string,
  skillData?: any
): SkillBarConfig => {
  const filled = Math.floor(percentage / 5); // 20 blocks max
  const meterBlocks = '▓'.repeat(filled) + '░'.repeat(20 - filled);
  
  const impactSymbols = skillData?.highlight ? 
    '⚡'.repeat(Math.min(Math.floor(percentage / 10), 10)) : 
    '●'.repeat(Math.min(Math.floor(percentage / 10), 10));
    
  const lines = [
    `[SKILL] ${skillName || 'Technical'} ${meterBlocks} ${percentage}% ${level.toUpperCase()}`,
    `[YEARS] ${skillData?.years || 'Multiple'} experience ${'█'.repeat(Math.min(Math.floor(percentage / 20), 10))}`,
    skillData?.highlight ? `[IMPACT] ${skillData.highlight} ${impactSymbols}` : null
  ].filter(Boolean);

  const bar = lines.join('\n');
  const html = `
    <div class="meter-bar">
      ${lines.map(line => {
        if (!line) return '';
        const [label, ...rest] = line.split('] ');
        return `<div class="meter-line"><span class="meter-label">${label}]</span> ${rest.join('] ')}</div>`;
      }).join('')}
    </div>
  `;

  return {
    level,
    style: 'meter',
    bar,
    html,
    percentage,
    animated: true,
    interactive: true
  };
};

/**
 * Classic ASCII style (original design)
 */
const generateClassicStyleBar = (level: SkillLevel, percentage: number): SkillBarConfig => {
  const configs: Record<SkillLevel, Omit<SkillBarConfig, 'percentage'>> = {
    Expert: {
      level,
      style: 'classic',
      bar: '{ ████████████ }',
      html: '{ <span class="filled">████████████</span> }',
      animated: false,
      interactive: false
    },
    Advanced: {
      level,
      style: 'classic',
      bar: '{ ██████████▓▓ }',
      html: '{ <span class="filled">██████████</span><span class="dither-1">▓▓</span> }',
      animated: false,
      interactive: false
    },
    Proficient: {
      level,
      style: 'classic',
      bar: '{ ████████▒▒▒▒ }',
      html: '{ <span class="filled">████████</span><span class="dither-2">▒▒▒▒</span> }',
      animated: false,
      interactive: false
    },
    Intermediate: {
      level,
      style: 'classic',
      bar: '{ ██████░░░░░░ }',
      html: '{ <span class="filled">██████</span><span class="dither-3">░░░░░░</span> }',
      animated: false,
      interactive: false
    },
    Beginner: {
      level,
      style: 'classic',
      bar: '{ ████░░░░░░░░ }',
      html: '{ <span class="filled">████</span><span class="dither-3">░░░░░░░░</span> }',
      animated: false,
      interactive: false
    },
  };

  return { ...configs[level], percentage };
};

/**
 * Helper function to get Matrix-style symbols for different levels
 */
const getMatrixSymbol = (level: SkillLevel): string => {
  const symbols: Record<SkillLevel, string> = {
    Expert: '█',
    Advanced: '▓',
    Proficient: '▒',
    Intermediate: '░',
    Beginner: '·'
  };
  return symbols[level];
};

/**
 * Generate sub-skill breakdown for execution style
 */
const generateSubSkillBreakdown = (level: SkillLevel, basePercentage: number) => {
  const variance = 15; // ±15% variance from base
  const subSkills = [
    'syntax_mastery',
    'architecture',
    'best_practices',
    'debugging'
  ];

  return subSkills.map(skill => ({
    name: skill,
    percentage: Math.min(100, Math.max(0, 
      basePercentage + (Math.random() - 0.5) * variance * 2
    )).toFixed(0)
  }));
};

/**
 * Generate enhanced skill bar with metadata and animations
 */
export const generateEnhancedSkillBar = (
  level: SkillLevel,
  style: SkillBarStyle = 'terminal',
  skillName?: string,
  skillData?: any,
  options?: {
    animated?: boolean;
    interactive?: boolean;
    showMetadata?: boolean;
  }
): EnhancedSkillBar => {
  const config = generateSkillBarConfig(level, style, skillName, skillData);
  
  const metadata: SkillMetadata = {
    command: style === 'terminal' ? config.bar.split('\n')[0] : undefined,
    status: `${level.toUpperCase()}_LEVEL`,
    impact: skillData?.highlight,
    execTime: `${Math.floor(Math.random() * 50 + 10)}ms`,
    processId: `PID_${Math.floor(Math.random() * 9999 + 1000)}`
  };

  const segments = generateProgressSegments(level);
  
  const animations = {
    typing: style === 'terminal' || style === 'execution',
    progressive: true,
    glow: level === 'Expert',
    hover: options?.interactive !== false
  };

  return {
    config,
    metadata,
    segments,
    animations
  };
};

/**
 * Simple wrapper for backward compatibility
 */
export const getSkillBarStyle = (level: string, style: SkillBarStyle = 'terminal') => {
  if (!isValidSkillLevel(level)) {
    console.warn(`Invalid skill level: ${level}, defaulting to Beginner`);
    return generateSkillBarConfig('Beginner', style);
  }
  return generateSkillBarConfig(level as SkillLevel, style);
};

/**
 * Generate progress segments for custom rendering
 */
export const generateProgressSegments = (level: SkillLevel): ProgressSegment[] => {
  const levelMappings: Record<SkillLevel, number> = {
    Expert: 6,
    Advanced: 4,
    Proficient: 3,
    Intermediate: 2,
    Beginner: 1,
  };

  const filledSegments = levelMappings[level];
  const totalSegments = 6;
  const segments: ProgressSegment[] = [];

  // Add filled segments
  for (let i = 0; i < filledSegments; i++) {
    segments.push({
      type: 'filled',
      content: ASCII_CHARS.PROGRESS.FULL,
      opacity: 1,
    });
  }

  // Add remaining segments with dithering
  const remaining = totalSegments - filledSegments;
  if (remaining > 0) {
    const ditherType = level === 'Advanced' ? 'dither-1' : 
                      level === 'Proficient' ? 'dither-2' : 'dither-3';
    const ditherChar = level === 'Advanced' ? ASCII_CHARS.PROGRESS.THREE_QUARTER :
                      level === 'Proficient' ? ASCII_CHARS.PROGRESS.HALF : 
                      ASCII_CHARS.PROGRESS.QUARTER;

    for (let i = 0; i < remaining; i++) {
      segments.push({
        type: ditherType as any,
        content: ditherChar,
        opacity: level === 'Advanced' ? 0.75 : 
                level === 'Proficient' ? 0.5 : 0.25,
      });
    }
  }

  return segments;
};

/**
 * Generate animated skill bar with typing effect
 */
export const generateAnimatedSkillBar = (
  level: SkillLevel,
  animationDelay: number = 0
): string => {
  const config = generateSkillBarConfig(level);
  const segments = generateProgressSegments(level);
  
  let html = '<span class="skill-bar-animated">[';
  
  segments.forEach((segment, index) => {
    const delay = animationDelay + (index * 100); // 100ms between each segment
    html += `<span class="${segment.type}" style="animation-delay: ${delay}ms;">${segment.content}</span>`;
    if (index < segments.length - 1) {
      html += ' ';
    }
  });
  
  html += ']</span>';
  return html;
};

/**
 * Get skill level as numeric value for sorting/comparison
 */
export const getSkillLevelNumeric = (level: SkillLevel): number => {
  const values: Record<SkillLevel, number> = {
    Expert: 5,
    Advanced: 4,
    Proficient: 3,
    Intermediate: 2,
    Beginner: 1,
  };
  return values[level];
};

/**
 * Get skill level color for theming
 */
export const getSkillLevelColor = (level: SkillLevel): string => {
  const colors: Record<SkillLevel, string> = {
    Expert: 'var(--foreground-digital)',
    Advanced: '#00d4aa',
    Proficient: '#ffaa00',
    Intermediate: '#ff6b35',
    Beginner: '#ff4444',
  };
  return colors[level];
};

/**
 * Validate skill level string
 */
export const isValidSkillLevel = (level: string): level is SkillLevel => {
  return ['Expert', 'Advanced', 'Proficient', 'Intermediate', 'Beginner'].includes(level);
};

/**
 * Convert percentage to skill level
 */
export const percentageToSkillLevel = (percentage: number): SkillLevel => {
  if (percentage >= 90) return 'Expert';
  if (percentage >= 75) return 'Advanced';
  if (percentage >= 60) return 'Proficient';
  if (percentage >= 40) return 'Intermediate';
  return 'Beginner';
};

/**
 * Convert skill level to percentage for calculations
 */
export const skillLevelToPercentage = (level: SkillLevel): number => {
  const percentages: Record<SkillLevel, number> = {
    Expert: 100,
    Advanced: 83,
    Proficient: 67,
    Intermediate: 50,
    Beginner: 33,
  };
  return percentages[level];
};