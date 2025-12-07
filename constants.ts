

// ... existing imports ...
import { NavItem, PlantTemplate, SpeciesType, Season, TaskCategory, DiagnosisResult, ExpenseCategory, MarketCategory, ExperienceLevel, HomesteadGoal, SponsorBanner, DocPage, Medication } from './types';

// *** SECURITY CONFIG ***
// Replace this with your actual email to gain Owner permissions.
// In a production app, this would be an environment variable or backend logic.
export const OWNER_EMAIL = "your-email@example.com"; 

// ... existing constants ...

export const AD_PLACEMENT_AREAS = [
  { id: 'dashboard_top_banner', label: 'Dashboard Top Banner', recommendedSize: '1200x200' },
  { id: 'dashboard_feature_block', label: 'Dashboard Feature Block', recommendedSize: '400x400' },
  { id: 'feed_inline', label: 'Feed Inline Card', recommendedSize: '800x450' },
  { id: 'footer_banner', label: 'Footer Banner', recommendedSize: '1200x200' },
  { id: 'seasonal_panel', label: 'Seasonal Panel', recommendedSize: '1200x600' }
];

export const CAMPAIGN_TYPES = [
  { id: 'banner', label: 'Banner Ad' },
  { id: 'sponsor_block', label: 'Sponsor Tile' },
  { id: 'product_tile', label: 'Product Card' },
  { id: 'seasonal_panel', label: 'Seasonal Panel' }
];

// NOTE: This constant is now used for SEEDING the DB. Edits should happen via the UI/DB.
export const USER_HELP_CONTENT = [
  {
    id: 'garden',
    title: 'Garden Planning',
    articles: [
      { id: 'g1', title: 'Setting up your first bed', excerpt: 'Learn how to define dimensions and soil type.' },
      { id: 'g2', title: 'Understanding Frost Dates', excerpt: 'How the scheduler uses your hardiness zone.' },
      { id: 'g3', title: 'Using the AI Layout Tool', excerpt: 'Optimize space with companion planting.' },
      { id: 'g4', title: 'Crop Rotation', excerpt: 'Using history to prevent soil depletion.' }
    ]
  },
  {
    id: 'livestock',
    title: 'Livestock Tracking',
    articles: [
      { id: 'l1', title: 'Logging Daily Production', excerpt: 'Track eggs, milk, and wool yields.' },
      { id: 'l2', title: 'Breeding & Lineage', excerpt: 'How to set up Sires and Dams for genetic tracking.' },
      { id: 'l3', title: 'Medical Records', excerpt: 'Logging vaccinations and tracking withdrawal periods.' }
    ]
  },
  {
    id: 'health',
    title: 'AI Health Diagnostics',
    articles: [
      { id: 'h1', title: 'Scanning Plants & Animals', excerpt: 'Best practices for taking photos for AI analysis.' },
      { id: 'h2', title: 'Offline Diagnostics', excerpt: 'How heuristic checks work when you have no internet.' },
      { id: 'h3', title: 'Treatment Safety', excerpt: 'Understanding withdrawal warnings for medications.' }
    ]
  },
  {
    id: 'orchard',
    title: 'Orchard Care',
    articles: [
      { id: 'o1', title: 'Planting Fruit Trees', excerpt: 'Best practices for hole depth and soil amendment.' },
      { id: 'o2', title: 'Pruning Basics', excerpt: 'When to prune Apple vs Stone Fruit trees.' },
      { id: 'o3', title: 'Pollination Partners', excerpt: 'Understanding bloom times and variety compatibility.' }
    ]
  },
  {
    id: 'finance',
    title: 'Finances',
    articles: [
      { id: 'f1', title: 'Tracking Expenses', excerpt: 'Categorizing feed, equipment, and seeds.' },
      { id: 'f2', title: 'Cost Analysis', excerpt: 'Calculating cost-per-egg and garden yield value.' }
    ]
  },
  {
    id: 'market',
    title: 'Marketplace',
    articles: [
      { id: 'm1', title: 'Posting a Listing', excerpt: 'Sell or trade your surplus harvest.' },
      { id: 'm2', title: 'Safe Trade Practices', excerpt: 'Tips for meeting buyers locally.' }
    ]
  },
  {
    id: 'data',
    title: 'Data & Sync',
    articles: [
      { id: 'd1', title: 'Offline Mode', excerpt: 'How the app saves data when you lose connection.' },
      { id: 'd2', title: 'Exporting Data', excerpt: 'Creating backups (JSON/CSV) of your farm data.' },
      { id: 'd3', title: 'Connecting Sensors', excerpt: 'Integrating weather stations and IoT devices.' }
    ]
  }
];

