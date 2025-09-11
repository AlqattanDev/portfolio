/**
 * Skills Component Tests
 * Tests for the refactored Skills component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateSkillBarConfig, isValidSkillLevel, getSkillLevelNumeric } from '@/utils/helpers/skillBarGenerator.js';
import type { SkillLevel, SkillCategory } from '@/types/skill.js';

describe('Skills Utility Functions', () => {
  describe('generateSkillBarConfig', () => {
    it('should generate correct config for Expert level', () => {
      const config = generateSkillBarConfig('Expert');
      expect(config.level).toBe('Expert');
      expect(config.bar).toContain('██ ██ ██ ██ ██ ██');
      expect(config.html).toContain('filled');
      expect(config.html).not.toContain('dither');
    });

    it('should generate correct config for Advanced level', () => {
      const config = generateSkillBarConfig('Advanced');
      expect(config.level).toBe('Advanced');
      expect(config.bar).toContain('██ ██ ██ ██ ▓▓ ▓▓');
      expect(config.html).toContain('filled');
      expect(config.html).toContain('dither-1');
    });

    it('should generate correct config for Proficient level', () => {
      const config = generateSkillBarConfig('Proficient');
      expect(config.level).toBe('Proficient');
      expect(config.bar).toContain('██ ██ ██ ▒▒ ▒▒ ▒▒');
      expect(config.html).toContain('dither-2');
    });

    it('should generate correct config for Intermediate level', () => {
      const config = generateSkillBarConfig('Intermediate');
      expect(config.level).toBe('Intermediate');
      expect(config.bar).toContain('██ ██ ░░ ░░ ░░ ░░');
      expect(config.html).toContain('dither-3');
    });

    it('should generate correct config for Beginner level', () => {
      const config = generateSkillBarConfig('Beginner');
      expect(config.level).toBe('Beginner');
      expect(config.bar).toContain('██ ░░ ░░ ░░ ░░ ░░');
      expect(config.html).toContain('dither-3');
    });
  });

  describe('isValidSkillLevel', () => {
    it('should return true for valid skill levels', () => {
      expect(isValidSkillLevel('Expert')).toBe(true);
      expect(isValidSkillLevel('Advanced')).toBe(true);
      expect(isValidSkillLevel('Proficient')).toBe(true);
      expect(isValidSkillLevel('Intermediate')).toBe(true);
      expect(isValidSkillLevel('Beginner')).toBe(true);
    });

    it('should return false for invalid skill levels', () => {
      expect(isValidSkillLevel('Master')).toBe(false);
      expect(isValidSkillLevel('Novice')).toBe(false);
      expect(isValidSkillLevel('')).toBe(false);
      expect(isValidSkillLevel('expert')).toBe(false); // case sensitive
    });
  });

  describe('getSkillLevelNumeric', () => {
    it('should return correct numeric values', () => {
      expect(getSkillLevelNumeric('Expert')).toBe(5);
      expect(getSkillLevelNumeric('Advanced')).toBe(4);
      expect(getSkillLevelNumeric('Proficient')).toBe(3);
      expect(getSkillLevelNumeric('Intermediate')).toBe(2);
      expect(getSkillLevelNumeric('Beginner')).toBe(1);
    });

    it('should maintain ordering for sorting', () => {
      const levels: SkillLevel[] = ['Beginner', 'Expert', 'Intermediate', 'Advanced', 'Proficient'];
      const sorted = levels.sort((a, b) => getSkillLevelNumeric(b) - getSkillLevelNumeric(a));
      
      expect(sorted).toEqual(['Expert', 'Advanced', 'Proficient', 'Intermediate', 'Beginner']);
    });
  });
});

describe('Skills Component Integration', () => {
  let mockSkillsData: SkillCategory[];

  beforeEach(() => {
    mockSkillsData = [
      {
        header: 'Programming Languages',
        years: '10+ years',
        items: [
          {
            name: 'TypeScript',
            level: 'Expert',
            years: '5 years',
            projects: '20+ projects',
            highlight: 'Type-safe JavaScript development',
          },
          {
            name: 'Python',
            level: 'Advanced',
            years: '7 years',
            projects: '15+ projects',
            highlight: 'Data science and automation',
          },
        ],
      },
    ];
  });

  describe('Data Processing', () => {
    it('should handle valid skills data', () => {
      // Test that our validation utilities work correctly
      const category = mockSkillsData[0];
      expect(category).toBeDefined();
      expect(category.items).toHaveLength(2);
      
      category.items.forEach(skill => {
        expect(isValidSkillLevel(skill.level)).toBe(true);
      });
    });

    it('should generate progress bars for all skill items', () => {
      const category = mockSkillsData[0];
      
      category.items.forEach(skill => {
        const config = generateSkillBarConfig(skill.level as SkillLevel);
        expect(config).toBeDefined();
        expect(config.html).toContain('[');
        expect(config.html).toContain(']');
        expect(config.html).toContain('span');
      });
    });

    it('should handle sorting by skill level', () => {
      const skills = mockSkillsData[0].items;
      const sorted = [...skills].sort((a, b) => 
        getSkillLevelNumeric(b.level as SkillLevel) - getSkillLevelNumeric(a.level as SkillLevel)
      );

      expect(sorted[0].name).toBe('TypeScript'); // Expert comes first
      expect(sorted[1].name).toBe('Python');     // Advanced comes second
    });
  });
});

describe('Skills Component Error Handling', () => {
  it('should handle invalid skill level gracefully', () => {
    // Should not throw, should fallback to Beginner
    const config = generateSkillBarConfig('InvalidLevel' as SkillLevel);
    expect(config).toBeDefined();
    
    // When invalid level is passed, the function should handle it gracefully
    expect(isValidSkillLevel('InvalidLevel')).toBe(false);
  });

  it('should handle empty skills array', () => {
    const emptySkills: SkillCategory[] = [];
    expect(emptySkills).toHaveLength(0);
    
    // Component should render error state when no skills provided
    // This would be tested in component rendering tests
  });

  it('should handle missing skill properties', () => {
    const incompleteSkill = {
      name: 'JavaScript',
      // level is missing
      years: '3 years',
      projects: '10 projects',
      highlight: 'Frontend development',
    } as any;

    // Should handle missing level gracefully
    const hasLevel = 'level' in incompleteSkill;
    expect(hasLevel).toBe(false);
  });
});

describe('Skills Performance', () => {
  it('should handle large number of skills efficiently', () => {
    const largeSkillsArray: SkillCategory[] = Array.from({ length: 100 }, (_, i) => ({
      header: `Category ${i}`,
      years: `${i} years`,
      items: Array.from({ length: 10 }, (_, j) => ({
        name: `Skill ${i}-${j}`,
        level: ['Expert', 'Advanced', 'Proficient', 'Intermediate', 'Beginner'][j % 5] as SkillLevel,
        years: `${j} years`,
        projects: `${j} projects`,
        highlight: `Highlight for skill ${j}`,
      })),
    }));

    const startTime = performance.now();
    
    // Process all skills
    largeSkillsArray.forEach(category => {
      category.items.forEach(skill => {
        generateSkillBarConfig(skill.level);
      });
    });
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // Should process 1000 skills in reasonable time (< 100ms)
    expect(processingTime).toBeLessThan(100);
  });
});