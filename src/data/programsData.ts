export interface Program {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  category: string;
  level: string;
  fullDescription: string;
  benefits: string[];
  schedule: string;
  ageGroup: string;
  duration: string;
}

export const programs: Program[] = [
  {
    slug: 'karate',
    icon: '🥋',
    title: 'Karate',
    desc: 'Traditional strikes & self-discipline',
    category: 'Traditional',
    level: 'Beginner to Advanced',
    fullDescription:
      'Karate is a traditional Japanese martial art that emphasises powerful strikes, blocks, and kicks. At GSAI, our Karate programme builds discipline, focus, and physical conditioning through structured kata (forms) and kumite (sparring). Students progress through a belt system while developing mental resilience alongside combat skills.',
    benefits: [
      'Improved focus & concentration',
      'Full-body conditioning',
      'Self-discipline & respect',
      'Progressive belt ranking system',
      'Competition readiness',
    ],
    schedule: 'Mon / Wed / Fri — 6:00 AM & 5:00 PM batches',
    ageGroup: '5 years and above',
    duration: '60–90 min per session',
  },
  {
    slug: 'taekwondo',
    icon: '🦵',
    title: 'Taekwondo',
    desc: 'Dynamic kicks & sparring',
    category: 'Olympic Sport',
    level: 'All Levels',
    fullDescription:
      'Taekwondo is a Korean Olympic martial art renowned for its explosive kicking techniques and fast-paced sparring. Our programme covers poomsae (patterns), kyorugi (sparring), and breaking techniques. Students develop exceptional flexibility, speed, and competitive spirit under internationally certified instructors.',
    benefits: [
      'Olympic-level kicking technique',
      'Enhanced flexibility & agility',
      'Competitive sparring training',
      'International certification pathway',
      'Mental toughness & sportsmanship',
    ],
    schedule: 'Mon / Wed / Fri — 6:30 AM & 4:30 PM batches',
    ageGroup: '4 years and above',
    duration: '60–90 min per session',
  },
  {
    slug: 'boxing',
    icon: '🥊',
    title: 'Boxing',
    desc: 'Build stamina & precision',
    category: 'Combat Sport',
    level: 'Beginner to Pro',
    fullDescription:
      'Boxing at GSAI develops raw power, speed, and cardiovascular endurance. Our programme covers footwork, jab-cross combos, defensive slipping, and heavy bag work. Whether you want to compete or simply get fit, our coaches tailor training to your goals while instilling discipline and grit.',
    benefits: [
      'Explosive upper-body power',
      'Cardio & stamina boost',
      'Hand-eye coordination',
      'Stress relief & confidence',
      'Real-world self-defense skills',
    ],
    schedule: 'Tue / Thu / Sat — 6:00 AM & 5:30 PM batches',
    ageGroup: '8 years and above',
    duration: '60 min per session',
  },
  {
    slug: 'kickboxing',
    icon: '🥋',
    title: 'Kickboxing',
    desc: 'Cardio meets combat',
    category: 'Fitness',
    level: 'All Levels',
    fullDescription:
      'Kickboxing combines boxing punches with powerful kicks for an intense full-body workout. Our sessions blend technique drills, pad work, and high-intensity interval training. It\'s the perfect programme for those looking to burn fat, build lean muscle, and learn striking fundamentals simultaneously.',
    benefits: [
      'High-calorie burn (up to 800/session)',
      'Full-body toning',
      'Striking fundamentals',
      'Improved coordination',
      'Stress relief & mental clarity',
    ],
    schedule: 'Mon–Sat — 7:00 AM & 6:00 PM batches',
    ageGroup: '10 years and above',
    duration: '45–60 min per session',
  },
  {
    slug: 'grappling',
    icon: '🤼',
    title: 'Grappling',
    desc: 'Ground control tactics',
    category: 'Combat Sport',
    level: 'Intermediate+',
    fullDescription:
      'Our Grappling programme teaches takedowns, ground control, submissions, and escapes drawn from wrestling, judo, and Brazilian jiu-jitsu. Students learn how to control opponents without strikes — an essential skill set for MMA competitors and self-defense practitioners alike.',
    benefits: [
      'Takedown & sweep mastery',
      'Submission & escape techniques',
      'Core & grip strength',
      'Strategic thinking under pressure',
      'Essential MMA foundation',
    ],
    schedule: 'Tue / Thu / Sat — 5:00 PM batch',
    ageGroup: '12 years and above',
    duration: '75 min per session',
  },
  {
    slug: 'mma',
    icon: '🥋',
    title: 'MMA',
    desc: 'Striking & grappling combined',
    category: 'Mixed Martial Arts',
    level: 'Advanced',
    fullDescription:
      'Mixed Martial Arts at GSAI integrates striking, clinch work, and ground fighting into a complete combat system. Our advanced programme is designed for serious athletes looking to compete or push their limits. Training covers cage strategy, conditioning, and fight IQ under experienced MMA coaches.',
    benefits: [
      'Complete fighting system',
      'Elite-level conditioning',
      'Fight IQ & cage strategy',
      'Competition preparation',
      'Mental fortitude & resilience',
    ],
    schedule: 'Mon / Wed / Fri / Sat — 6:00 PM batch',
    ageGroup: '16 years and above',
    duration: '90 min per session',
  },
  {
    slug: 'kalaripayattu',
    icon: '🕉️',
    title: 'Kalaripayattu',
    desc: "India's ancient warrior art",
    category: 'Traditional',
    level: 'All Levels',
    fullDescription:
      'Kalaripayattu is one of the oldest martial arts in the world, originating from Kerala, India. Our programme covers meipayattu (body exercises), kolthari (wooden weapons), ankathari (metal weapons), and verumkai (bare-hand combat). Students connect with India\'s warrior heritage while developing extraordinary flexibility and body awareness.',
    benefits: [
      'Ancient Indian warrior tradition',
      'Extraordinary flexibility',
      'Weapon-based combat training',
      'Holistic body-mind connection',
      'Cultural heritage preservation',
    ],
    schedule: 'Mon / Wed / Fri — 5:30 AM & 4:00 PM batches',
    ageGroup: '6 years and above',
    duration: '60–90 min per session',
  },
  {
    slug: 'self-defense',
    icon: '🛡️',
    title: 'Self-Defense',
    desc: 'Practical safety training',
    category: 'Life Skills',
    level: 'Beginner',
    fullDescription:
      'Our Self-Defense programme teaches practical, real-world techniques to handle threatening situations. Covering situational awareness, escape tactics, striking basics, and verbal de-escalation, this programme is ideal for women, children, and anyone wanting to feel safer. No prior martial arts experience required.',
    benefits: [
      'Situational awareness skills',
      'Escape & evasion techniques',
      'Confidence in threatening situations',
      'No prior experience needed',
      'Specially designed women\'s safety modules',
    ],
    schedule: 'Mon–Sat — Special weekend workshops available',
    ageGroup: 'All ages (8+)',
    duration: '45–60 min per session',
  },
  {
    slug: 'fat-loss',
    icon: '🏋️',
    title: 'Fat Loss',
    desc: 'Burn fat, build agility',
    category: 'Fitness',
    level: 'All Levels',
    fullDescription:
      'Our Fat Loss programme combines martial arts drills with high-intensity interval training for maximum calorie burn. Sessions include pad work, bodyweight circuits, agility ladders, and functional movements. Guided by our coaches, you\'ll transform your physique while learning combat fundamentals.',
    benefits: [
      'Up to 1000 calories per session',
      'Lean muscle development',
      'Improved metabolic rate',
      'Fun, non-monotonous workouts',
      'Nutrition guidance included',
    ],
    schedule: 'Mon–Sat — 6:00 AM & 7:00 PM batches',
    ageGroup: '14 years and above',
    duration: '45 min per session',
  },
];