export const APP_NAME = "Homestead Hub";
export const DB_NAME = "homestead_db";
export const DB_VERSION = 28;

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/tasks' },
  { id: 'garden', label: 'Garden', icon: 'Sprout', path: '/garden' },
  { id: 'library', label: 'Library', icon: 'BookOpen', path: '/library' }, // New Item
  { id: 'animals', label: 'Animals', icon: 'PawPrint', path: '/animals' },
  { id: 'seeds', label: 'Seeds', icon: 'Book', path: '/seeds' },
  { id: 'recipes', label: 'Kitchen', icon: 'Utensils', path: '/recipes' },
  { id: 'market', label: 'Market', icon: 'Store', path: '/marketplace' },
  { id: 'finances', label: 'Finances', icon: 'DollarSign', path: '/finances' },
  { id: 'reports', label: 'Reports', icon: 'FileBarChart', path: '/reports' },
  { id: 'health', label: 'Health', icon: 'Stethoscope', path: '/health' },
  { id: 'weather', label: 'Weather', icon: 'CloudSun', path: '/weather' },
  { id: 'help', label: 'Help Center', icon: 'HelpCircle', path: '/help' },
  { id: 'docs', label: 'Admin Docs', icon: 'FileText', path: '/admin/docs' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
];

export const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out. Learning the basics.' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience. Expanding operations.' },
  { id: 'expert', label: 'Expert', description: 'Experienced homesteader. Optimizing yields.' },
];

export const HOMESTEAD_GOALS: { id: HomesteadGoal; label: string }[] = [
  { id: 'self-sufficiency', label: 'Self Sufficiency' },
  { id: 'hobby', label: 'Hobby / Lifestyle' },
  { id: 'profit', label: 'Market / Profit' },
  { id: 'education', label: 'Education' },
];

export const TREE_SPECIES = [
    { id: 'apple', label: 'Apple' },
    { id: 'pear', label: 'Pear' },
    { id: 'peach', label: 'Peach' },
    { id: 'plum', label: 'Plum' },
    { id: 'cherry', label: 'Cherry' },
    { id: 'apricot', label: 'Apricot' },
    { id: 'fig', label: 'Fig' },
    { id: 'citrus', label: 'Citrus' },
    { id: 'nut', label: 'Nut Tree' },
    { id: 'other', label: 'Other' },
];

export const ROOTSTOCKS = [
    { id: 'standard', label: 'Standard (Full Size)' },
    { id: 'semi-dwarf', label: 'Semi-Dwarf' },
    { id: 'dwarf', label: 'Dwarf' },
];

export const HIVE_TYPES = [
    { id: 'langstroth', label: 'Langstroth' },
    { id: 'top_bar', label: 'Top Bar' },
    { id: 'warre', label: 'Warré' },
    { id: 'flow', label: 'Flow Hive' },
    { id: 'other', label: 'Other' }
];

export const BEE_BREEDS = [
    { id: 'italian', label: 'Italian' },
    { id: 'carniolan', label: 'Carniolan' },
    { id: 'russian', label: 'Russian' },
    { id: 'buckfast', label: 'Buckfast' },
    { id: 'unknown', label: 'Unknown/Local' }
];

