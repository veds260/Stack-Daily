export interface FormData {
  name: string;
  telegram: string;
  xProfile: string;
  expertise: string[];
  experienceLevel: string;
  monthlyRate: string;
  biggestWin: string;
  portfolio: string;
}

export const MONTHLY_RATE_OPTIONS = [
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2000', label: '$1,000 - $2,000' },
  { value: '2000-2500', label: '$2,000 - $2,500' },
] as const;

export type Title = 'Apprentice' | 'Builder' | 'Operator' | 'OG' | 'Legend';

export interface TitleInfo {
  title: Title;
  description: string;
}

export const EXPERTISE_OPTIONS = [
  'Social Media Management',
  'Community Management',
  'Project Management',
  'Business Development',
  'Ghostwriting',
  'Graphic Design',
  'Video Editing',
  'Clipping',
  'Sales',
  'Vibe Coding',
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: 'personal', label: 'Worked only on personal projects' },
  { value: 'less-1', label: '< 1 year' },
  { value: '1-2', label: '1-2 years' },
  { value: '3+', label: '3+ years' },
] as const;

// Check if a string is a valid URL
export function isValidUrl(str: string): boolean {
  if (!str || str.trim() === '') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Keywords that indicate exceptional results
const EXCEPTIONAL_KEYWORDS = [
  'million', 'viral', '100k', '500k', '1m', '10x', '100x',
  'raised', 'funded', 'acquired', 'exit', 'sold', 'grew',
  'lead', 'head', 'director', 'founder', 'co-founder',
  'launched', 'built', 'scaled', 'revenue', 'profit',
];

export function calculateTitle(experienceLevel: string, biggestWin: string): TitleInfo {
  const winLower = biggestWin.toLowerCase();
  const hasExceptionalResults = EXCEPTIONAL_KEYWORDS.some(keyword =>
    winLower.includes(keyword)
  );

  // Personal projects only
  if (experienceLevel === 'personal') {
    return {
      title: 'Apprentice',
      description: 'Learning the game',
    };
  }

  // Less than 1 year
  if (experienceLevel === 'less-1') {
    if (hasExceptionalResults) {
      return {
        title: 'Operator',
        description: 'Battle-tested and shipping',
      };
    }
    return {
      title: 'Builder',
      description: 'Putting in the reps',
    };
  }

  // 1-2 years
  if (experienceLevel === '1-2') {
    if (hasExceptionalResults) {
      return {
        title: 'OG',
        description: 'Been here since the early days',
      };
    }
    return {
      title: 'Operator',
      description: 'Battle-tested and shipping',
    };
  }

  // 3+ years
  if (experienceLevel === '3+') {
    if (hasExceptionalResults) {
      return {
        title: 'Legend',
        description: 'The one projects fight over',
      };
    }
    return {
      title: 'OG',
      description: 'Been here since the early days',
    };
  }

  // Default fallback
  return {
    title: 'Builder',
    description: 'Putting in the reps',
  };
}
