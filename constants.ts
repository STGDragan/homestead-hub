
import { NavItem, PlantTemplate, SpeciesType, Season, TaskCategory, DiagnosisResult, ExpenseCategory, MarketCategory, ExperienceLevel, HomesteadGoal, SponsorBanner, DocPage, Medication, RecurrenceType, AnimalTemplate } from './types';

// *** SECURITY CONFIG ***
// Replace this with your actual email to gain Owner permissions.
// In a production app, this would be an environment variable or backend logic.
export const OWNER_EMAIL = "travisddr@gmail.com"; 

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/tasks' },
  { id: 'garden', label: 'Garden', icon: 'Sprout', path: '/garden' },
  { id: 'animals', label: 'Livestock', icon: 'PawPrint', path: '/animals' },
  { id: 'marketplace', label: 'Marketplace', icon: 'Store', path: '/marketplace' },
  { id: 'recipes', label: 'Kitchen', icon: 'Utensils', path: '/recipes' },
  { id: 'finances', label: 'Finances', icon: 'DollarSign', path: '/finances' },
  { id: 'health', label: 'Health', icon: 'Stethoscope', path: '/health' },
  { id: 'weather', label: 'Weather', icon: 'CloudSun', path: '/weather' },
  { id: 'library', label: 'Library', icon: 'Book', path: '/library' },
  { id: 'reports', label: 'Reports', icon: 'FileBarChart', path: '/reports' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
  { id: 'help', label: 'Help', icon: 'HelpCircle', path: '/help' },
];

export const INTEGRATION_SETUP_GUIDES: Record<string, { title: string, description: string, fields: string[] }> = {
    'openweathermap': {
        title: 'OpenWeatherMap Connection',
        description: 'Required for dashboard weather widgets and frost alerts. \n1. Go to openweathermap.org and sign up. \n2. Generate an API Key under "My API Keys". \n3. Paste the key below.',
        fields: ['API Key (Required)', 'Endpoint (Optional, defaults to standard API)']
    },
    'mqtt_gateway': {
        title: 'IoT Sensor Gateway (MQTT)',
        description: 'Connects to local hardware sensors (ESP32, Raspberry Pi) for greenhouse monitoring. \n1. Ensure your MQTT Broker is accessible via WebSocket (wss://). \n2. Enter the broker URL and topic structure.',
        fields: ['Endpoint URL (wss://...)', 'Username/Password (if secured)']
    },
    'market_feed': {
        title: 'USDA Market Pricing Feed',
        description: 'Fetches regional commodity pricing to help price your marketplace items. \n1. Requires a Data.gov API key. \n2. Configures daily sync for localized crop prices.',
        fields: ['API Key', 'Region Code (e.g. US-MW)']
    },
    'stripe_connect': {
        title: 'Payment Gateway (Stripe)',
        description: 'Enables subscription billing and marketplace payments. \n1. Enter your Stripe Publishable Key and Secret Key (Test Mode recommended first).',
        fields: ['Publishable Key', 'Secret Key', 'Webhook Secret']
    },
    'google_gemini': {
        title: 'Google Gemini AI',
        description: 'Enables advanced AI features including plant diagnostics, recipe generation, and smart gardening advice. \n1. Visit aistudio.google.com to generate an API key. \n2. Ensure your key has access to Gemini 1.5 Flash or Pro models.',
        fields: ['API Key (Required)']
    }
};

