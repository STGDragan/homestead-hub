
import { dbService } from './db';
import { IntegrationConfig, IntegrationLog, SensorDevice, SensorReading } from '../types';

export interface IntegrationAdapter {
    id: string;
    name: string;
    type: string;
    fetch: (config: IntegrationConfig) => Promise<{ success: boolean; data?: any; error?: string }>;
    transform?: (data: any) => any;
}

// Mock Adapter for OpenWeather
const WeatherAdapter: IntegrationAdapter = {
    id: 'openweathermap',
    name: 'OpenWeatherMap',
    type: 'weather',
    fetch: async (config) => {
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        if (Math.random() > 0.9) return { success: false, error: 'API Rate Limit Exceeded' };
        
        return { 
            success: true, 
            data: { 
                temp: 72 + Math.random() * 5, 
                humidity: 40 + Math.random() * 10,
                condition: 'cloudy'
            } 
        };
    }
};

// Mock Adapter for IoT Hub
const IoTAdapter: IntegrationAdapter = {
    id: 'mqtt_gateway',
    name: 'Generic MQTT Gateway',
    type: 'sensor_hardware',
    fetch: async (config) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            success: true,
            data: [
                { externalId: 'dev_001', type: 'temp', value: 68.5, unit: 'F', location: 'Greenhouse 1' },
                { externalId: 'dev_002', type: 'moisture', value: 45, unit: '%', location: 'North Bed' }
            ]
        };
    }
};

// Adapter for Gemini AI (Connectivity Check)
const GeminiAdapter: IntegrationAdapter = {
    id: 'google_gemini',
    name: 'Google Gemini (Vision & Text)',
    type: 'ai_engine',
    fetch: async (config) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!config.settings.apiKey) return { success: false, error: 'Missing API Key' };
        return {
            success: true,
            data: { status: 'connected', models: ['gemini-2.5-flash'] }
        };
    }
};

const ADAPTERS: Record<string, IntegrationAdapter> = {
    'openweathermap': WeatherAdapter,
    'mqtt_gateway': IoTAdapter,
    'google_gemini': GeminiAdapter
};

export const integrationService = {
    
    getAvailableAdapters() {
        return Object.values(ADAPTERS);
    },

    async getAllConfigs(): Promise<IntegrationConfig[]> {
        return await dbService.getAll<IntegrationConfig>('integrations');
    },

    async saveConfig(config: IntegrationConfig): Promise<void> {
        await dbService.put('integrations', config);
    },

    async deleteConfig(id: string): Promise<void> {
        await dbService.delete('integrations', id);
    },

    /**
     * Retrieve the API Key for a specific provider from the DB.
     * Used by AI services to authenticate requests.
     */
    async getApiKey(providerId: string): Promise<string | null> {
        const configs = await this.getAllConfigs();
        const activeConfig = configs.find(c => c.provider === providerId && c.status === 'active');
        return activeConfig?.settings?.apiKey || null;
    },

    async syncIntegration(configId: string): Promise<void> {
        const config = await dbService.get<IntegrationConfig>('integrations', configId);
        if (!config || config.status === 'inactive') return;

        const adapter = ADAPTERS[config.provider];
        if (!adapter) {
            await this.log(configId, 'error', 'failure', `Adapter ${config.provider} not found`);
            return;
        }

        await this.log(configId, 'sync', 'success', 'Starting sync...');

        try {
            const start = Date.now();
            const result = await adapter.fetch(config);
            const duration = Date.now() - start;

            if (result.success) {
                config.lastSyncAt = Date.now();
                config.status = 'active';
                config.errorCount = 0;
                await dbService.put('integrations', config);
                await this.log(configId, 'sync', 'success', `Synced successfully in ${duration}ms`, duration);

                if (config.type === 'sensor_hardware') {
                    await this.processSensorData(config.id, result.data);
                } else if (config.type === 'ai_engine') {
                    await this.log(configId, 'sync', 'success', 'AI Connectivity Verified');
                }

            } else {
                config.status = 'error';
                config.errorCount = (config.errorCount || 0) + 1;
                config.lastErrorMessage = result.error;
                await dbService.put('integrations', config);
                await this.log(configId, 'sync', 'failure', result.error || 'Unknown error', duration);
            }
        } catch (e: any) {
            config.status = 'error';
            config.errorCount = (config.errorCount || 0) + 1;
            config.lastErrorMessage = e.message;
            await dbService.put('integrations', config);
            await this.log(configId, 'error', 'failure', e.message);
        }
    },

    async processSensorData(integrationId: string, payload: any[]) {
        if (!Array.isArray(payload)) return;

        for (const item of payload) {
            const devices = await dbService.getAllByIndex<SensorDevice>('sensor_devices', 'integrationId', integrationId);
            let device = devices.find(d => d.externalId === item.externalId);

            if (!device) {
                device = {
                    id: crypto.randomUUID(),
                    integrationId,
                    externalId: item.externalId,
                    name: item.location || `Device ${item.externalId}`,
                    type: item.type,
                    location: item.location,
                    status: 'online',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    syncStatus: 'pending'
                };
                await dbService.put('sensor_devices', device);
            }

            const reading: SensorReading = {
                id: crypto.randomUUID(),
                sensorId: device.id,
                timestamp: Date.now(),
                value: item.value,
                unit: item.unit,
                type: item.type,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };
            await dbService.put('sensor_readings', reading);

            device.lastReading = item.value;
            device.lastReadingAt = Date.now();
            device.status = 'online';
            await dbService.put('sensor_devices', device);
        }
    },

    async getLogs(integrationId: string): Promise<IntegrationLog[]> {
        const logs = await dbService.getAllByIndex<IntegrationLog>('integration_logs', 'integrationId', integrationId);
        return logs.sort((a, b) => b.createdAt - a.createdAt);
    },

    async log(integrationId: string, action: IntegrationLog['action'], status: IntegrationLog['status'], details: string, durationMs?: number) {
        const log: IntegrationLog = {
            id: crypto.randomUUID(),
            integrationId,
            action,
            status,
            details,
            durationMs,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('integration_logs', log, 'sync');
    }
};
