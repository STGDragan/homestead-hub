
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Server, Database, Smartphone, Palette, Brain, Layers, Lock, GitBranch, Link as LinkIcon, CreditCard, DollarSign } from 'lucide-react';

type DocTab = 'architecture' | 'api' | 'ui' | 'ai' | 'modules' | 'security';

export const DocumentationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocTab>('architecture');

  const renderArchitecture = () => (
    <div className="space-y-6 animate-in fade-in">
      <Card className="bg-earth-900 text-white border-none">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Server size={20} className="text-leaf-400"/> System Overview</h3>
        <pre className="text-xs md:text-sm font-mono bg-black/30 p-4 rounded-xl overflow-x-auto leading-relaxed text-earth-100">
{`                                      +------------------+
                                      |   3rd Party APIs |
                                      | (Weather, Maps)  |
                                      +--------+---------+
                                               |
+---------------------+              +---------v---------+
|   Mobile Device     |              |   Cloud Backend   |
| (PWA / Native Shell)|              |  (Node/Go/Baas)   |
|                     |              |                   |
| +-----------------+ |    Sync      | +---------------+ |
| |  React UI Layer | |<-----------> | |  API Gateway  | |
| +-----------------+ |    JSON      | +-------+-------+ |
| |  Logic Modules  | |    HTTPS     |         |         |
| | (Garden, Tasks) | |              | +-------v-------+ |
| +-----------------+ |              | | Microservices | |
| | Offline Engine  | |              | | (Auth, Sync,  | |
| | (IndexedDB)     | |              | |  AI, Admin)   | |
| +--------+--------+ |              | +-------+-------+ |
|          |          |              |         |         |
| +--------v--------+ |              | +-------v-------+ |
| |  Local Storage  | |              | |   Database    | |
| | (Images/JSON)   | |              | | (PostgreSQL)  | |
| +-----------------+ |              | +---------------+ |
+---------------------+              +-------------------+`}
        </pre>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
         <Card>
            <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3 flex items-center gap-2"><Smartphone size={18}/> Client Architecture</h3>
            <ul className="space-y-2 text-sm text-earth-600 dark:text-stone-300">
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Offline-First:</strong> Uses IndexedDB as the source of truth. UI reads local DB, never API directly.</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Sync Engine:</strong> Delta-based sync with mutation queues (`sync_queue` store).</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>State:</strong> React Context + Hooks. No Redux; persistence via IDB.</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Images:</strong> Stored as Blobs locally, uploaded to S3 asynchronously.</li>
            </ul>
         </Card>
         <Card>
            <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3 flex items-center gap-2"><Database size={18}/> Data Strategy</h3>
            <ul className="space-y-2 text-sm text-earth-600 dark:text-stone-300">
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Schema:</strong> Relational models (UserProfile, GardenBed, Plant, Log).</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Soft Deletes:</strong> Records flagged `deleted: true` to propagate removals during sync.</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Conflict Resolution:</strong> Last-Write-Wins (LWW) for simple fields.</li>
            </ul>
         </Card>
      </div>
    </div>
  );

  const renderApi = () => (
    <div className="space-y-6 animate-in fade-in">
       <Card className="bg-earth-50 dark:bg-stone-800 border-earth-200 dark:border-stone-700">
          <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-2">Sync Protocol</h3>
          <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">The PWA uses a "Pull/Push" mechanism rather than RESTful CRUD for most operations.</p>
          <div className="space-y-2">
             <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-earth-200 dark:border-stone-700 flex gap-4 items-center">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">GET</span>
                <code className="text-sm font-bold text-earth-800 dark:text-earth-200">/sync/pull?since={'{timestamp}'}</code>
                <span className="text-xs text-earth-500 dark:text-stone-400">Download changes</span>
             </div>
             <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-earth-200 dark:border-stone-700 flex gap-4 items-center">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold font-mono">POST</span>
                <code className="text-sm font-bold text-earth-800 dark:text-earth-200">/sync/push</code>
                <span className="text-xs text-earth-500 dark:text-stone-400">Upload mutation queue</span>
             </div>
          </div>
       </Card>

       <div className="grid md:grid-cols-2 gap-6">
          <Card>
             <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3">Core Resources</h3>
             <ul className="text-sm space-y-2 font-mono text-earth-700 dark:text-stone-300">
                <li>/auth/login</li>
                <li>/auth/register</li>
                <li>/user/profile</li>
                <li>/garden/beds</li>
                <li>/livestock/herds</li>
                <li>/market/listings</li>
             </ul>
          </Card>
          <Card>
             <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3">AI & Services</h3>
             <ul className="text-sm space-y-2 font-mono text-earth-700 dark:text-stone-300">
                <li>/ai/diagnose (Image)</li>
                <li>/ai/recipe-parse</li>
                <li>/weather/forecast</li>
                <li>/market/search</li>
             </ul>
          </Card>
       </div>
    </div>
  );

  const renderUI = () => (
    <div className="space-y-6 animate-in fade-in">
       <Card>
          <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-4 flex items-center gap-2"><Palette size={18}/> Design Tokens</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <div className="space-y-1">
                <div className="h-12 bg-earth-100 dark:bg-stone-800 rounded-lg border border-earth-200 dark:border-stone-700"></div>
                <p className="text-xs text-center font-bold text-earth-600 dark:text-stone-400">Earth/Stone</p>
                <p className="text-[10px] text-center text-earth-400">Backgrounds</p>
             </div>
             <div className="space-y-1">
                <div className="h-12 bg-leaf-700 rounded-lg"></div>
                <p className="text-xs text-center font-bold text-earth-600 dark:text-stone-400">Leaf 700</p>
                <p className="text-[10px] text-center text-earth-400">Primary Action</p>
             </div>
             <div className="space-y-1">
                <div className="h-12 bg-earth-800 dark:bg-stone-900 rounded-lg"></div>
                <p className="text-xs text-center font-bold text-earth-600 dark:text-stone-400">Earth 800</p>
                <p className="text-[10px] text-center text-earth-400">Primary Text</p>
             </div>
             <div className="space-y-1">
                <div className="h-12 bg-clay-500 rounded-lg"></div>
                <p className="text-xs text-center font-bold text-earth-600 dark:text-stone-400">Clay 500</p>
                <p className="text-[10px] text-center text-earth-400">Accents</p>
             </div>
          </div>
          
          <h4 className="font-bold text-sm text-earth-800 dark:text-earth-200 mb-2">Typography</h4>
          <div className="space-y-2 border-l-4 border-earth-200 dark:border-stone-700 pl-4">
             <div>
                <p className="font-serif font-black text-2xl text-earth-900 dark:text-earth-100">Merriweather (Serif)</p>
                <p className="text-xs text-earth-500 dark:text-stone-400">Headers & Titles - Evokes traditional almanacs.</p>
             </div>
             <div>
                <p className="font-sans text-lg text-earth-900 dark:text-earth-100">Lato (Sans-Serif)</p>
                <p className="text-xs text-earth-500 dark:text-stone-400">UI Elements & Data - Clean and legible.</p>
             </div>
          </div>
       </Card>

       <Card>
          <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3 flex items-center gap-2"><Layers size={18}/> Component Rules</h3>
          <ul className="space-y-2 text-sm text-earth-600 dark:text-stone-300">
             <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Cards:</strong> "Index Card" look. White bg, soft shadow, rounded-2xl.</li>
             <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Inputs:</strong> Big touch targets (min 44px) for field usage.</li>
             <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Feedback:</strong> Optimistic UI. Instant updates, background sync indicators.</li>
          </ul>
       </Card>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-6 animate-in fade-in">
       <Card className="bg-gradient-to-br from-earth-900 to-black text-white border-none">
          <div className="flex items-start gap-4">
             <div className="p-3 bg-white/10 rounded-xl">
                <Brain size={24} className="text-leaf-300" />
             </div>
             <div>
                <h3 className="font-bold text-lg">Hybrid Inference Engine</h3>
                <p className="text-earth-200 text-sm mt-1">
                   Tier 1: Local Heuristics (Offline)<br/>
                   Tier 2: Cloud Vision/LLM (Online)
                </p>
             </div>
          </div>
       </Card>

       <div className="grid md:grid-cols-2 gap-6">
          <Card>
             <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3">Garden Intelligence</h3>
             <div className="text-sm space-y-3">
                <div className="p-3 bg-earth-50 dark:bg-stone-800 rounded-lg border border-earth-100 dark:border-stone-700">
                   <span className="font-bold text-leaf-700 dark:text-leaf-400 block mb-1">Plant Recommendations</span>
                   <p className="text-earth-600 dark:text-stone-300">Filters database by Zone + Season + User Goals. Weighted scoring algorithm runs locally.</p>
                </div>
                <div className="p-3 bg-earth-50 dark:bg-stone-800 rounded-lg border border-earth-100 dark:border-stone-700">
                   <span className="font-bold text-leaf-700 dark:text-leaf-400 block mb-1">Layout Optimization</span>
                   <p className="text-earth-600 dark:text-stone-300">Calculates square-foot utilization based on spacing rules to detect overcrowding.</p>
                </div>
             </div>
          </Card>
          <Card>
             <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3">Diagnostics & Vision</h3>
             <div className="text-sm space-y-3">
                <div className="p-3 bg-earth-50 dark:bg-stone-800 rounded-lg border border-earth-100 dark:border-stone-700">
                   <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Photo Analysis</span>
                   <p className="text-earth-600 dark:text-stone-300">Uploads to Cloud Function → Gemini Vision Pro. Returns diagnosis + organic treatments.</p>
                </div>
                <div className="p-3 bg-earth-50 dark:bg-stone-800 rounded-lg border border-earth-100 dark:border-stone-700">
                   <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Offline Fallback</span>
                   <p className="text-earth-600 dark:text-stone-300">Keyword matching on user notes triggers basic heuristic alerts (e.g. "yellow spots" -> "Check for Blight").</p>
                </div>
             </div>
          </Card>
       </div>
    </div>
  );

  const renderModules = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-leaf-100 dark:bg-leaf-900/30 p-2 rounded-lg text-leaf-700 dark:text-leaf-300"><DollarSign size={20}/></div>
                    <h3 className="font-bold text-earth-900 dark:text-earth-100">Ad Network</h3>
                </div>
                <ul className="text-sm space-y-2 text-earth-600 dark:text-stone-300">
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Campaigns:</strong> Stored locally, filtered by date & placement.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Selection:</strong> Weighted random algorithm based on priority.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-leaf-500 rounded-full mt-1.5"/><strong>Events:</strong> Impressions/Clicks queued offline in `ad_events`.</li>
                </ul>
            </Card>
            
            <Card>
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-700 dark:text-blue-300"><LinkIcon size={20}/></div>
                    <h3 className="font-bold text-earth-900 dark:text-earth-100">Integrations</h3>
                </div>
                <ul className="text-sm space-y-2 text-earth-600 dark:text-stone-300">
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"/><strong>Adapter Pattern:</strong> Unified interface for Weather, IoT, and Registries.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"/><strong>IoT Sync:</strong> Polls external APIs, normalizes data to `sensor_readings`.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"/><strong>Config:</strong> Credentials stored in `integrations` store (encrypted at rest).</li>
                </ul>
            </Card>

            <Card>
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-700 dark:text-purple-300"><CreditCard size={20}/></div>
                    <h3 className="font-bold text-earth-900 dark:text-earth-100">Subscriptions</h3>
                </div>
                <ul className="text-sm space-y-2 text-earth-600 dark:text-stone-300">
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"/><strong>Feature Gating:</strong> `FeatureGate` component checks `subscription_plans`.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"/><strong>Caching:</strong> Access rights cached in `feature_access_cache` for offline speed.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"/><strong>Trials:</strong> Promo code logic allows temporary plan overrides.</li>
                </ul>
            </Card>
        </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-in fade-in">
        <Card className="border-l-4 border-l-red-500">
            <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3 flex items-center gap-2"><Lock size={20} className="text-red-500"/> Auth & Identity</h3>
            <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">
                Authentication is handled via a simulated backend service that persists to IndexedDB (`auth_users`, `auth_sessions`).
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-earth-50 dark:bg-stone-800 p-3 rounded-lg">
                    <strong className="block mb-1 text-earth-800 dark:text-earth-200">MFA Implementation</strong>
                    <p className="text-earth-600 dark:text-stone-400">TOTP-based 2FA. Secret generation mocked. Verification checks 6-digit code against simulated time window.</p>
                </div>
                <div className="bg-earth-50 dark:bg-stone-800 p-3 rounded-lg">
                    <strong className="block mb-1 text-earth-800 dark:text-earth-200">Session Management</strong>
                    <p className="text-earth-600 dark:text-stone-400">JWT-like tokens stored in LocalStorage. Sessions tracked in DB for device revocation support.</p>
                </div>
            </div>
        </Card>

        <Card>
            <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-3">Audit Logging</h3>
            <p className="text-sm text-earth-600 dark:text-stone-300 mb-4">
                Critical actions (Login, Export, Role Change) are logged to `security_audit_logs`.
            </p>
            <table className="w-full text-sm text-left border border-earth-200 dark:border-stone-700 rounded-lg overflow-hidden">
                <thead className="bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 font-bold text-xs uppercase">
                    <tr>
                        <th className="p-2">Event</th>
                        <th className="p-2">Trigger</th>
                        <th className="p-2">Retention</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-stone-800 text-earth-600 dark:text-stone-300">
                    <tr><td className="p-2">User Login</td><td className="p-2">New Session</td><td className="p-2">90 Days</td></tr>
                    <tr><td className="p-2">Data Export</td><td className="p-2">CSV Generation</td><td className="p-2">7 Years</td></tr>
                    <tr><td className="p-2">Device Revoke</td><td className="p-2">Security Setting</td><td className="p-2">Permanent</td></tr>
                </tbody>
            </table>
        </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <FileText className="text-leaf-700 dark:text-leaf-400" /> System Documentation
          </h1>
          <p className="text-earth-600 dark:text-stone-400">Technical reference for the Homestead Hub platform.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-earth-200 dark:border-stone-800 pb-1">
         {[
            { id: 'architecture', label: 'Architecture', icon: Server },
            { id: 'modules', label: 'Modules', icon: Layers },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'api', label: 'API Spec', icon: GitBranch },
            { id: 'ui', label: 'UX / Design', icon: Palette },
            { id: 'ai', label: 'AI Models', icon: Brain },
         ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DocTab)}
                  className={`
                     flex items-center gap-2 px-4 py-3 font-bold text-sm rounded-t-xl transition-all whitespace-nowrap
                     ${isActive 
                        ? 'bg-white dark:bg-stone-900 text-leaf-800 dark:text-leaf-400 border-b-2 border-leaf-600' 
                        : 'text-earth-500 dark:text-stone-500 hover:bg-earth-50 dark:hover:bg-stone-800 hover:text-earth-800 dark:hover:text-stone-200'}
                  `}
               >
                  <Icon size={16} /> {tab.label}
               </button>
            )
         })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
         {activeTab === 'architecture' && renderArchitecture()}
         {activeTab === 'modules' && renderModules()}
         {activeTab === 'security' && renderSecurity()}
         {activeTab === 'api' && renderApi()}
         {activeTab === 'ui' && renderUI()}
         {activeTab === 'ai' && renderAI()}
      </div>
    </div>
  );
};