// ... (Rest of existing constants)
export const MOCK_MEDICATIONS: Medication[] = [
  // ... existing content ...
  {
    id: 'med_pen',
    name: 'Penicillin G Procaine',
    commonName: 'Pen G',
    activeIngredient: 'Penicillin',
    form: 'injectable',
    speciesGuidance: {
      cattle: { dosageMgPerKg: 20, frequencyPerDay: 1, maxDays: 7, contraindicatedPregnancy: false },
      sheep: { dosageMgPerKg: 20, frequencyPerDay: 1, maxDays: 5, contraindicatedPregnancy: false },
      goat: { dosageMgPerKg: 20, frequencyPerDay: 1, maxDays: 5, contraindicatedPregnancy: false }
    },
    withdrawalPeriods: {
      cattle: { milkDays: 4, meatDays: 10, eggsDays: 0 },
      sheep: { milkDays: 4, meatDays: 9, eggsDays: 0 },
      goat: { milkDays: 4, meatDays: 9, eggsDays: 0 }
    },
    notes: "Shake well before use. IM injection only.",
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    syncStatus: 'synced'
  },
  {
    id: 'med_ivomec',
    name: 'Ivermectin 1%',
    commonName: 'Ivomec',
    activeIngredient: 'Ivermectin',
    form: 'injectable',
    speciesGuidance: {
      cattle: { dosageMgPerKg: 0.2, frequencyPerDay: 1, maxDays: 1, contraindicatedPregnancy: false },
      pig: { dosageMgPerKg: 0.3, frequencyPerDay: 1, maxDays: 1, contraindicatedPregnancy: false }
    },
    withdrawalPeriods: {
      cattle: { milkDays: 0, meatDays: 35, eggsDays: 0 },
      pig: { milkDays: 0, meatDays: 18, eggsDays: 0 }
    },
    notes: "Do not use in female dairy cattle of breeding age.",
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    syncStatus: 'synced'
  },
  {
    id: 'med_cdt',
    name: 'CD&T Vaccine',
    activeIngredient: 'Clostridium Perfringens Types C & D + Tetanus',
    form: 'injectable',
    speciesGuidance: {
        goat: { dosageMgPerKg: 0, frequencyPerDay: 1, maxDays: 1, contraindicatedPregnancy: false },
        sheep: { dosageMgPerKg: 0, frequencyPerDay: 1, maxDays: 1, contraindicatedPregnancy: false }
    },
    withdrawalPeriods: {
        goat: { milkDays: 0, meatDays: 21, eggsDays: 0 },
        sheep: { milkDays: 0, meatDays: 21, eggsDays: 0 }
    },
    notes: "Standard 2ml dose for goats/sheep regardless of weight.",
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    syncStatus: 'synced'
  }
];

export const ADMIN_DOCS_CONTENT: DocPage[] = [
  {
    id: 'runbook',
    title: 'Admin Runbook',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        content: 'This runbook serves as the central operational guide for Homestead Hub administrators. Use this to handle daily tasks, escalations, and system monitoring.'
      },
      {
        id: 'quick_actions',
        title: 'Quick Actions',
        content: '- **Suspend User**: Blocks login and sync. Use for spam/abuse.\n- **Remove Listing**: Hides item from marketplace. Notify user of reason.\n- **Approve Ad**: Moves campaign from "Pending" to "Active".'
      }
    ]
  },
  {
    id: 'sops',
    title: 'Standard Operating Procedures',
    sops: [
      {
        id: 'sop_sponsor',
        title: 'Sponsor Onboarding',
        role: ['admin', 'moderator'],
        steps: [
          'Receive Sponsor Intake: Confirm identity and billing info.',
          'Create Sponsor Record in Admin Console.',
          'Upload Creative Assets & Verify Dimensions.',
          'Set Campaign Dates and Impression Caps.',
          'Send Invoice via Billing Console.',
          'Activate Campaign upon payment.'
        ]
      },
      {
        id: 'sop_mod',
        title: 'Content Moderation - High Severity',
        role: ['moderator'],
        steps: [
          'Triage Flag from Moderation Queue.',
          'Check Evidence (Screenshots/Logs).',
          'Decision: If illegal/dangerous -> Immediate Ban + Report.',
          'Decision: If minor (spam) -> Warn User + Remove Item.',
          'Log action in Audit Trail.'
        ]
      },
      {
        id: 'sop_refund',
        title: 'Billing Dispute & Refund',
        role: ['admin'],
        steps: [
          'Validate transaction ID in Stripe Dashboard.',
          'Check policy: Refund < 48h is auto-approved.',
          'Process Refund in Billing Console.',
          'Email User confirmation.',
          'Log in Audit Trail.'
        ]
      }
    ],
    sections: []
  },
  {
    id: 'reference',
    title: 'System Reference',
    sections: [
      {
        id: 'arch',
        title: 'Architecture Summary',
        content: 'Homestead Hub uses a Local-First architecture. Users own their data in IndexedDB. The backend is primarily for Sync, Auth, and Backup.'
      },
      {
        id: 'contacts',
        title: 'Escalation Contacts',
        content: '**DevOps:** oncall@homesteadhub.com\n**Legal:** legal@homesteadhub.com\n**Security:** security@homesteadhub.com'
      }
    ]
  }
];