export const COMMON_PLANTS: PlantTemplate[] = [
  { 
    id: 'p1', name: 'Tomato', defaultVariety: 'Roma', daysToMaturity: 75, spacing: 18, icon: 'Circle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'intermediate', companions: ['p10', 'p3'], season: ['summer'], height: 'tall',
    description: "A staple warm-season crop. Determinate varieties like Roma are bushier, while indeterminate varieties grow as vines.",
    careInstructions: "Plant deep, burying the stem to encourage roots. Stake early. Water consistently to prevent blossom end rot. Feed with low-nitrogen fertilizer.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p2', name: 'Lettuce', defaultVariety: 'Butterhead', daysToMaturity: 45, spacing: 6, icon: 'Cloud',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p3', 'p14'], season: ['spring', 'fall'], height: 'short',
    description: "Cool-season leafy green. Grows quickly and is perfect for succession planting.",
    careInstructions: "Keep soil consistently moist. Harvest outer leaves for continuous yield or cut whole head. Needs shade in deep summer heat.",
    plantingMethod: 'direct', weeksRelativeToFrost: -4,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p3', name: 'Carrot', defaultVariety: 'Nantes', daysToMaturity: 70, spacing: 3, icon: 'Triangle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'intermediate', companions: ['p1', 'p2', 'p11'], season: ['spring', 'fall'], height: 'short',
    description: "Sweet root vegetable rich in Vitamin A. Nantes varieties are cylindrical and sweet.",
    careInstructions: "Requires loose, sandy soil free of rocks to grow straight. Keep seed bed moist during germination (1-2 weeks). Thin seedlings to 3 inches.",
    plantingMethod: 'direct', weeksRelativeToFrost: -2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p4', name: 'Pepper', defaultVariety: 'Bell', daysToMaturity: 80, spacing: 12, icon: 'Hexagon',
    hardinessZones: [4, 5, 6, 7, 8, 9, 10, 11], difficulty: 'intermediate', companions: ['p10', 'p1'], season: ['summer'], height: 'medium',
    description: "Crunchy, sweet, or spicy fruits. Peppers love heat and sun.",
    careInstructions: "Transplant only after soil warms up. Magnesium (Epsom salts) can help growth. Stake if heavy with fruit.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 3,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p5', name: 'Beans', defaultVariety: 'Bush Blue Lake', daysToMaturity: 55, spacing: 4, icon: 'Square',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p3', 'p13'], season: ['summer'], height: 'medium',
    description: "Productive legume that fixes nitrogen in the soil. Bush varieties do not need trellising.",
    careInstructions: "Direct sow after frost. Do not disturb roots. Harvest frequently to encourage continued production.",
    plantingMethod: 'direct', weeksRelativeToFrost: 1,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p6', name: 'Radish', defaultVariety: 'Cherry Belle', daysToMaturity: 25, spacing: 2, icon: 'Circle',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p2', 'p5'], season: ['spring', 'fall'], height: 'short',
    description: "Super fast growing root crop. Great for kids and impatient gardeners.",
    careInstructions: "Sow thinly. Harvest promptly when mature; they get woody if left too long. Spicy flavor increases with heat.",
    plantingMethod: 'direct', weeksRelativeToFrost: -4,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p7', name: 'Spinach', defaultVariety: 'Bloomsdale', daysToMaturity: 40, spacing: 4, icon: 'Cloud',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p14', 'p5'], season: ['spring', 'fall', 'winter'], height: 'short',
    description: "Nutrient-dense green that loves cold weather. Bloomsdale has crinkled, savory leaves.",
    careInstructions: "Plant very early spring or late fall. Bolting occurs as days lengthen; harvest young.",
    plantingMethod: 'direct', weeksRelativeToFrost: -6,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p8', name: 'Zucchini', defaultVariety: 'Black Beauty', daysToMaturity: 50, spacing: 24, icon: 'Hexagon',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p5', 'p12'], season: ['summer'], height: 'tall',
    description: "Prolific summer squash. One or two plants are usually enough for a family.",
    careInstructions: "Watch for squash bugs and powdery mildew. Water at the base. Harvest when 6-8 inches long for best flavor.",
    plantingMethod: 'direct', weeksRelativeToFrost: 2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p9', name: 'Kale', defaultVariety: 'Lacinato', daysToMaturity: 60, spacing: 12, icon: 'Cloud',
    hardinessZones: [2, 3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p11', 'p13'], season: ['spring', 'fall', 'winter'], height: 'medium',
    description: "Hardy brassica also known as Dinosaur Kale. Sweetens after a frost.",
    careInstructions: "Very cold hardy. Watch for cabbage worms (white butterflies). Mulch to keep soil cool.",
    plantingMethod: 'transplant', weeksRelativeToFrost: -4,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p10', name: 'Basil', defaultVariety: 'Genovese', daysToMaturity: 60, spacing: 8, icon: 'Leaf',
    hardinessZones: [4, 5, 6, 7, 8, 9, 10], difficulty: 'beginner', companions: ['p1', 'p4'], season: ['summer'], height: 'medium',
    description: "Aromatic herb essential for pesto and tomato dishes.",
    careInstructions: "Pinch off flower heads to keep plant bushy and producing leaves. Hates cold; plant only when nights are warm.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p11', name: 'Onion', defaultVariety: 'Yellow Sweet', daysToMaturity: 100, spacing: 4, icon: 'Circle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9], difficulty: 'intermediate', companions: ['p3', 'p2'], season: ['summer'], height: 'medium',
    description: "Day-length sensitive bulbs. Choose long-day for north, short-day for south.",
    careInstructions: "Keep weed-free; onions don't compete well. Stop watering when tops fall over to cure bulbs.",
    plantingMethod: 'transplant', weeksRelativeToFrost: -4,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p12', name: 'Corn', defaultVariety: 'Sweet Corn', daysToMaturity: 85, spacing: 12, icon: 'Triangle',
    hardinessZones: [4, 5, 6, 7, 8, 9], difficulty: 'intermediate', companions: ['p5', 'p8'], season: ['summer'], height: 'tall',
    description: "Tall grass crop needing wind for pollination. Plant in blocks, not single rows.",
    careInstructions: "Heavy feeder; requires nitrogen-rich soil. Water deeply during tasseling/silking.",
    plantingMethod: 'direct', weeksRelativeToFrost: 1,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p13', name: 'Potato', defaultVariety: 'Yukon Gold', daysToMaturity: 90, spacing: 12, icon: 'Circle',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9], difficulty: 'beginner', companions: ['p5', 'p12'], season: ['summer', 'fall'], height: 'medium',
    description: "Starchy tuber. Yukon Gold is a versatile, buttery yellow variety.",
    careInstructions: "Plant seed potatoes in trenches. 'Hill' soil around stems as they grow to prevent green tubers. Harvest after vines die back.",
    plantingMethod: 'direct', weeksRelativeToFrost: -2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  { 
    id: 'p14', name: 'Strawberry', defaultVariety: 'June Bearing', daysToMaturity: 60, spacing: 12, icon: 'Heart',
    hardinessZones: [3, 4, 5, 6, 7, 8, 9, 10], difficulty: 'intermediate', companions: ['p2', 'p7'], season: ['spring'], height: 'short',
    description: "Perennial fruit. June bearers produce one large crop in early summer.",
    careInstructions: "Mulch with straw to keep berries clean. Remove runners to focus energy on fruit. Replace plants every 3-4 years.",
    plantingMethod: 'transplant', weeksRelativeToFrost: -4,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  }
];

