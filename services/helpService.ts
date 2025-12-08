
import { dbService } from './db';
import { HelpArticle } from '../types';
import { USER_HELP_CONTENT } from '../constants';

export const helpService = {
    
    /**
     * Initialize DB with default content.
     * Updates existing articles if title/content changed in constants.
     */
    async init() {
        console.log("Seeding help articles...");
        for (const cat of USER_HELP_CONTENT) {
            for (const art of cat.articles) {
                // Upsert system articles to keep them fresh with code updates
                const article: HelpArticle = {
                    id: art.id,
                    categoryId: cat.id,
                    title: art.title,
                    excerpt: art.excerpt,
                    content: (art as any).content || `Detailed guide for ${art.title}...`, 
                    createdBy: 'system',
                    createdAt: Date.now(), // Always touch to ensure freshness in demo
                    updatedAt: Date.now(),
                    syncStatus: 'synced'
                };
                await dbService.put('help_articles', article);
            }
        }
    },

    async getArticles(categoryId?: string): Promise<HelpArticle[]> {
        if (categoryId) {
            return await dbService.getAllByIndex<HelpArticle>('help_articles', 'categoryId', categoryId);
        }
        return await dbService.getAll<HelpArticle>('help_articles');
    },

    async saveArticle(article: HelpArticle): Promise<void> {
        await dbService.put('help_articles', article);
    },

    async deleteArticle(id: string): Promise<void> {
        await dbService.delete('help_articles', id);
    },

    async searchArticles(query: string): Promise<HelpArticle[]> {
        const all = await this.getArticles();
        const lower = query.toLowerCase();
        return all.filter(a => a.title.toLowerCase().includes(lower) || a.content.toLowerCase().includes(lower));
    }
};