export const COMMON_PLANTS: PlantTemplate[] = [
  // ... existing content ...
  { 
    id: 'p1', name: 'Tomato', defaultVariety: 'Roma', daysToMaturity: 75, spacing: 18, icon: 'Circle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'intermediate', companions: ['p10', 'p3'], season: ['summer'], height: 'tall',
    description: "A staple warm-season crop. Determinate varieties like Roma are bushier, while indeterminate varieties grow as vines.",
    careInstructions: "Plant deep, burying the stem to encourage roots. Stake early. Water consistently to prevent blossom end rot. Feed with low-nitrogen fertilizer.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 2
  },
  { 
    id: 'p2', name: 'Lettuce', defaultVariety: 'Butterhead', daysToMaturity: 45, spacing: 6, icon: 'Cloud',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p3', 'p14'], season: ['spring', 'fall'], height: 'short',
    description: "Cool-season leafy green. Grows quickly and is perfect for succession planting.",
    careInstructions: "Keep soil consistently moist. Harvest outer leaves for continuous yield or cut whole head. Needs shade in deep summer heat.",
    plantingMethod: 'direct', weeksRelativeToFrost: -4
  },
  { 
    id: 'p3', name: 'Carrot', defaultVariety: 'Nantes', daysToMaturity: 70, spacing: 3, icon: 'Triangle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'intermediate', companions: ['p1', 'p2', 'p11'], season: ['spring', 'fall'], height: 'short',
    description: "Sweet root vegetable rich in Vitamin A. Nantes varieties are cylindrical and sweet.",
    careInstructions: "Requires loose, sandy soil free of rocks to grow straight. Keep seed bed moist during germination (1-2 weeks). Thin seedlings to 3 inches.",
    plantingMethod: 'direct', weeksRelativeToFrost: -2
  },
  { 
    id: 'p4', name: 'Pepper', defaultVariety: 'Bell', daysToMaturity: 80, spacing: 12, icon: 'Hexagon',
    hardinessZones: [4, 5, 6, 7, 8, 9, 10, 11], difficulty: 'intermediate', companions: ['p10', 'p1'], season: ['summer'], height: 'medium',
    description: "Crunchy, sweet, or spicy fruits. Peppers love heat and sun.",
    careInstructions: "Transplant only after soil warms up. Magnesium (Epsom salts) can help growth. Stake if heavy with fruit.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 3
  },
  { 
    id: 'p5', name: 'Beans', defaultVariety: 'Bush Blue Lake', daysToMaturity: 55, spacing: 4, icon: 'Square',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p3', 'p13'], season: ['summer'], height: 'medium',
    description: "Productive legume that fixes nitrogen in the soil. Bush varieties do not need trellising.",
    careInstructions: "Direct sow after frost. Do not disturb roots. Harvest frequently to encourage continued production.",
    plantingMethod: 'direct', weeksRelativeToFrost: 1
  },
  { 
    id: 'p6', name: 'Radish', defaultVariety: 'Cherry Belle', daysToMaturity: 25, spacing: 2, icon: 'Circle',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p2', 'p5'], season: ['spring', 'fall'], height: 'short',
    description: "Super fast growing root crop. Great for kids and impatient gardeners.",
    careInstructions: "Sow thinly. Harvest promptly when mature; they get woody if left too long. Spicy flavor increases with heat.",
    plantingMethod: 'direct', weeksRelativeToFrost: -4
  },
  { 
    id: 'p7', name: 'Spinach', defaultVariety: 'Bloomsdale', daysToMaturity: 40, spacing: 4, icon: 'Cloud',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p14', 'p5'], season: ['spring', 'fall', 'winter'], height: 'short',
    description: "Nutrient-dense green that loves cold weather. Bloomsdale has crinkled, savory leaves.",
    careInstructions: "Plant very early spring or late fall. Bolting occurs as days lengthen; harvest young.",
    plantingMethod: 'direct', weeksRelativeToFrost: -6
  },
  { 
    id: 'p8', name: 'Zucchini', defaultVariety: 'Black Beauty', daysToMaturity: 50, spacing: 24, icon: 'Hexagon',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p5', 'p12'], season: ['summer'], height: 'tall',
    description: "Prolific summer squash. One or two plants are usually enough for a family.",
    careInstructions: "Watch for squash bugs and powdery mildew. Water at the base. Harvest when 6-8 inches long for best flavor.",
    plantingMethod: 'direct', weeksRelativeToFrost: 2
  },
  { 
    id: 'p9', name: 'Kale', defaultVariety: 'Lacinato', daysToMaturity: 60, spacing: 12, icon: 'Cloud',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p11', 'p13'], season: ['spring', 'fall', 'winter'], height: 'medium',
    description: "Hardy brassica also known as Dinosaur Kale. Sweetens after a frost.",
    careInstructions: "Very cold hardy. Watch for cabbage worms (white butterflies). Mulch to keep soil cool.",
    plantingMethod: 'transplant', weeksRelativeToFrost: -4
  },
  { 
    id: 'p10', name: 'Basil', defaultVariety: 'Genovese', daysToMaturity: 60, spacing: 8, icon: 'Leaf',
    hardinessZones: [4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p1', 'p4'], season: ['summer'], height: 'medium',
    description: "Aromatic herb essential for pesto and tomato dishes.",
    careInstructions: "Pinch off flower heads to keep plant bushy and producing leaves. Hates cold; plant only when nights are warm.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 2
  },
  { 
    id: 'p11', name: 'Onion', defaultVariety: 'Yellow Sweet', daysToMaturity: 100, spacing: 4, icon: 'Circle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9], difficulty: 'intermediate', companions: ['p3', 'p2'], season: ['summer'], height: 'medium',
    description: "Day-length sensitive bulbs. Choose long-day for north, short-day for south.",
    careInstructions: "Keep weed-free; onions don't compete well. Stop watering when tops fall over to cure bulbs.",
    plantingMethod: 'transplant', weeksRelativeToFrost: -4
  },
  { 
    id: 'p12', name: 'Corn', defaultVariety: 'Sweet Corn', daysToMaturity: 85, spacing: 12, icon: 'Triangle',
    hardinessZones: [4, 5, 6, 7, 8, 9], difficulty: 'intermediate', companions: ['p5', 'p8'], season: ['summer'], height: 'tall',
    description: "Tall grass crop needing wind for pollination. Plant in blocks, not single rows.",
    careInstructions: "Heavy feeder; requires nitrogen-rich soil. Water deeply during tasseling/silking.",
    plantingMethod: 'direct', weeksRelativeToFrost: 1
  },
  { 
    id: 'p13', name: 'Potato', defaultVariety: 'Yukon Gold', daysToMaturity: 90, spacing: 12, icon: 'Circle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p5', 'p12'], season: ['summer', 'fall'], height: 'medium',
    description: "Starchy tuber. Yukon Gold is a versatile, buttery yellow variety.",
    careInstructions: "Plant seed potatoes in trenches. 'Hill' soil around stems as they grow to prevent green tubers. Harvest after vines die back.",
    plantingMethod: 'direct', weeksRelativeToFrost: -2
  },
  { 
    id: 'p14', name: 'Strawberry', defaultVariety: 'June Bearing', daysToMaturity: 60, spacing: 12, icon: 'Heart',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'intermediate', companions: ['p2', 'p7'], season: ['spring'], height: 'short',
    description: "Perennial fruit. June bearers produce one large crop in early summer.",
    careInstructions: "Mulch with straw to keep berries clean. Remove runners to focus energy on fruit. Replace plants every 3-4 years.",
    plantingMethod: 'transplant', weeksRelativeToFrost: -4
  }
];