export const COMMON_ANIMALS: AnimalTemplate[] = [
    {
        id: 'a1', name: 'Rhode Island Red', species: 'chicken',
        description: "The classic dual-purpose chicken. Hardy, productive, and adaptable to various climates. Excellent layers of large brown eggs.",
        gestationDays: 21, incubationDays: 21, maturityMonths: 6, hardiness: "Cold Hardy", yieldType: "Eggs/Meat",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a2', name: 'Silkie', species: 'chicken',
        description: "Unique fluffy plumage and gentle temperament. Great mothers (broody) and pets, but lower egg production.",
        gestationDays: 21, incubationDays: 21, maturityMonths: 7, hardiness: "Fair", yieldType: "Ornamental",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a3', name: 'Nubian', species: 'goat',
        description: "Large dairy goat known for high butterfat milk and floppy ears. Can be vocal.",
        gestationDays: 150, maturityMonths: 8, hardiness: "Moderate", yieldType: "Milk",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a4', name: 'Nigerian Dwarf', species: 'goat',
        description: "Miniature dairy goat. Produces high quality milk in a manageable size. Great for small homesteads.",
        gestationDays: 145, maturityMonths: 7, hardiness: "Hardy", yieldType: "Milk",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a5', name: 'Angus', species: 'cattle',
        description: "Most popular beef breed. Known for marbling and mothering ability. Naturally polled (no horns).",
        gestationDays: 283, maturityMonths: 15, hardiness: "Hardy", yieldType: "Meat",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a6', name: 'Jersey', species: 'cattle',
        description: "Small dairy breed famous for rich, creamy milk. Docile temperament but bulls can be aggressive.",
        gestationDays: 283, maturityMonths: 15, hardiness: "Moderate", yieldType: "Milk",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a7', name: 'Berkshire', species: 'pig',
        description: "Heritage breed known for 'Kurobuta' pork. Excellent flavor and marbling. Black with white points.",
        gestationDays: 114, maturityMonths: 6, hardiness: "Hardy", yieldType: "Meat",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a8', name: 'Dorper', species: 'sheep',
        description: "Hair sheep (no shearing required). Fast growing and hardy meat breed.",
        gestationDays: 147, maturityMonths: 7, hardiness: "Hardy", yieldType: "Meat",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a9', name: 'Rex', species: 'rabbit',
        description: "Known for plush, velvet-like fur. Good meat to bone ratio.",
        gestationDays: 31, maturityMonths: 6, hardiness: "Hardy", yieldType: "Meat/Fur",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'a10', name: 'Italian', species: 'bee',
        description: "Most popular honey bee. Gentle, prolific brood producers, excellent foragers.",
        gestationDays: 0, maturityMonths: 0, hardiness: "Moderate", yieldType: "Honey",
        createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    }
];

