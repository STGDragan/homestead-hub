

export type SyncStatus = 'synced' | 'pending' | 'failed';

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

// --- DATA EXPORT / IMPORT ---

export type ExportScope = 'full' | 'garden' | 'livestock' | 'tasks' | 'finances' | 'orchard' | 'apiary';
export type ExportFormat = 'json' | 'csv';
export type ImportConflictStrategy = 'skip' | 'overwrite' | 'copy';

export interface DataExportRecord extends BaseEntity {
  userId: string;
  scope: ExportScope;
  format: ExportFormat;
  recordCount: number;
  fileSize: number;
  fileName: string;
  status: 'completed' | 'failed';
}

export interface DataImportRecord extends BaseEntity {
  userId: string;
  fileName: string;
  scope: ExportScope; // Inferred from file
  recordCount: number;
  conflictStrategy: ImportConflictStrategy;
  status: 'analyzing' | 'completed' | 'failed';
  details?: string;
}

// --- INTEGRATIONS MODULE ---

export type IntegrationType = 'weather' | 'seed_catalog' | 'animal_registry' | 'sensor_hardware' | 'market_feed';
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'syncing';

export interface IntegrationConfig extends BaseEntity {
  name: string;
  provider: string; // e.g., 'openweathermap', 'baker_creek', 'mqtt_gateway'
  type: IntegrationType;
  status: IntegrationStatus;
  settings: Record<string, any>; // Stores API Keys, Endpoints, etc.
  lastSyncAt: number;
  errorCount: number;
  lastErrorMessage?: string;
  scheduleIntervalMinutes?: number;
}

export interface IntegrationLog extends BaseEntity {
  integrationId: string;
  action: 'sync' | 'config_update' | 'error';
  status: 'success' | 'failure';
  details: string;
  durationMs?: number;
}

export interface SensorDevice extends BaseEntity {
  integrationId: string; // Link to the hardware integration
  externalId: string; // ID from the device itself
  name: string;
  type: 'temp' | 'humidity' | 'moisture' | 'gps' | 'generic';
  location?: string;
  lastReading?: number;
  lastReadingAt?: number;
  unit?: string;
  status: 'online' | 'offline';
}

// --- SYNC ENGINE TYPES ---

export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id: string; // UUID
  storeName: string;
  recordId: string;
  operation: SyncOperation;
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
  id: string; // 'global' or module name
  lastSyncedAt: number;
  pendingCount: number;
  isOnline: boolean;
}

// --- AUTH & IDENTITY TYPES ---

export type UserRole = 'owner' | 'admin' | 'moderator' | 'contributor' | 'user';
export type AuthProviderType = 'email' | 'google' | 'github' | 'magic_link';

export interface AuthUser extends BaseEntity {
  email: string;
  passwordHash?: string; // Null if using only OAuth/MagicLink
  salt?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  status: 'active' | 'suspended' | 'archived';
  lastLogin: number;
  roles: UserRole[];
}

export interface UserProfile extends BaseEntity {
  userId: string; // Link to AuthUser
  name: string;
  email?: string; // Denormalized for display
  zipCode: string;
  hardinessZone: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  goals: string[]; // HomesteadGoal[]
  interests: string[];
  preferences: {
    organicOnly: boolean;
    useMetric: boolean;
    enableNotifications: boolean;
  };
  savedListingIds?: string[]; // Added for favorites
  subscriptionId?: string;
  role?: UserRole; // Legacy support
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceId: string;
  token: string; // Access Token
  refreshToken: string; // Refresh Token (HttpOnly in real app, stored securely)
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
  lastActive: number;
}

export interface AuthDevice extends BaseEntity {
  userId: string;
  name: string; // e.g. "Chrome on MacOS"
  type: 'desktop' | 'mobile' | 'tablet';
  fingerprint: string;
  lastSeen: number;
  isTrusted: boolean;
  pushToken?: string;
}

export interface MfaDevice extends BaseEntity {
  userId: string;
  type: 'totp' | 'passkey' | 'sms';
  name: string; // e.g. "Authenticator App"
  secret?: string; // Encrypted in real DB
  lastUsed: number;
}

export interface SecurityAuditLog extends BaseEntity {
  userId?: string;
  action: 'login' | 'logout' | 'register' | 'mfa_enable' | 'mfa_disable' | 'password_change' | 'session_revoke' | 'impersonate' | 'EXPORT_SHARE' | 'DATA_ACCESS' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  metadata?: string;
}

// --- SUBSCRIPTION SYSTEM ---

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
export type BillingInterval = 'month' | 'year' | 'one_time';