export const BENEFICIAL_PLANTS: PlantTemplate[] = [
  {
    id: 'ben1', name: 'Marigold', defaultVariety: 'French', daysToMaturity: 50, spacing: 6, icon: 'Heart',
    hardinessZones: [2,3,4,5,6,7,8,9,10,11], difficulty: 'beginner', companions: [], season: ['spring', 'summer'], height: 'short',
    description: "Bright flowers that deter nematodes and other pests.",
    careInstructions: "Deadhead spent blooms to encourage more flowers. Very hardy.",
    plantingMethod: 'direct', weeksRelativeToFrost: 1
  },
  {
    id: 'ben2', name: 'Nasturtium', defaultVariety: 'Jewel Mix', daysToMaturity: 55, spacing: 8, icon: 'Heart',
    hardinessZones: [4,5,6,7,8,9,10], difficulty: 'beginner', companions: [], season: ['spring', 'summer'], height: 'short',
    description: "Edible flowers and leaves with a peppery taste. Acts as a trap crop for aphids.",
    careInstructions: "Thrives in poor soil. Do not over-fertilize or you'll get leaves but no flowers.",
    plantingMethod: 'direct', weeksRelativeToFrost: -1
  },
  {
    id: 'ben3', name: 'Borage', defaultVariety: 'Blue', daysToMaturity: 60, spacing: 12, icon: 'Leaf',
    hardinessZones: [3,4,5,6,7,8,9,10], difficulty: 'beginner', companions: [], season: ['spring', 'summer'], height: 'medium',
    description: "Star-shaped blue flowers that attract bees like magnets. Edible.",
    careInstructions: "Self-seeds aggressively. Plant where you want it to stay forever.",
    plantingMethod: 'direct', weeksRelativeToFrost: -2
  },
  {
    id: 'ben4', name: 'Lavender', defaultVariety: 'English', daysToMaturity: 90, spacing: 12, icon: 'Sprout',
    hardinessZones: [5,6,7,8,9], difficulty: 'intermediate', companions: [], season: ['summer'], height: 'medium',
    description: "Fragrant perennial herb. Attracts pollinators and repels moths.",
    careInstructions: "Needs excellent drainage and full sun. Prune in spring to prevent woodiness.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 2
  }
];