export const BENEFICIAL_PLANTS: PlantTemplate[] = [
  {
    id: 'ben1', name: 'Marigold', defaultVariety: 'French', daysToMaturity: 50, spacing: 6, icon: 'Heart',
    hardinessZones: [2,3,4,5,6,7,8,9,10,11], difficulty: 'beginner', companions: [], season: ['spring', 'summer'], height: 'short',
    description: "Bright flowers that deter nematodes and other pests.",
    careInstructions: "Deadhead spent blooms to encourage more flowers. Very hardy.",
    plantingMethod: 'direct', weeksRelativeToFrost: 1,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  {
    id: 'ben2', name: 'Nasturtium', defaultVariety: 'Jewel Mix', daysToMaturity: 55, spacing: 8, icon: 'Heart',
    hardinessZones: [4,5,6,7,8,9,10], difficulty: 'beginner', companions: [], season: ['spring', 'summer'], height: 'short',
    description: "Edible flowers and leaves with a peppery taste. Acts as a trap crop for aphids.",
    careInstructions: "Thrives in poor soil. Do not over-fertilize or you'll get leaves but no flowers.",
    plantingMethod: 'direct', weeksRelativeToFrost: -1,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  {
    id: 'ben3', name: 'Borage', defaultVariety: 'Blue', daysToMaturity: 60, spacing: 12, icon: 'Leaf',
    hardinessZones: [3,4,5,6,7,8,9,10], difficulty: 'beginner', companions: [], season: ['spring', 'summer'], height: 'medium',
    description: "Star-shaped blue flowers that attract bees like magnets. Edible.",
    careInstructions: "Self-seeds aggressively. Plant where you want it to stay forever.",
    plantingMethod: 'direct', weeksRelativeToFrost: -2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  },
  {
    id: 'ben4', name: 'Lavender', defaultVariety: 'English', daysToMaturity: 90, spacing: 12, icon: 'Sprout',
    hardinessZones: [5,6,7,8,9], difficulty: 'intermediate', companions: [], season: ['summer'], height: 'medium',
    description: "Fragrant perennial herb. Attracts pollinators and repels moths.",
    careInstructions: "Needs excellent drainage and full sun. Prune in spring to prevent woodiness.",
    plantingMethod: 'transplant', weeksRelativeToFrost: 2,
    createdAt: 0, updatedAt: 0, syncStatus: 'synced'
  }
];

export const SEASONS: { id: Season | 'all', label: string }[] = [
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'fall', label: 'Fall' },
  { id: 'winter', label: 'Winter' },
  { id: 'all', label: 'Anytime' },
];

export const TASK_CATEGORIES: { id: TaskCategory, label: string }[] = [
  { id: 'garden', label: 'Garden' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'orchard', label: 'Orchard' },
  { id: 'apiary', label: 'Apiary' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'preserving', label: 'Preserving' },
  { id: 'admin', label: 'Admin' },
  { id: 'other', label: 'Other' },
];

export const EXPENSE_CATEGORIES: { id: ExpenseCategory, label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'seeds', label: 'Seeds & Plants' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'medical', label: 'Medical' },
  { id: 'labor', label: 'Labor' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'other', label: 'Other' },
];

export const MARKET_CATEGORIES: { id: MarketCategory | 'all', label: string }[] = [
  { id: 'produce', label: 'Produce' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'labor', label: 'Labor' },
  { id: 'other', label: 'Other' },
];

export const EXPERIENCE_LEVELS: { id: ExperienceLevel, label: string, description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out. Focus on basics.' },
  { id: 'intermediate', label: 'Intermediate', description: 'Growing for a few seasons. Optimizing.' },
  { id: 'expert', label: 'Expert', description: 'Experienced homesteader. Scaling up.' },
];

export const HOMESTEAD_GOALS: { id: HomesteadGoal, label: string }[] = [
  { id: 'self-sufficiency', label: 'Self-Sufficiency' },
  { id: 'hobby', label: 'Hobby & Fun' },
  { id: 'profit', label: 'Profit / Market' },
  { id: 'education', label: 'Education' },
];

export const MEASUREMENT_UNITS: { value: string, label: string }[] = [
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

export const ANIMAL_SPECIES: { id: SpeciesType, label: string }[] = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'duck', label: 'Duck' },
  { id: 'goat', label: 'Goat' },
  { id: 'sheep', label: 'Sheep' },
  { id: 'cattle', label: 'Cattle' },
  { id: 'pig', label: 'Pig' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'bee', label: 'Bees' },
  { id: 'other', label: 'Other' },
];

