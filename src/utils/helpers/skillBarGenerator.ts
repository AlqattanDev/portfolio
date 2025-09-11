/**
 * Skill bar generation utilities
 * Extracted from Skills.astro component
 */

import type { SkillLevel, SkillBarConfig, ProgressSegment } from '@/types/skill.js';
import { ASCII_CHARS } from '@/utils/constants/theme.js';

/**
 * Generate skill bar configuration for different skill levels
 */
export const generateSkillBarConfig = (level: SkillLevel): SkillBarConfig => {
  const configs: Record<SkillLevel, SkillBarConfig> = {
    Expert: {
      level,
      bar: '{ ████████████ }',
      html: '{ <span class="filled">████████████</span> }',
    },
    Advanced: {
      level,
      bar: '{ ██████████▓▓ }',
      html: '{ <span class="filled">██████████</span><span class="dither-1">▓▓</span> }',
    },
    Proficient: {
      level,
      bar: '{ ████████▒▒▒▒ }',
      html: '{ <span class="filled">████████</span><span class="dither-2">▒▒▒▒</span> }',
    },
    Intermediate: {
      level,
      bar: '{ ██████░░░░░░ }',
      html: '{ <span class="filled">██████</span><span class="dither-3">░░░░░░</span> }',
    },
    Beginner: {
      level,
      bar: '{ ████░░░░░░░░ }',
      html: '{ <span class="filled">████</span><span class="dither-3">░░░░░░░░</span> }',
    },
  };

  // Fallback to Beginner if invalid level is provided
  if (!configs[level]) {
    return configs.Beginner;
  }

  return configs[level];
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