export const ANIMAL_SPECIES: { id: SpeciesType; label: string; icon: string }[] = [
  { id: 'chicken', label: 'Chickens', icon: 'Bird' },
  { id: 'duck', label: 'Ducks', icon: 'Waves' },
  { id: 'goat', label: 'Goats', icon: 'Mountain' },
  { id: 'sheep', label: 'Sheep', icon: 'Cloud' },
  { id: 'cattle', label: 'Cattle', icon: 'Milk' },
  { id: 'rabbit', label: 'Rabbits', icon: 'Rabbit' },
  { id: 'pig', label: 'Pigs', icon: 'PiggyBank' },
  { id: 'bee', label: 'Bees', icon: 'Hexagon' },
  { id: 'other', label: 'Other', icon: 'HelpCircle' },
];

export const SEASONS: { id: Season; label: string; color: string }[] = [
  { id: 'spring', label: 'Spring', color: 'bg-green-100 text-green-800' },
  { id: 'summer', label: 'Summer', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'fall', label: 'Fall', color: 'bg-orange-100 text-orange-800' },
  { id: 'winter', label: 'Winter', color: 'bg-blue-100 text-blue-800' },
  { id: 'all', label: 'Anytime', color: 'bg-gray-100 text-gray-800' },
];

export const TASK_CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'garden', label: 'Garden' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'orchard', label: 'Orchard' },
  { id: 'apiary', label: 'Apiary' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'preserving', label: 'Preserving' },
  { id: 'admin', label: 'Admin' },
  { id: 'other', label: 'Other' },
];

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'seeds', label: 'Seeds & Plants' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'medical', label: 'Medical' },
  { id: 'labor', label: 'Labor' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'other', label: 'Other' },
];

export const MEASUREMENT_UNITS = [
  { value: 'count', label: 'Count' },
  { value: 'lb', label: 'lbs' },
  { value: 'oz', label: 'oz' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'cup', label: 'Cup' },
  { value: 'tbsp', label: 'Tbsp' },
  { value: 'tsp', label: 'Tsp' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'frame', label: 'Frame' },
];

export const MARKET_CATEGORIES: { id: MarketCategory; label: string }[] = [
  { id: 'produce', label: 'Produce' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'labor', label: 'Labor' },
  { id: 'other', label: 'Other' },
];