export const ANIMAL_BREEDS: Record<string, string[]> = {
  chicken: [
    'Ameraucana', 'Australorp', 'Barred Rock', 'Brahma', 'Buff Orpington', 'Cochin', 
    'Cornish Cross', 'Delaware', 'Easter Egger', 'Favorelles', 'Jersey Giant', 
    'Leghorn', 'Marans', 'New Hampshire Red', 'Olive Egger', 'Orpington', 
    'Plymouth Rock', 'Polish', 'Rhode Island Red', 'Silkie', 'Sussex', 
    'Wyandotte', 'Welsummer', 'Unknown / Mix'
  ],
  duck: [
    'Ancona', 'Buff', 'Call', 'Cayuga', 'Indian Runner', 'Khaki Campbell', 
    'Magpie', 'Mallard', 'Muscovy', 'Pekin', 'Rouen', 'Saxony', 
    'Swedish Blue', 'Welsh Harlequin', 'Unknown / Mix'
  ],
  goat: [
    'Alpine', 'Angora', 'Boer', 'Kiko', 'LaMancha', 'Myotonic (Fainting)', 
    'Nigerian Dwarf', 'Nubian', 'Oberhasli', 'Pygmy', 'Saanen', 
    'Sable', 'Spanish', 'Toggenburg', 'Unknown / Mix'
  ],
  sheep: [
    'Babydoll Southdown', 'Border Leicester', 'Cheviot', 'Columbia', 'Corriedale', 
    'Dorper', 'Dorset', 'Finnsheep', 'Hampshire', 'Icelandic', 
    'Jacob', 'Katahdin', 'Lincoln', 'Merino', 'Navajo-Churro', 
    'Polypay', 'Rambouillet', 'Romney', 'Shetland', 'Suffolk', 
    'Tunis', 'Valais Blacknose', 'Unknown / Mix'
  ],
  cattle: [
    'Angus', 'Ayrshire', 'Belted Galloway', 'Brahman', 'Brown Swiss', 
    'Charolais', 'Dexter', 'Guernsey', 'Hereford', 'Highland', 
    'Holstein', 'Jersey', 'Limousin', 'Longhorn', 'Miniature Zebu', 
    'Red Poll', 'Shorthorn', 'Simmental', 'Wagyu', 'Unknown / Mix'
  ],
  pig: [
    'American Guinea Hog', 'Berkshire', 'Chester White', 'Duroc', 'Hampshire', 
    'Hereford', 'Idaho Pasture', 'KuneKune', 'Landrace', 'Large Black', 
    'Mangalitsa', 'Meishan', 'Ossabaw Island', 'Poland China', 
    'Potbelly', 'Red Wattle', 'Spotted', 'Tamworth', 'Yorkshire', 'Unknown / Mix'
  ],
  rabbit: [
    'American Chinchilla', 'Angora', 'Californian', 'Checkered Giant', 
    'Dutch', 'Flemish Giant', 'Florida White', 'Harlequin', 'Havana', 
    'Himalayan', 'Holland Lop', 'Lionhead', 'Mini Lop', 'Mini Rex', 
    'Netherland Dwarf', 'New Zealand', 'Palomino', 'Rex', 'Satin', 
    'Silver Fox', 'Tan', 'Unknown / Mix'
  ],
  bee: [
    'Buckfast', 'Carniolan', 'Caucasian', 'German (Black)', 'Italian', 
    'Russian', 'Saskatraz', 'Africanized', 'Unknown / Wild'
  ],
  other: [
    'Alpaca', 'Donkey', 'Emu', 'Goose', 'Guinea Fowl', 'Horse', 
    'Llama', 'Mule', 'Ostrich', 'Peacock', 'Quail', 'Turkey', 
    'Yak', 'Unknown'
  ],
};

export const PLANT_LIBRARY = [
  { 
    group: 'Vegetables', 
    items: [
      { name: 'Tomato', varieties: ['Roma', 'Cherry', 'Beefsteak', 'Heirloom'], germination: 7 },
      { name: 'Pepper', varieties: ['Bell', 'Jalapeno', 'Habanero', 'Cayenne'], germination: 10 },
      { name: 'Lettuce', varieties: ['Romaine', 'Butterhead', 'Iceberg', 'Looseleaf'], germination: 5 },
      { name: 'Carrot', varieties: ['Nantes', 'Danvers', 'Imperator', 'Chantenay'], germination: 14 },
    ] 
  },
  { 
    group: 'Herbs', 
    items: [
      { name: 'Basil', varieties: ['Genovese', 'Thai', 'Lemon', 'Purple'], germination: 7 },
      { name: 'Parsley', varieties: ['Curly', 'Flat Leaf'], germination: 21 },
      { name: 'Cilantro', varieties: ['Santo', 'Leisure'], germination: 10 },
    ] 
  },
  { 
    group: 'Fruits', 
    items: [
      { name: 'Strawberry', varieties: ['June Bearing', 'Everbearing'], germination: 21 },
      { name: 'Watermelon', varieties: ['Sugar Baby', 'Crimson Sweet'], germination: 8 },
    ] 
  }
];

