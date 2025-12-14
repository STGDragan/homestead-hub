

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export type UserRole = 'owner' | 'admin' | 'moderator' | 'contributor' | 'user';

export interface UserProfile extends BaseEntity {
  userId: string;
  name: string;
  email: string;
  zipCode: string;
  hardinessZone: string;
  experienceLevel: ExperienceLevel;
  goals: HomesteadGoal[];
  interests: string[];
  preferences: {
    organicOnly: boolean;
    useMetric: boolean;
    enableNotifications: boolean;
  };
  role: UserRole;
  subscriptionId?: string;
  savedListingIds?: string[];
}

export interface AuthUser extends BaseEntity {
  email: string;
  passwordHash?: string; // Optional for Supabase
  salt?: string;         // Optional for Supabase
  emailVerified: boolean;
  mfaEnabled: boolean;
  status: 'active' | 'suspended';
  lastLogin: number;
  roles: UserRole[];
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceId: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  lastActive: number;
}

export interface AuthDevice extends BaseEntity {
  userId: string;
  name: string;
  type: 'mobile' | 'desktop';
  fingerprint: string;
  lastSeen: number;
  isTrusted: boolean;
}

export interface MfaDevice extends BaseEntity {
  userId: string;
  type: 'totp';
  name: string;
  lastUsed: number;
}

export interface SecurityAuditLog extends BaseEntity {
  userId: string;
  action: string;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  metadata: string;
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
export type BillingInterval = 'month' | 'year' | 'one_time';

export interface SubscriptionPlan extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  durationDays: number;
  features: string[];
  isTrialAllowed: boolean;
  trialDays: number;
  isActive: boolean;
}

export interface Subscription extends BaseEntity {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: number;
  endDate: number;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  providerSubscriptionId?: string;
}

export interface TrialCode extends BaseEntity {
  code: string;
  campaign?: string;
  planId: string;
  durationDays: number;
  expirationDate: number;
  usageLimit: number;
  usageCount: number;
  createdBy: string;
}

export interface SubscriptionLog extends BaseEntity {
  userId: string;
  action: 'activate' | 'renew' | 'cancel' | 'expire' | 'upgrade' | 'downgrade' | 'trial_redeem';
  planId: string;
  previousPlanId?: string;
  notes?: string;
  timestamp: number;
}

export interface FeatureAccessCache extends BaseEntity {
  userId: string;
  features: string[];
  planSlug: string;
  lastChecked: number;
}

// Navigation
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// Garden
export interface PlantTemplate extends BaseEntity {
  name: string;
  defaultVariety: string;
  daysToMaturity: number;
  spacing: number;
  icon: string;
  hardinessZones: number[];
  difficulty: 'beginner' | 'intermediate' | 'expert';
  companions: string[];
  season: Season[];
  height: 'short' | 'medium' | 'tall';
  description?: string;
  careInstructions?: string;
  plantingMethod?: 'direct' | 'transplant' | 'both';
  weeksRelativeToFrost?: number;
  imageUrl?: string;
  fertilizerType?: string;
  fertilizerFrequencyWeeks?: number;
  plantingDepth?: string; // New field for depth instructions
}

export interface GardenBed extends BaseEntity {
  name: string;
  width: number;
  length: number;
  sunExposure: 'full' | 'partial' | 'shade';
  type: 'raised' | 'inground' | 'container';
}

export interface Plant extends BaseEntity {
  bedId: string;
  name: string;
  variety: string;
  plantedDate: number;
  daysToMaturity: number;
  status: 'seeded' | 'growing' | 'harvesting' | 'finished';
  quantity: number;
  x?: number; // percentage
  y?: number; // percentage
}

export interface GardenLog extends BaseEntity {
  bedId: string;
  plantId?: string;
  type: 'water' | 'fertilize' | 'pest' | 'harvest' | 'note';
  date: number;
  content: string;
}