export const MOCK_DIAGNOSES: { plant: DiagnosisResult[]; animal: DiagnosisResult[] } = {
  plant: [
    {
      issueName: "Early Blight",
      probability: 92,
      severity: "medium",
      description: "Fungal disease causing target-like spots on lower leaves.",
      treatments: [
        { title: "Prune", description: "Remove infected leaves immediately.", organic: true },
        { title: "Mulch", description: "Apply mulch to stop soil splash.", organic: true },
        { title: "Copper Fungicide", description: "Apply if spreading rapidly.", organic: true }
      ]
    },
    {
      issueName: "Aphid Infestation",
      probability: 88,
      severity: "low",
      description: "Small sap-sucking insects visible on undersides of leaves.",
      treatments: [
        { title: "Water Blast", description: "Spray off with hose.", organic: true },
        { title: "Neem Oil", description: "Apply in evening.", organic: true },
        { title: "Ladybugs", description: "Release beneficial predators.", organic: true }
      ]
    },
    {
      issueName: "Healthy Plant",
      probability: 98,
      severity: "low",
      description: "No significant issues detected. Plant appears vigorous.",
      treatments: []
    }
  ],
  animal: [
    {
      issueName: "Scaly Leg Mites",
      probability: 95,
      severity: "medium",
      description: "Microscopic mites burrowing under scales on legs.",
      treatments: [
        { title: "Oil Soak", description: "Dip legs in vegetable oil to suffocate mites.", organic: true },
        { title: "Petroleum Jelly", description: "Coat legs to prevent re-entry.", organic: true }
      ]
    },
    {
      issueName: "Bumblefoot",
      probability: 85,
      severity: "high",
      description: "Staph infection caused by cut or abrasion on foot pad.",
      treatments: [
        { title: "Clean & Wrap", description: "Soak in Epsom salts, remove scab, wrap.", organic: true },
        { title: "Antibiotics", description: "Consult vet if infection spreads.", organic: false }
      ]
    },
    {
      issueName: "Healthy Animal",
      probability: 96,
      severity: "low",
      description: "Coat/feathers look good. Alert and active.",
      treatments: []
    }
  ]
};

export const MOCK_SPONSORS: SponsorBanner[] = [
  {
    id: 'ad1',
    partnerName: 'GreenThumb Supplies',
    title: 'Organic Feed Sale',
    description: 'Get 15% off all Layer Pellets this week. Local pickup available.',
    link: '#',
    categoryTarget: 'livestock'
  },
  {
    id: 'ad2',
    partnerName: 'Valley Equipment',
    title: 'Tractor Maintenance',
    description: 'Spring tune-up special. We come to you!',
    link: '#',
    categoryTarget: 'equipment'
  }
];