export const MOCK_DIAGNOSES = {
  plant: [
    { issueName: 'Early Blight', probability: 85, severity: 'medium', description: 'Fungal infection causing target-like spots on leaves.', treatments: [{ title: 'Prune', description: 'Remove affected leaves immediately.', organic: true }, { title: 'Fungicide', description: 'Apply copper fungicide.', organic: true }] },
    { issueName: 'Healthy', probability: 98, severity: 'low', description: 'Plant appears healthy and vigorous.', treatments: [] },
    { issueName: 'Aphid Infestation', probability: 90, severity: 'medium', description: 'Small soft-bodied insects sucking sap.', treatments: [{ title: 'Neem Oil', description: 'Spray with neem oil solution.', organic: true }] }
  ],
  animal: [
    { issueName: 'Scaly Leg Mites', probability: 80, severity: 'medium', description: 'Mites burrowing under leg scales.', treatments: [{ title: 'Oil Treatment', description: 'Coat legs in vegetable oil to suffocate mites.', organic: true }] },
    { issueName: 'Healthy', probability: 95, severity: 'low', description: 'Animal appears healthy.', treatments: [] },
    { issueName: 'Bumblefoot', probability: 75, severity: 'high', description: 'Staph infection on foot pad.', treatments: [{ title: 'Soak & Wrap', description: 'Soak in epsom salts, apply antiseptic and wrap.', organic: true }] }
  ]
} as any; // Cast to avoid strict type checking on mock data structure if DiagnosisResult differs slightly

export const ADMIN_DOCS_CONTENT: DocPage[] = [
  {
    id: 'runbook',
    title: 'Operations Runbook',
    sections: [
        { id: '1', title: 'Daily Checks', content: '1. Review system logs for sync errors.\n2. Check flag queue for new reports.\n3. Verify scheduled backups ran successfully.' },
        { id: '2', title: 'Backup Procedures', content: 'Full exports are automated weekly. Manual exports available in Settings > Data Management.\n\nTo restore:\n1. Download latest JSON backup.\n2. Go to Settings > Data > Import.\n3. Select "Overwrite" strategy to restore state.' },
        { id: '3', title: 'Library Management', content: 'Admins can maintain the "System Library" which populates the default choices for all users.\n\n- Go to Admin > Library.\n- Add new Plants or Animal Breeds.\n- These are read-only for users but can be cloned into custom entries.' }
    ],
    sops: [
        { id: 'sop1', title: 'Handling User Reports', role: ['moderator'], steps: ['Review reported content in "Moderation" tab', 'Check user history for repeated offenses', 'Take action: Dismiss if invalid, or Remove Content/Ban User if policy violated.'] },
        { id: 'sop2', title: 'Approving Ads', role: ['admin'], steps: ['Navigate to Admin > Campaigns', 'Review draft campaigns', 'Check creative assets for policy compliance', 'Set status to Active to launch.'] }
    ]
  },
  {
    id: 'subscriptions',
    title: 'Subscription Management',
    sections: [
        { id: '1', title: 'Creating Plans', content: 'Navigate to Admin > Billing > Subscription Plans. Create new tiers with unique slugs (e.g. "pro_yearly"). Define feature flags in the "Features" list (comma separated).' },
        { id: '2', title: 'Discount Codes', content: 'Create codes in the "Discount Codes" tab. Set usage limits and expiration dates. Codes link to specific plans and override the billing step.' }
    ]
  },
  {
    id: 'sponsors',
    title: 'Sponsor & Ad CRM',
    sections: [
        { id: '1', title: 'Lead Tracking', content: 'Use the "Sponsors" tab to track potential advertisers. Status moves from Lead -> Active -> Inactive.' },
        { id: '2', title: 'Campaign Configuration', content: 'Campaigns link a Sponsor to Ad Placements. Set CPM/Flat Rate and duration. The system automatically rotates active ads based on priority weighting.' }
    ]
  }
];

