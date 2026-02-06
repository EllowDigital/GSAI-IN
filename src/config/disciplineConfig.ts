// Discipline configuration for India-specific martial arts progression

export type DisciplineType = 'belt' | 'level';

export interface DisciplineConfig {
  name: string;
  type: DisciplineType;
  hasStripes: boolean;
  description: string;
  belts?: string[];
  levels?: string[];
}

// Belt-based disciplines (Taekwondo, Karate, Kickboxing, BJJ/Grappling)
export const BELT_DISCIPLINES = [
  'Taekwondo',
  'Karate',
  'Kickboxing',
  'Grappling',
  'BJJ',
];

// Level-based disciplines (no belts)
export const LEVEL_DISCIPLINES = [
  'Boxing',
  'MMA',
  'Self-Defense',
  'Fitness',
  'Fat Loss',
  'Kalaripayattu',
];

export const DISCIPLINE_CONFIG: Record<string, DisciplineConfig> = {
  Taekwondo: {
    name: 'Taekwondo',
    type: 'belt',
    hasStripes: false,
    description: 'Korean martial art with belt progression',
    belts: ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black'],
  },
  Karate: {
    name: 'Karate',
    type: 'belt',
    hasStripes: false,
    description: 'Japanese martial art with belt progression',
    belts: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'],
  },
  Kickboxing: {
    name: 'Kickboxing',
    type: 'belt',
    hasStripes: false,
    description: 'Combat sport with grade/belt progression',
    belts: ['White', 'Yellow', 'Green', 'Blue', 'Brown', 'Black'],
  },
  Grappling: {
    name: 'Grappling (BJJ)',
    type: 'belt',
    hasStripes: true, // IBJJF standard - stripes 0-4 between belts
    description: 'Brazilian Jiu-Jitsu following IBJJF belt system',
    belts: ['White', 'Blue', 'Purple', 'Brown', 'Black'],
  },
  BJJ: {
    name: 'Brazilian Jiu-Jitsu',
    type: 'belt',
    hasStripes: true,
    description: 'IBJJF standard belt system with stripes',
    belts: ['White', 'Blue', 'Purple', 'Brown', 'Black'],
  },
  Boxing: {
    name: 'Boxing',
    type: 'level',
    hasStripes: false,
    description: 'No belts - performance-based progression',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competition'],
  },
  MMA: {
    name: 'Mixed Martial Arts',
    type: 'level',
    hasStripes: false,
    description: 'No belts - experience/fight readiness levels',
    levels: ['Foundation', 'Intermediate', 'Advanced', 'Fighter'],
  },
  'Self-Defense': {
    name: 'Self-Defense',
    type: 'level',
    hasStripes: false,
    description: 'Skill-based progression',
    levels: ['Awareness', 'Basic Defense', 'Advanced Defense', 'Instructor'],
  },
  Fitness: {
    name: 'Fitness Training',
    type: 'level',
    hasStripes: false,
    description: 'Milestone-based progression',
    levels: ['Starter', 'Active', 'Fit', 'Elite'],
  },
  'Fat Loss': {
    name: 'Fat Loss Program',
    type: 'level',
    hasStripes: false,
    description: 'Program phase progression',
    levels: ['Week 1-4', 'Week 5-8', 'Week 9-12', 'Maintenance'],
  },
  Kalaripayattu: {
    name: 'Kalaripayattu',
    type: 'level',
    hasStripes: false,
    description: 'Traditional Indian martial art - varies by school',
    levels: ['Meythari', 'Kolthari', 'Ankathari', 'Verumkai', 'Gurukkal'],
  },
};

export function getDisciplineConfig(program: string): DisciplineConfig | null {
  // Try exact match first
  if (DISCIPLINE_CONFIG[program]) {
    return DISCIPLINE_CONFIG[program];
  }

  // Try case-insensitive match
  const key = Object.keys(DISCIPLINE_CONFIG).find(
    (k) => k.toLowerCase() === program.toLowerCase()
  );

  return key ? DISCIPLINE_CONFIG[key] : null;
}

export function isBeltDiscipline(program: string): boolean {
  const config = getDisciplineConfig(program);
  return config?.type === 'belt';
}

export function isLevelDiscipline(program: string): boolean {
  const config = getDisciplineConfig(program);
  return config?.type === 'level';
}

export function hasStripeSupport(program: string): boolean {
  const config = getDisciplineConfig(program);
  return config?.hasStripes ?? false;
}