export const PLANT_LIBRARY = [
  {
    group: 'Root Vegetables',
    items: [
      { name: 'Carrot', spacing: 3, height: 'short', days: 70, germination: 14, plantingMethod: 'direct', weeksRelativeToFrost: -2, varieties: ['Nantes', 'Danvers', 'Imperator', 'Chantenay'] },
      { name: 'Beet', spacing: 4, height: 'short', days: 55, germination: 10, plantingMethod: 'direct', weeksRelativeToFrost: -2, varieties: ['Detroit Dark Red', 'Chioggia', 'Golden'] },
      { name: 'Radish', spacing: 2, height: 'short', days: 25, germination: 5, plantingMethod: 'direct', weeksRelativeToFrost: -4, varieties: ['Cherry Belle', 'French Breakfast', 'Daikon'] },
      { name: 'Potato', spacing: 12, height: 'medium', days: 90, germination: 21, plantingMethod: 'direct', weeksRelativeToFrost: -2, varieties: ['Yukon Gold', 'Russet', 'Red Pontiac'] },
      { name: 'Onion', spacing: 4, height: 'medium', days: 100, germination: 10, plantingMethod: 'transplant', weeksRelativeToFrost: -4, varieties: ['Yellow Sweet', 'Red Baron', 'White Lisbon'] },
      { name: 'Garlic', spacing: 6, height: 'medium', days: 240, germination: 14, plantingMethod: 'direct', weeksRelativeToFrost: -6, varieties: ['Hardneck', 'Softneck'] },
    ]
  },
  {
    group: 'Leafy Greens',
    items: [
      { name: 'Lettuce', spacing: 6, height: 'short', days: 45, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: -4, varieties: ['Butterhead', 'Romaine', 'Iceberg', 'Looseleaf'] },
      { name: 'Spinach', spacing: 4, height: 'short', days: 40, germination: 10, plantingMethod: 'direct', weeksRelativeToFrost: -6, varieties: ['Bloomsdale', 'Savoy'] },
      { name: 'Kale', spacing: 12, height: 'medium', days: 60, germination: 7, plantingMethod: 'transplant', weeksRelativeToFrost: -4, varieties: ['Lacinato', 'Curly', 'Red Russian'] },
      { name: 'Swiss Chard', spacing: 8, height: 'medium', days: 60, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: -2, varieties: ['Bright Lights', 'Fordhook Giant'] },
    ]
  },
  {
    group: 'Fruits & Solanaceae',
    items: [
      { name: 'Tomato', spacing: 24, height: 'tall', days: 75, germination: 7, plantingMethod: 'transplant', weeksRelativeToFrost: 2, varieties: ['Roma', 'Cherry', 'Beefsteak', 'Brandywine', 'San Marzano'] },
      { name: 'Pepper', spacing: 12, height: 'medium', days: 80, germination: 10, plantingMethod: 'transplant', weeksRelativeToFrost: 3, varieties: ['Bell', 'Jalapeno', 'Habanero', 'Cayenne'] },
      { name: 'Eggplant', spacing: 18, height: 'medium', days: 80, germination: 10, plantingMethod: 'transplant', weeksRelativeToFrost: 3, varieties: ['Black Beauty', 'Japanese'] },
      { name: 'Strawberry', spacing: 12, height: 'short', days: 60, germination: 21, plantingMethod: 'transplant', weeksRelativeToFrost: -4, varieties: ['June Bearing', 'Everbearing', 'Alpine'] },
    ]
  },
  {
    group: 'Legumes',
    items: [
      { name: 'Beans (Bush)', spacing: 4, height: 'medium', days: 55, germination: 8, plantingMethod: 'direct', weeksRelativeToFrost: 1, varieties: ['Blue Lake', 'Contender'] },
      { name: 'Beans (Pole)', spacing: 6, height: 'tall', days: 65, germination: 8, plantingMethod: 'direct', weeksRelativeToFrost: 1, varieties: ['Kentucky Wonder', 'Scarlet Runner'] },
      { name: 'Peas', spacing: 3, height: 'medium', days: 60, germination: 10, plantingMethod: 'direct', weeksRelativeToFrost: -4, varieties: ['Sugar Snap', 'Snow Pea', 'Shelling'] },
    ]
  },
  {
    group: 'Cucurbits',
    items: [
      { name: 'Cucumber', spacing: 12, height: 'tall', days: 60, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: 2, varieties: ['Marketmore', 'Lemon', 'Pickling'] },
      { name: 'Zucchini', spacing: 24, height: 'tall', days: 50, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: 2, varieties: ['Black Beauty', 'Golden'] },
      { name: 'Pumpkin', spacing: 36, height: 'short', days: 100, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: 2, varieties: ['Sugar Pie', 'Jack O Lantern'] },
      { name: 'Squash', spacing: 24, height: 'medium', days: 85, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: 2, varieties: ['Butternut', 'Acorn', 'Spaghetti'] },
    ]
  },
  {
    group: 'Other',
    items: [
      { name: 'Corn', spacing: 12, height: 'tall', days: 85, germination: 7, plantingMethod: 'direct', weeksRelativeToFrost: 1, varieties: ['Sweet Corn', 'Popcorn', 'Dent Corn'] },
      { name: 'Basil', spacing: 8, height: 'medium', days: 60, germination: 7, plantingMethod: 'transplant', weeksRelativeToFrost: 2, varieties: ['Genovese', 'Thai', 'Lemon'] },
      { name: 'Sunflower', spacing: 12, height: 'tall', days: 90, germination: 10, plantingMethod: 'direct', weeksRelativeToFrost: 1, varieties: ['Mammoth', 'Teddy Bear'] },
    ]
  }
] as const;

export const ANIMAL_BREEDS: Record<string, string[]> = {
  chicken: ['Rhode Island Red', 'Ameraucana', 'Silkie', 'Leghorn', 'Orpington', 'Barred Rock', 'Wyandotte', 'Sussex', 'Marans'],
  duck: ['Pekin', 'Muscovy', 'Khaki Campbell', 'Runner', 'Rouen', 'Cayuga'],
  goat: ['Nubian', 'Alpine', 'LaMancha', 'Boer', 'Nigerian Dwarf', 'Pygmy', 'Saanen'],
  sheep: ['Merino', 'Dorper', 'Suffolk', 'Hampshire', 'Shetland', 'Katahdin'],
  cattle: ['Angus', 'Hereford', 'Holstein', 'Jersey', 'Highland', 'Dexter'],
  rabbit: ['New Zealand', 'Californian', 'Rex', 'Flemish Giant', 'Holland Lop'],
  pig: ['Berkshire', 'Duroc', 'Hampshire', 'Yorkshire', 'Kune Kune', 'Potbelly'],
  bee: ['Italian', 'Carniolan', 'Russian', 'Buckfast'],
  other: ['Unknown', 'Mix']
};