export interface SubscriptionPlan extends BaseEntity {
  name: string;
  slug: string; // e.g. 'free', 'pro', 'farm'
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  durationDays: number; // 30 for month, 365 for year
  features: string[]; // ['ai_agents', 'advanced_reports', 'marketplace_selling']
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
  providerSubscriptionId?: string; // Stripe ID
}

export interface TrialCode extends BaseEntity {
  code: string;
  planId: string; // Plan to unlock
  durationDays: number;
  expirationDate: number; // When the code itself expires
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

export interface FeatureAccessCache {
  userId: string;
  features: string[]; // List of enabled features
  planSlug: string;
  lastChecked: number;
}

// --- AI & RECOMMENDATIONS ---

export type RecommendationType = 'garden_action' | 'livestock_health' | 'schedule_optimization' | 'content_suggestion' | 'orchard_care' | 'hive_health';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Recommendation extends BaseEntity {
  userId: string;
  module: 'garden' | 'animals' | 'tasks' | 'general' | 'orchard' | 'apiary';
  type: RecommendationType;
  title: string;
  description: string;
  reasoning: string; // Explainability text
  confidenceScore: number; // 0 to 100
  priority: RecommendationPriority;
  actionPayload?: any; // JSON data to perform an action (e.g., create task object)
  isDismissed: boolean;
  isApplied: boolean;
}

export interface AIFeedback extends BaseEntity {
  userId: string;
  recommendationId: string;
  action: 'applied' | 'dismissed' | 'rated';
  rating?: number; // 1-5
  comment?: string;
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

// --- MESSAGING & NOTIFICATIONS ---

export interface MessageThread extends BaseEntity {
  participantIds: string[]; // User IDs
  groupName?: string; // If group chat
  lastMessageText: string;
  lastMessageAt: number;
  isGroup: boolean;
  unreadCount?: number; // Calculated field
}

export interface Message extends BaseEntity {
  threadId: string;
  senderId: string;
  content: string;
  attachments?: { type: 'image' | 'file'; url: string; name: string }[];
  readBy: string[]; // User IDs who have read this
  status: 'sending' | 'sent' | 'delivered' | 'failed';
}

export type NotificationType = 'system' | 'alert' | 'task' | 'social';

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string; // Internal route link
  read: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface NotificationPreference extends BaseEntity {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "07:00"
  categories: {
    task: boolean;
    breeding: boolean;
    system: boolean;
    marketing: boolean;
  };
}

// ... Existing Types ...
export type SpeciesType = 'chicken' | 'duck' | 'goat' | 'sheep' | 'cattle' | 'rabbit' | 'pig' | 'bee' | 'other';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
export type TaskCategory = 'garden' | 'livestock' | 'maintenance' | 'preserving' | 'admin' | 'orchard' | 'apiary' | 'other';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type HomesteadGoal = 'self-sufficiency' | 'hobby' | 'profit' | 'education';
export type ExpenseCategory = 'feed' | 'seeds' | 'equipment' | 'infrastructure' | 'medical' | 'labor' | 'utilities' | 'other';
export type MarketCategory = 'produce' | 'seeds' | 'livestock' | 'equipment' | 'labor' | 'other';
export type ListingType = 'sale' | 'trade' | 'free';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type MeasurementUnit = 'count' | 'lb' | 'oz' | 'kg' | 'g' | 'cup' | 'tbsp' | 'tsp' | 'bunch' | 'frame';
export type HealthSubjectType = 'plant' | 'animal';

// --- ORCHARD MODULE ---

export type TreeStatus = 'planted' | 'growing' | 'mature' | 'diseased' | 'dead' | 'removed';
export type TreeEventType = 'planting' | 'pruning' | 'fertilizing' | 'pest_control' | 'flowering' | 'fruiting' | 'note';
export type RootstockType = 'standard' | 'semi-dwarf' | 'dwarf';

export interface OrchardTree extends BaseEntity {
  species: string; // Apple, Pear, Peach, etc.
  variety: string; // Honeycrisp, Bartlett
  rootstock: RootstockType;
  pollinationGroup?: string; // A, B, C etc.
  plantedDate: number;
  ageYears: number; // Calculated or stored
  location: { x: number; y: number }; // Relative coordinates 0-100% on map
  status: TreeStatus;
  notes?: string;
  imageUrl?: string;
}

export interface TreeLog extends BaseEntity {
  treeId: string;
  type: TreeEventType;
  date: number;
  notes: string;
  images?: string[]; // Blob URLs
}

export interface TreeYield extends BaseEntity {
  treeId: string;
  harvestDate: number;
  weight: number;
  unit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

// --- BEEKEEPING MODULE ---

export type HiveType = 'langstroth' | 'top_bar' | 'warre' | 'flow' | 'other';
export type BeeBreed = 'italian' | 'carniolan' | 'russian' | 'buckfast' | 'unknown';
export type HiveStatus = 'active' | 'dead' | 'sold' | 'swarmed' | 'stored';

export interface Hive extends BaseEntity {
  name: string;
  type: HiveType;
  queenBreed: BeeBreed;
  queenHatchDate?: number;
  installedDate: number;
  location: { x: number; y: number; description?: string };
  status: HiveStatus;
  notes?: string;
  imageUrl?: string;
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
  images?: string[];
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

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  season: Season;
  category: TaskCategory;
  dueDate: number | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  recurrencePattern: RecurrenceType;
}

export interface Invoice extends BaseEntity {
  userId: string;
  subscriptionId?: string;
  amountCents: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  pdfUrl?: string;
  providerInvoiceId: string;
}

export interface Sponsor extends BaseEntity {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  billingAddress?: string;
  status: 'lead' | 'active' | 'churned';
  notes?: string;
}

export type AdStatus = 'draft' | 'pending' | 'active' | 'paused' | 'ended';
export type CampaignType = 'banner' | 'sponsor_block' | 'product_tile' | 'seasonal_panel';
export type AdFormat = 'banner' | 'card' | 'interstitial';
export type BillingModel = 'flat' | 'cpm' | 'cpc';

export interface AdCampaign extends BaseEntity {
  sponsorId: string;
  title: string;
  type: CampaignType;
  placements: string[];
  startDate: number;
  endDate: number;
  impressionCap?: number;
  clickCap?: number;
  priority: number;
  status: AdStatus;
  priceCents: number;
  billingModel: BillingModel;
  creatives: AdCreative[];
  targetUrl?: string;
  metadata?: Record<string, any>;
}

export interface AdCreative {
  id: string;
  fileUrl: string;
  clickUrl: string;
  altText: string;
  format: AdFormat;
  approved: boolean;
}

export interface AdEvent extends BaseEntity {
  type: 'impression' | 'click';
  campaignId: string;
  creativeId: string;
  placementId: string;
  userId?: string;
  timestamp: number;
  offlineFlag: boolean;
}

export interface AdPlacementConfig {
  id: string; 
  name: string;
  allowedTypes: CampaignType[];
}

export interface PlantTemplate {
  id: string;
  name: string;
  defaultVariety: string;
  daysToMaturity: number;
  spacing: number;
  icon: string;
  hardinessZones: number[];
  difficulty: ExperienceLevel;
  companions: string[];
  season: Season[];
  height: 'short' | 'medium' | 'tall';
  imageUrl?: string;
  description?: string;
  careInstructions?: string;
  plantingMethod?: 'direct' | 'transplant' | 'both';
  weeksRelativeToFrost?: number;
}

export interface Plant extends BaseEntity {
  bedId: string;
  name: string;
  variety: string;
  plantedDate: number;
  daysToMaturity: number;
  status: 'seeded' | 'growing' | 'harvesting' | 'finished';
  quantity: number;
  x?: number;
  y?: number;
}

export interface GardenBed extends BaseEntity {
  name: string;
  width: number;
  length: number;
  sunExposure: 'full' | 'partial' | 'shade';
  type: 'raised' | 'ground' | 'container';
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
  type: 'plant' | 'weed' | 'pest' | 'gap';
}

export interface SeedPacket extends BaseEntity {
  variety: string;
  plantType: string;
  brand: string;
  quantityRemaining: number;
  quantityUnit: 'count' | 'grams' | 'packets';
  daysToGerminate: number;
  expirationYear?: number;
  notes?: string;
  germinationTests?: GerminationTest[];
  archived?: boolean;
  tags?: string[];
  imageUrl?: string;
}

export interface GerminationTest {
  date: number;
  seedsPlanted: number;
  seedsSprouted: number;
  rate: number;
  notes?: string;
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

export interface JournalEntry extends BaseEntity {
  date: number;
  title: string;
  content: string;
  tags: string[];
  images: string[];
}

export interface RotationRecord extends BaseEntity {
  bedId: string;
  cropName: string;
  cropFamily: string;
  startDate: number;
  endDate: number;
}

export type AnimalSex = 'male' | 'female';
export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'archived';

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

export interface HerdGroup extends BaseEntity {
  name: string;
  speciesType: SpeciesType;
  description?: string;
}

export interface AnimalTypeEntry extends BaseEntity {
  herdGroupId: string;
  typeName: string;
  quantity: number;
  dailyProduct: string;
}

export interface BreedingLog extends BaseEntity {
  sireId: string;
  damId: string;
  matingDate: number;
  dueDate?: number;
  status: 'mated' | 'pregnant' | 'birthed';
  notes?: string;
}

export type OffspringStatus = 'active' | 'retained' | 'sold' | 'died' | 'culled' | 'butchered';
export type Sex = 'male' | 'female' | 'unknown';

export interface Offspring extends BaseEntity {
  name?: string;
  species: SpeciesType;
  sireId?: string;
  damId?: string;
  dateOfBirth: number;
  sex: Sex;
  birthWeight?: number;
  birthNotes?: string;
  status: OffspringStatus;
}

export interface GrowthLog extends BaseEntity {
  offspringId: string;
  date: number;
  weight: number;
  unit: string;
  notes?: string;
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
  type: string;
  cost?: number;
}

export interface MedicalLog extends BaseEntity {
  animalId?: string;
  herdGroupId?: string;
  date: number;
  treatment: string;
  cost?: number;
  notes?: string;
}

export interface LossLog extends BaseEntity {
  animalId?: string;
  herdGroupId?: string;
  date: number;
  reason: string;
  notes?: string;
}

export interface NotificationTask extends BaseEntity {
  userId: string;
  animalId?: string;
  breedingEventId?: string;
  type: 'pregnancy_check' | 'vet_visit' | 'due_date' | 'weaning' | 'vaccination' | 'medication_dose';
  status: 'pending' | 'completed' | 'snoozed' | 'escalated';
  scheduledAt: number;
  dueWindowStart?: number;
  dueWindowEnd?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  notes?: string;
  meta?: any;
}

export interface AlertLog extends BaseEntity {
  taskId?: string;
  eventType: 'generated' | 'delivered' | 'escalated';
  level: 'info' | 'warning' | 'critical';
  message: string;
}

export interface EscalationRule {
  id: string;
  species: SpeciesType;
  triggerType: string;
  thresholdDays: number;
  action: 'notify_admin' | 'call_vet';
}

export interface VetContact extends BaseEntity {
  name: string;
  phone: string;
  clinicName?: string;
  email?: string;
  notes?: string;
}

export type MedForm = 'tablet' | 'liquid' | 'injectable' | 'topical' | 'powder';
export type MedRoute = 'oral' | 'subcutaneous' | 'intramuscular' | 'intravenous' | 'topical';
export type PrescriptionStatus = 'active' | 'completed' | 'stopped';
export type MedicalRecordType = 'vaccination' | 'illness' | 'surgery' | 'allergy' | 'checkup' | 'note';
export type ProductType = 'milk' | 'eggs' | 'meat';

export interface Medication extends BaseEntity {
  name: string;
  commonName?: string;
  activeIngredient: string;
  form: MedForm;
  speciesGuidance: Record<string, {
    dosageMgPerKg: number;
    frequencyPerDay: number;
    maxDays: number;
    contraindicatedPregnancy: boolean;
  }>;
  withdrawalPeriods: Record<string, {
    milkDays: number;
    eggsDays: number;
    meatDays: number;
  }>;
  notes?: string;
  isArchived: boolean;
}

export interface Prescription extends BaseEntity {
  vetId?: string;
  userId: string;
  animalId: string;
  medicationId: string;
  medicationNameSnapshot: string;
  dosage: string;
  route: MedRoute;
  frequency: string;
  durationDays: number;
  startDate: number;
  endDate: number;
  notes?: string;
  status: PrescriptionStatus;
}

export interface MedAdminLog extends BaseEntity {
  prescriptionId?: string;
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
  nextDue?: number;
}

export interface VetVisit extends BaseEntity {
  animalId: string;
  vetId?: string;
  date: number;
  reason: string;
  diagnosis?: string;
  procedures: string[];
  attachmentIds: string[];
  followUpRequired: boolean;
  followUpDate?: number;
  notes?: string;
  cost?: number; 
}

export interface MedicalRecord extends BaseEntity {
  animalId: string;
  recordType: MedicalRecordType;
  title: string;
  description: string;
  date: number;
  attachmentIds: string[];
  performedBy: string;
}

export interface WithdrawalFlag extends BaseEntity {
  animalId: string;
  medicationId: string;
  medAdminLogId: string;
  startDate: number;
  endDate: number;
  productAffected: ProductType;
  notes?: string;
  resolved: boolean; 
  overrideReason?: string;
  overrideBy?: string;
}

export interface Expense extends BaseEntity {
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: number;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceType;
  allocationType?: 'general' | 'herd' | 'bed';
  allocationId?: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface Recipe extends BaseEntity {
  title: string;
  instructions: string;
  prepTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  imageUrl?: string;
  tags: string[];
}

export interface PantryItem extends BaseEntity {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

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
  level: 'advisory' | 'watch' | 'warning';
  type: 'frost' | 'storm' | 'heat' | 'wind';
  effectiveStart: number;
  effectiveEnd: number;
  isActive: boolean;
}

export interface Sensor extends BaseEntity {
  name: string;
  location: string;
  type: string;
  lastSync: number;
  batteryLevel: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}

export interface SensorReading extends BaseEntity {
  sensorId: string;
  timestamp: number;
  value: number;
  unit: string;
  type: string;
}

export interface HealthRecord extends BaseEntity {
  subjectType: HealthSubjectType;
  photoBlobUrl: string;
  status: 'analyzing' | 'completed' | 'failed' | 'pending_upload';
  diagnosis?: DiagnosisResult;
  notes?: string;
}

export interface DiagnosisResult {
  issueName: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  treatments: TreatmentSuggestion[];
}

export interface TreatmentSuggestion {
  title: string;
  description: string;
  organic: boolean;
}

export interface MarketplaceItem extends BaseEntity {
  title: string;
  description: string;
  type: ListingType;
  category: MarketCategory;
  price?: number;
  tradeRequirements?: string;
  location: string;
  images: string[];
  ownerId: string;
  status: 'active' | 'sold' | 'archived';
}

export interface TradeOffer extends BaseEntity {
  listingId: string;
  sellerId: string;
  buyerId: string;
  offeredItems?: string[];
  offeredMoney?: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface SponsorBanner {
  id: string;
  partnerName: string;
  title: string;
  description: string;
  link: string;
  categoryTarget: string;
}

export interface AdminStat {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface FlaggedItem {
  id: string;
  targetId: string;
  targetType: 'listing' | 'user' | 'post';
  reason: string;
  reportedBy: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface DocPage {
  id: string;
  title: string;
  sections: DocSection[];
  sops?: SOP[];
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export interface SOP {
  id: string;
  title: string;
  role: UserRole[];
  steps: string[];
}

export interface GeneticTrait {
  id: string;
  name: string;
  description?: string;
}

export interface TraitProfile {
  trait: string;
  preference: 'high' | 'low' | 'avoid';
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

export interface HelpArticle extends BaseEntity {
  categoryId: string;
  title: string;
  excerpt: string;
  content: string;
  createdBy: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  articles?: HelpArticle[]; // Legacy support or joined view
}

export interface PlantDiscussion extends BaseEntity {
  plantName: string;
  userId: string;
  userName: string; // Denormalized for offline speed
  content: string;
  likes: number;
  isOfficial?: boolean; // If true, it's a "note" from the system or admin
}

export type ReportType = 'BREEDING_KPI' | 'MEDICAL_PACK' | 'LINEAGE_TRACE' | 'SALES_REPORT' | 'REGULATORY_TRACE';
export type DeliveryChannel = 'EMAIL' | 'ADMIN_DOWNLOAD' | 'SFTP';
export type PiiPreference = 'REDACT' | 'ANONYMIZE' | 'INCLUDE';

export interface ReportSchedule extends BaseEntity {
  farmId: string;
  userId: string;
  reportType: ReportType;
  cronExpression: string;
  config: Record<string, any>;
  deliveryChannels: DeliveryChannel[];
  piiPreference: PiiPreference;
  isActive: boolean;
}

export interface ReportRun extends BaseEntity {
  scheduleId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startedAt: number;
  completedAt?: number;
  artifactId?: string;
  errorLog?: string;
}

export interface ExportArchive extends BaseEntity {
  farmId: string;
  generatedBy: string;
  fileType: 'PDF' | 'CSV' | 'ZIP';
  fileName: string;
  fileSizeBytes: number;
  fileHash: string;
  signature?: string;
  piiStatus: PiiPreference;
  downloadCount: number;
  expirationDate: number;
}

export interface ConsentLog extends BaseEntity {
  userId: string;
  action: 'EXPORT_SHARE' | 'DATA_ACCESS';
  targetEntity: string;
  dataScope: string[];
  consentedAt: number;
  ipAddress?: string;
}

export interface AuditLog extends BaseEntity {
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
  performedBy: string;
  details: string;
}