export const USER_HELP_CONTENT = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        articles: [
            { 
                id: 'h1', 
                title: 'Welcome to Homestead Hub', 
                excerpt: 'Your digital farm companion.',
                content: `Welcome! Homestead Hub is an offline-first tool designed to help you manage your land, animals, and tasks anywhere—even without a cell signal.\n\n**Core Concepts:**\n- **Offline First:** Your data lives on your device. We sync it to the cloud when you connect, but you never need internet to work.\n- **Modules:** The app is split into focused areas: Garden, Livestock, Orchard, etc.\n- **Dashboard:** Your daily command center showing weather alerts and due tasks.\n\nTo get started, check out the **Settings > Profile** area to set your Zone and Experience Level.`
            },
            { 
                id: 'h2', 
                title: 'Offline Sync Explained', 
                excerpt: 'How data saves without internet.',
                content: `**The Sync Indicator**\nLook for the circular arrow or cloud icon in the top right.\n- **Green/Check:** You are online and fully synced.\n- **Spinning:** Uploading changes.\n- **Red/Cloud Off:** You are offline. Changes are saved locally to a "Queue".\n\n**Conflict Resolution:**\nIf you edit the same item on two devices while offline, the "Sync Engine" will detect a conflict. Visit **Settings > Integrations > Sync Dashboard** to resolve these manually.`
            },
            {
                id: 'h3', 
                title: 'Profile & Zone', 
                excerpt: 'Setting your location.',
                content: `Go to **Settings > Profile** to set your Zip Code. We automatically calculate your **USDA Hardiness Zone**. This zone is used by the Garden Planner to suggest planting dates and frost warnings.`
            }
        ]
    },
    {
        id: 'garden-orchard',
        title: 'Garden & Orchard',
        articles: [
            { 
                id: 'h4', 
                title: 'Using the Layout Tool', 
                excerpt: 'Plan your raised beds visually.',
                content: `1. Create a **Garden Bed** in the Garden Dashboard.\n2. Click "Layout Tool".\n3. Select a plant from the sidebar (Paint Mode).\n4. Click on the grid squares to plant.\n\n**Tools:**\n- **Paint:** Click grid to add plant.\n- **Eraser:** Click to remove.\n- **Inspect:** Click to view plant details.\n\n**Auto-Fill:** Use the "Wand" icon to let AI suggest a companion planting layout based on your zone and beneficial insect needs.`
            },
            {
                id: 'h5',
                title: 'Orchard Mapping',
                excerpt: 'Tracking your trees.',
                content: `Navigate to **Orchard**. Switch to "Map View" to see a visual plot of your trees. Click "Add Tree" and tap the map to place a sapling.\n\nThe system automatically generates **seasonal pruning tasks** based on the tree species and age. Use the **Log Event** button to track pruning, fertilizing, and pest control.`
            },
            {
                id: 'h5_1',
                title: 'Custom Plants',
                excerpt: 'Adding your own varieties.',
                content: `Don't see your plant in the library? Click **+ Add Custom Plant** in the Garden Dashboard or Library. You can upload a photo and define spacing/days to maturity. Custom plants are saved to your personal library and synced across devices.`
            }
        ]
    },
    {
        id: 'livestock',
        title: 'Livestock & Bees',
        articles: [
            { 
                id: 'h6', 
                title: 'Herds vs. Individuals', 
                excerpt: 'How to organize animals.',
                content: `**Herd Groups:** Use for bulk animals (e.g. "Laying Hens", "Meat Rabbits"). Track total counts, bulk feed, and daily egg/meat production totals.\n\n**Individual Animals:** Create profiles for breeding stock (e.g. "Bessie the Cow"). Track specific lineage, medical history, mating events, and weight curves.`
            },
            {
                id: 'h7',
                title: 'Medical & Withdrawal',
                excerpt: 'Safety compliance features.',
                content: `When you administer medication (via the "Medical" tab on an animal profile), the system checks for **Withdrawal Periods**.\n\nIf a med has a milk/meat withdrawal time, a **Red Alert** will appear on the animal's dashboard until the safety date passes. Always consult your vet label, but use this tool to track compliance.`
            },
            {
                id: 'h7_1',
                title: 'Breeding & Lineage',
                excerpt: 'Tracking genetics.',
                content: `Use the **Reproduction** dashboard to log matings. The system calculates due dates based on species gestation periods and creates "Pregnancy Check" tasks.\n\n**Pedigrees:** When viewing an animal or offspring, the "Lineage" tab visualizes parents and grandparents to help you avoid inbreeding.`
            },
            {
                id: 'h8',
                title: 'Apiary Inspections',
                excerpt: 'Managing hives.',
                content: `Log inspections in the **Apiary** module. Record queen status, brood pattern, and mite counts. The system analyzes your notes (e.g. "No eggs seen") to suggest follow-up tasks, like "Check for Queen" or "Feed Sugar Syrup".\n\nUse the Map View to visualize hive placement in your yard.`
            }
        ]
    },
    {
        id: 'home-market',
        title: 'Home & Market',
        articles: [
            { 
                id: 'h9', 
                title: 'Kitchen & Pantry', 
                excerpt: 'Cooking what you grow.',
                content: `Log your harvests into the **Pantry**. The **Kitchen AI** suggests recipes based on what you currently have in stock vs. what needs to be used up. You can create custom recipes or use the AI to import them.`
            },
            {
                id: 'h10',
                title: 'Financial Analysis',
                excerpt: 'Tracking ROI.',
                content: `Log expenses in the **Finances** tab. You can allocate costs to specific **Herds** or **Garden Beds**.\n\nVisit the **Cost Analysis** widget to see your "Cost per Unit" (e.g. Cost per Dozen Eggs) based on feed expenses vs. production logs. This helps you determine profitable pricing for the Marketplace.`
            },
            {
                id: 'h11',
                title: 'Marketplace Trading',
                excerpt: 'Barter with neighbors.',
                content: `Post surplus items in the **Marketplace**. You can list items for "Sale", "Trade", or "Free". Use the "Make Offer" button to propose a barter (e.g. "My 12 eggs for your Firewood").\n\n**Saved Items:** Click the heart icon to save listings for later.`
            }
        ]
    },
    {
        id: 'advanced',
        title: 'Advanced Features',
        articles: [
            { 
                id: 'h12', 
                title: 'AI Diagnostics', 
                excerpt: 'Identifying pests and diseases.',
                content: `Go to **Health > New Scan**. Take a photo of a sick plant or animal. Our AI analyzes the image to suggest a diagnosis (e.g. "Early Blight") and organic treatments.\n\n*Note: Always consult a vet for serious livestock issues. This tool is for educational purposes.*`
            },
            {
                id: 'h13',
                title: 'Data Export & Compliance',
                excerpt: 'Backups and records.',
                content: `You own your data. Go to **Settings > Data > Export** to download a JSON backup or a CSV report.\n\n**Regulatory Reports:** Use the "Medical Pack" or "Lineage Trace" export presets to generate CSVs suitable for organic certification or herd book audits.`
            }
        ]
    }
];