export interface GardenPhoto extends BaseEntity {
  bedId: string;
  blobUrl: string;
  timestamp: number;
  annotations: PhotoAnnotation[];
}

export interface PhotoAnnotation {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'plant' | 'weed' | 'pest' | 'disease' | 'gap';
}

export interface RotationRecord extends BaseEntity {
    bedId: string;
    cropName: string;
    cropFamily: string;
    startDate: number;
    endDate: number;
}

// Livestock
export type SpeciesType = 'chicken' | 'duck' | 'goat' | 'sheep' | 'cattle' | 'rabbit' | 'pig' | 'bee' | 'other';
export type AnimalSex = 'male' | 'female';
export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'archived';

export interface AnimalTemplate extends BaseEntity {
    name: string; // Breed Name e.g. "Rhode Island Red"
    species: SpeciesType;
    description: string;
    gestationDays?: number;
    incubationDays?: number;
    maturityMonths: number;
    hardiness: string; // e.g. "Cold Hardy"
    yieldType: string; // e.g. "Eggs/Meat"
    imageUrl?: string;
}

export interface HerdGroup extends BaseEntity {
  name: string;
  speciesType: SpeciesType;
}

export interface AnimalTypeEntry extends BaseEntity {
  herdGroupId: string;
  typeName: string; // Breed
  quantity: number;
  dailyProduct: string;
}

export interface Animal extends BaseEntity {
    name: string;
    species: SpeciesType;
    breed: string;
    sex: AnimalSex;
    herdId: string;
    dateOfBirth: number;
    sireId?: string;
    damId?: string;
    status: AnimalStatus;
    notes?: string;
    imageUrl?: string;
}

export interface BreedingLog extends BaseEntity {
    sireId: string;
    damId: string;
    matingDate: number;
    status: 'mated' | 'pregnant' | 'birthed' | 'failed';
    notes?: string;
}

export type OffspringStatus = 'active' | 'retained' | 'sold' | 'died' | 'culled';
export type Sex = 'male' | 'female' | 'unknown';

export interface Offspring extends BaseEntity {
    name?: string;
    species: SpeciesType;
    dateOfBirth: number;
    sex: Sex;
    status: OffspringStatus;
    sireId?: string;
    damId?: string;
    birthWeight?: number;
    birthNotes?: string;
}

export interface GrowthLog extends BaseEntity {
    offspringId: string;
    date: number;
    weight: number;
    unit: string;
}

export interface PedigreeNode {
    id: string;
    name: string;
    sex: Sex;
    generation: number;
    sireId?: string;
    damId?: string;
    sire?: PedigreeNode;
    dam?: PedigreeNode;
}