export const MOCK_MEDICATIONS: Medication[] = [
    {
        id: 'med1', name: 'Ivermectin 1%', activeIngredient: 'Ivermectin', form: 'injectable',
        speciesGuidance: { 'cattle': { dosageMgPerKg: 0.2, frequencyPerDay: 1, maxDays: 1, contraindicatedPregnancy: false } },
        withdrawalPeriods: { 'cattle': { milkDays: 35, meatDays: 35, eggsDays: 0 } },
        notes: 'For parasites.', isArchived: false, createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    },
    {
        id: 'med2', name: 'Oxytetracycline 200', activeIngredient: 'Oxytetracycline', form: 'injectable',
        speciesGuidance: { 'cattle': { dosageMgPerKg: 20, frequencyPerDay: 1, maxDays: 1, contraindicatedPregnancy: false } },
        withdrawalPeriods: { 'cattle': { milkDays: 96, meatDays: 28, eggsDays: 0 } }, // hours usually, simplified to days here? keeping days per interface
        notes: 'Antibiotic.', isArchived: false, createdAt: 0, updatedAt: 0, syncStatus: 'synced'
    }
];

export const AD_PLACEMENT_AREAS = [
    { id: 'dashboard_top_banner', label: 'Dashboard Top' },
    { id: 'dashboard_feature_block', label: 'Dashboard Feature' },
    { id: 'feed_inline', label: 'Marketplace Feed' },
    { id: 'seasonal_panel', label: 'Seasonal Panel' },
    { id: 'footer_banner', label: 'Footer' },
];

export const CAMPAIGN_TYPES = [
    { id: 'banner', label: 'Banner' },
    { id: 'sponsor_block', label: 'Sponsor Block' },
    { id: 'product_tile', label: 'Product Tile' },
    { id: 'seasonal_panel', label: 'Seasonal Panel' },
];

export const TREE_SPECIES = [
    { id: 'apple', label: 'Apple' },
    { id: 'pear', label: 'Pear' },
    { id: 'peach', label: 'Peach' },
    { id: 'cherry', label: 'Cherry' },
    { id: 'plum', label: 'Plum' },
    { id: 'fig', label: 'Fig' },
    { id: 'citrus', label: 'Citrus (Lemon/Lime/Orange)' },
];

export const ROOTSTOCKS = [
    { id: 'standard', label: 'Standard (Full Size)' },
    { id: 'semi-dwarf', label: 'Semi-Dwarf' },
    { id: 'dwarf', label: 'Dwarf' },
];

export const HIVE_TYPES = [
    { id: 'langstroth', label: 'Langstroth' },
    { id: 'top_bar', label: 'Top Bar' },
    { id: 'warre', label: 'Warre' },
    { id: 'flow', label: 'Flow Hive' },
];

export const BEE_BREEDS = [
    { id: 'italian', label: 'Italian' },
    { id: 'carniolan', label: 'Carniolan' },
    { id: 'russian', label: 'Russian' },
    { id: 'buckfast', label: 'Buckfast' },
    { id: 'unknown', label: 'Unknown / Wild' },
];