export interface ProductionLog extends BaseEntity {
  herdGroupId: string;
  date: number;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface FeedLog extends BaseEntity {
  herdGroupId: string;
  date: number;
  quantity: number;
  unit: string;
  type: string;
}

export interface MedicalLog extends BaseEntity {
    // Legacy? Or generic
    animalId?: string;
    herdGroupId?: string;
    date: number;
    type: string;
    notes: string;
}

export interface LossLog extends BaseEntity {
    animalId?: string;
    herdGroupId?: string;
    date: number;
    reason: string;
    count: number;
}

export type MedRoute = 'subcutaneous' | 'intramuscular' | 'oral' | 'topical' | 'intravenous';

export interface Medication extends BaseEntity {
    name: string;
    commonName?: string;
    activeIngredient: string;
    form: 'injectable' | 'oral' | 'topical';
    speciesGuidance: Record<string, {
        dosageMgPerKg: number;
        frequencyPerDay: number;
        maxDays: number;
        contraindicatedPregnancy: boolean;
    }>;
    withdrawalPeriods: Record<string, {
        milkDays: number;
        meatDays: number;
        eggsDays: number;
    }>;
    notes?: string;
    isArchived: boolean;
}

export interface MedAdminLog extends BaseEntity {
    animalId: string;
    medicationId: string;
    administeredBy: string;
    administeredAt: number;
    doseAmount: number;
    doseUnit: string;
    route: MedRoute;
    site?: string;
    batchNumber?: string;
    notes?: string;
}

export interface VetVisit extends BaseEntity {
    animalId: string;
    vetId?: string;
    date: number;
    reason: string;
    diagnosis?: string;
    treatment?: string;
    cost?: number;
    followUpDate?: number;
    notes?: string;
}

export interface WithdrawalFlag extends BaseEntity {
    animalId: string;
    medicationId: string;
    medAdminLogId: string;
    startDate: number;
    endDate: number;
    productAffected: 'milk' | 'meat' | 'eggs';
    resolved: boolean;
}

// Tasks
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
export type TaskCategory = 'garden' | 'livestock' | 'orchard' | 'apiary' | 'maintenance' | 'preserving' | 'admin' | 'other';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

export interface Task extends BaseEntity {
  title: string;
  description: string;
  season: Season;
  category: TaskCategory;
  dueDate: number | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical'; // updated priority types to match usage
  isRecurring: boolean;
  recurrencePattern: RecurrenceType;
}

// Notification Task (generated by system)
export interface NotificationTask extends Task {
    userId: string;
    breedingEventId?: string; // Optional link
    type: 'due_date' | 'pregnancy_check' | 'vet_visit' | 'medication_dose' | 'vaccination' | 'weaning' | 'general';
    scheduledAt: number; // same as dueDate basically
    status: 'pending' | 'completed' | 'dismissed';
    notes: string;
}

// Health
export type HealthSubjectType = 'plant' | 'animal';

export interface HealthRecord extends BaseEntity {
  subjectType: HealthSubjectType;
  photoBlobUrl: string;
  status: 'analyzing' | 'completed' | 'failed' | 'pending_upload';
  diagnosis?: DiagnosisResult;
}

export interface DiagnosisResult {
  issueName: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  treatments: { title: string; description: string; organic: boolean }[];
}

// Finances
export type ExpenseCategory = 'feed' | 'seeds' | 'equipment' | 'infrastructure' | 'medical' | 'labor' | 'utilities' | 'other';

export interface Expense extends BaseEntity {
  amount: number;
  date: number;
  category: ExpenseCategory;
  description: string;
  allocationType?: 'general' | 'herd' | 'bed';
  allocationId?: string;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceType;
  receiptUrl?: string; // New: Image URL for receipt/invoice
}

export interface Invoice extends BaseEntity {
    sponsorId: string;
    campaignId: string;
    amountCents: number;
    currency: string;
    status: 'issued' | 'paid' | 'void' | 'overdue';
    dueDate: number;
    paidAt?: number;
    notes?: string;
}

// Kitchen
export interface Recipe extends BaseEntity {
  title: string;
  instructions: string;
  prepTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  tags: string[];
  imageUrl?: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string; // 'produce' | 'pantry' ...
}

export type MeasurementUnit = 'count' | 'lb' | 'oz' | 'kg' | 'g' | 'cup' | 'tbsp' | 'tsp' | 'bunch' | 'frame';

export interface PantryItem extends BaseEntity {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

// Journal
export interface SeedPacket extends BaseEntity {
  variety: string;
  plantType: string;
  brand?: string;
  quantityRemaining: number;
  quantityUnit: 'count' | 'grams' | 'packets';
  daysToGerminate: number;
  expirationYear?: number;
  notes?: string;
  germinationTests?: GerminationTest[];
  archived: boolean;
  tags: string[];
  imageUrl?: string;
}

export interface GerminationTest {
    date: number;
    seedsPlanted: number;
    seedsSprouted: number;
    rate: number;
    notes?: string;
}

export interface JournalEntry extends BaseEntity {
  date: number;
  title: string;
  content: string;
  tags: string[];
  images: string[];
}

export interface PlantingLog extends BaseEntity {
    seedLotId: string;
    bedId: string;
    plantingDate: number;
    spacing: number;
    quantity: number;
    notes?: string;
}

export interface HarvestLog extends BaseEntity {
    bedId: string;
    cropName: string;
    quantity: number;
    unit: string;
    harvestDate: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
}

// Weather
export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'clear';

export interface WeatherForecast {
  date: number;
  tempHigh: number;
  tempLow: number;
  condition: WeatherCondition;
  precipChance: number;
  humidity: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  level: 'watch' | 'warning' | 'advisory';
  type: 'frost' | 'storm' | 'heat' | 'wind';
  effectiveStart: number;
  effectiveEnd: number;
  isActive: boolean;
}

// Sensors
export interface Sensor extends BaseEntity {
    name: string;
    location?: string;
    type: 'temp_humidity' | 'soil_moisture' | 'light';
    lastSync: number;
    batteryLevel?: number;
    status?: 'online' | 'offline';
}

export interface SensorDevice extends BaseEntity {
    integrationId: string;
    externalId: string;
    name: string;
    type: string;
    location?: string;
    status: 'online' | 'offline' | 'error';
    lastReading?: number;
    lastReadingAt?: number;
}

export interface SensorReading extends BaseEntity {
    sensorId: string;
    timestamp: number;
    value: number;
    unit: string;
    type: string;
}

// Marketplace
export type ListingType = 'sale' | 'trade' | 'free';
export type MarketCategory = 'produce' | 'seeds' | 'livestock' | 'equipment' | 'labor' | 'other';

export interface MarketplaceItem extends BaseEntity {
  title: string;
  description: string;
  type: ListingType;
  category: MarketCategory;
  price?: number;
  tradeRequirements?: string;
  location: string;
  images: string[];
  status: 'active' | 'sold' | 'expired' | 'draft';
  ownerId: string;
}

export interface TradeOffer extends BaseEntity {
  listingId: string;
  sellerId: string;
  buyerId: string;
  offeredItems?: string[]; // IDs of user's listings offered in trade
  offeredMoney?: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

// Ads / Sponsors
export interface Sponsor extends BaseEntity {
    name: string;
    contactName: string;
    contactEmail: string;
    status: 'lead' | 'active' | 'inactive';
}

export interface SponsorBanner {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  link: string;
  categoryTarget: string;
}

export interface AdCampaign extends BaseEntity {
    sponsorId: string;
    title: string;
    type: CampaignType;
    placements: string[];
    startDate: number;
    endDate: number;
    priority: number;
    status: AdStatus;
    priceCents: number;
    billingModel: 'flat' | 'cpm' | 'cpc';
    creatives: AdCreative[];
}

export type CampaignType = 'banner' | 'sponsor_block' | 'product_tile' | 'seasonal_panel';
export type AdStatus = 'draft' | 'reviewing' | 'approved' | 'active' | 'paused' | 'completed' | 'billing';

export interface AdCreative {
    id: string;
    fileUrl: string;
    clickUrl: string;
    altText: string;
    format: string;
    approved: boolean;
    rejectionReason?: string;
}

export interface AdEvent extends BaseEntity {
    type: 'impression' | 'click';
    campaignId: string;
    creativeId: string;
    placementId: string;
    timestamp: number;
    offlineFlag: boolean;
}

export interface AdPlacementConfig {
    id: string;
    label: string;
    recommendedSize: string;
}

// AI & Automation
export interface Recommendation extends BaseEntity {
  userId: string;
  module: 'garden' | 'animals' | 'tasks' | 'orchard' | 'apiary';
  type: string;
  title: string;
  description: string;
  reasoning: string;
  confidenceScore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionPayload?: any;
  isDismissed: boolean;
  isApplied: boolean;
}

export interface AIFeedback extends BaseEntity {
    userId: string;
    recommendationId: string;
    action: 'applied' | 'dismissed' | 'rated';
    rating?: number;
}

export interface AIPreference extends BaseEntity {
    userId: string;
    enabledModules: {
        garden: boolean;
        animals: boolean;
        tasks: boolean;
        orchard: boolean;
        apiary: boolean;
    };
    aggressiveness: 'conservative' | 'balanced' | 'proactive';
    autoSync: boolean;
}

export interface PairRecommendation {
    id: string;
    userId: string;
    candidateSireId: string;
    candidateDamId: string;
    score: number;
    inbreedingCoefficient: number;
    traitImpacts: Record<string, number>;
    reasons: string[];
    confidence: number;
    createdAt: number;
    generatedBy: string;
    synced: boolean;
}

export interface TraitProfile extends BaseEntity {
    name: string;
    targetTraits: GeneticTrait[];
}

export interface GeneticTrait {
    name: string;
    weight: number; // Importance -1 to 1
}

// Sync
export interface SyncQueueItem {
  id: string;
  storeName: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'failed';
  retryCount: number;
  error?: string;
}

export interface ConflictLog {
    id: string;
    storeName: string;
    recordId: string;
    localVersion: any;
    remoteVersion: any;
    detectedAt: number;
    resolved: boolean;
    resolvedAt?: number;
    resolution?: 'local_wins' | 'remote_wins' | 'manual_merge';
}

export interface SyncStatusMeta {
    lastSyncTimestamp: number;
    status: 'online' | 'offline' | 'syncing' | 'error';
    pendingCount: number;
}

// Integrations
export type IntegrationType = 'weather' | 'sensor_hardware' | 'market_feed' | 'seed_catalog' | 'animal_registry' | 'ai_engine';

export interface IntegrationConfig extends BaseEntity {
    name: string;
    provider: string; // e.g. 'openweathermap'
    type: IntegrationType;
    status: 'active' | 'inactive' | 'error';
    settings: Record<string, any>;
    lastSyncAt: number;
    errorCount: number;
    lastErrorMessage?: string;
}

export interface IntegrationLog extends BaseEntity {
    integrationId: string;
    action: 'sync' | 'error' | 'config_change';
    status: 'success' | 'failure';
    details: string;
    durationMs?: number;
}

// Data Transfer / Reports
export type ExportScope = 'full' | 'garden' | 'livestock' | 'tasks' | 'finances' | 'orchard' | 'apiary';
export type ExportFormat = 'json' | 'csv';
export type PiiPreference = 'REDACT' | 'ANONYMIZE' | 'INCLUDE';
export type ReportType = 'MEDICAL_PACK' | 'LINEAGE_TRACE' | 'BREEDING_KPI' | 'SALES_REPORT';
export type ImportConflictStrategy = 'skip' | 'overwrite' | 'copy';

export interface DataExportRecord extends BaseEntity {
    userId: string;
    scope: ExportScope;
    format: ExportFormat;
    recordCount: number;
    fileSize: number;
    fileName: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface DataImportRecord extends BaseEntity {
    userId: string;
    fileName: string;
    scope: ExportScope;
    recordCount: number;
    conflictStrategy: ImportConflictStrategy;
    status: 'completed' | 'failed';
}

export interface ExportArchive {
    // Placeholder if used elsewhere, usually just the blob
    id: string;
}

export interface AuditLog extends BaseEntity {
    action: string;
    entityType: string; // 'user', 'animal', 'system'
    entityId: string;
    details: string;
    performedBy: string;
}

export interface AdminStat {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
}

export interface FlaggedItem {
    id: string;
    targetId: string;
    targetType: 'listing' | 'comment' | 'user';
    reason: string;
    reportedBy: string;
    timestamp: number;
    status: 'pending' | 'resolved' | 'dismissed';
}

// Constants / UI Helpers
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type HomesteadGoal = 'self-sufficiency' | 'hobby' | 'profit' | 'education';

export interface DocPage {
  id: string;
  title: string;
  sections: { id: string; title: string; content: string }[];
  sops?: SOP[];
}

export interface SOP {
  id: string;
  title: string;
  role: string[];
  steps: string[];
}

export interface HelpArticle extends BaseEntity {
    categoryId: string;
    title: string;
    excerpt: string;
    content: string;
    createdBy: string;
}

// Orchard
export type TreeStatus = 'ordered' | 'planted' | 'growing' | 'mature' | 'producing' | 'declining' | 'dead' | 'removed';
export type RootstockType = 'standard' | 'semi-dwarf' | 'dwarf';
export type TreeEventType = 'note' | 'pruning' | 'fertilizing' | 'pest_control' | 'flowering' | 'fruiting';

export interface OrchardTree extends BaseEntity {
    species: string;
    variety: string;
    rootstock: RootstockType;
    plantedDate: number;
    ageYears: number;
    location: { x: number, y: number }; // percentage coords
    status: TreeStatus;
    imageUrl?: string;
}

export interface TreeLog extends BaseEntity {
    treeId: string;
    type: TreeEventType;
    date: number;
    notes: string;
}

export interface TreeYield extends BaseEntity {
    treeId: string;
    harvestDate: number;
    weight: number;
    unit: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    notes?: string;
}

// Yard Map
export type YardItemType = 'structure' | 'zone' | 'infrastructure' | 'decoration';

export interface YardItem extends BaseEntity {
    type: YardItemType;
    label: string; // e.g. "Main Barn"
    subType: string; // e.g. "barn"
    x: number; // grid x
    y: number; // grid y
    width: number; // grid width
    height: number; // grid height
    color: string;
    rotation?: number; // 0, 90, 180, 270
    entityId?: string; // Optional link to actual data entity (e.g. GardenBed.id)
}

// Apiary
export type HiveType = 'langstroth' | 'top_bar' | 'warre' | 'flow' | 'other';
export type BeeBreed = 'italian' | 'carniolan' | 'russian' | 'buckfast' | 'unknown';

export interface Hive extends BaseEntity {
    name: string;
    type: HiveType;
    queenBreed: BeeBreed;
    installedDate: number;
    location: { x: number, y: number };
    status: 'active' | 'collapsed' | 'sold' | 'stored';
}

export interface HiveInspection extends BaseEntity {
    hiveId: string;
    date: number;
    queenSeen: boolean;
    eggsSeen: boolean;
    broodPattern: 'solid' | 'spotty' | 'none';
    population: 'low' | 'medium' | 'high' | 'crowded';
    temperament: 'calm' | 'nervous' | 'aggressive';
    stores: 'low' | 'medium' | 'high';
    miteCount?: number;
    notes?: string;
}

export interface HiveProduction extends BaseEntity {
    hiveId: string;
    date: number;
    product: 'honey' | 'wax' | 'pollen' | 'propolis';
    quantity: number;
    unit: string;
    batchCode?: string;
    notes?: string;
}

// Library / Community
export interface PlantDiscussion extends BaseEntity {
    plantName: string;
    userId: string;
    userName: string;
    content: string;
    likes: number;
}

// Messaging
export interface Message extends BaseEntity {
    threadId: string;
    senderId: string;
    content: string;
    readBy: string[];
    status: 'sending' | 'sent' | 'delivered' | 'failed';
}

export interface MessageThread extends BaseEntity {
    participantIds: string[];
    lastMessageText: string;
    lastMessageAt: number;
    isGroup: boolean;
    name?: string;
}

// Notifications
export type NotificationType = 'task' | 'alert' | 'social' | 'system' | 'breeding' | 'marketing';

export interface Notification extends BaseEntity {
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    link?: string;
    read: boolean;
    priority: 'low' | 'normal' | 'high';
}

export interface NotificationPreference extends BaseEntity {
    userId: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
    categories: {
        task: boolean;
        breeding: boolean;
        system: boolean;
        marketing: boolean;
    };
}