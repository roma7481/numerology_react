import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

class DatabaseService {
    private dbName = 'numerology11.db';
    private db: SQLite.SQLiteDatabase | null = null;

    async init() {
        if (this.db) return;

        const dbDir = `${FileSystem.documentDirectory}SQLite`;
        const dbPath = `${dbDir}/${this.dbName}`;

        await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true }).catch((e) => {
            console.log('Database directory already exists or error:', e);
        });

        const dbInfo = await FileSystem.getInfoAsync(dbPath);

        if (!dbInfo.exists) {
            console.log('Copying database from assets...');
            const assetInfo = await Asset.loadAsync(require('../../assets/numerology11.db'));
            const uri = assetInfo[0].localUri || assetInfo[0].uri;
            await FileSystem.copyAsync({ from: uri, to: dbPath });
        } else {
            console.log('Database already exists locally.');
        }

        this.db = await SQLite.openDatabaseAsync(this.dbName);
    }

    private async ensureDb() {
        if (!this.db) await this.init();
        return this.db!;
    }

    /** Get a single row by number from any number-keyed table */
    async getByNumber(table: string, locale: string, number: number): Promise<Record<string, any> | null> {
        const db = await this.ensureDb();
        return db.getFirstAsync(
            `SELECT * FROM ${table} WHERE locale = ? AND number = ?`,
            [locale, number]
        );
    }

    /** Get all rows for a locale from any table */
    async getAll(table: string, locale: string): Promise<Record<string, any>[]> {
        const db = await this.ensureDb();
        return db.getAllAsync(
            `SELECT * FROM ${table} WHERE locale = ?`,
            [locale]
        );
    }

    /** Get biorhythm/secondary biorhythm by type and level */
    async getByTypeLevel(table: string, locale: string, type: string, level: string): Promise<string> {
        const db = await this.ensureDb();
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM ${table} WHERE locale = ? AND type = ? AND level = ?`,
            [locale, type, level]
        );
        return row?.description || '';
    }

    /** Get psychomatrix by characteristic and number */
    async getPsychomatrix(locale: string, characteristic: string, number: number): Promise<string> {
        const db = await this.ensureDb();
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM psychomatrix WHERE locale = ? AND characteristic = ? AND number = ?`,
            [locale, characteristic, number]
        );
        return row?.description || '';
    }

    /** Get psychomatrix compatibility by category and strength */
    async getPsychomatrixCompat(locale: string, category: string, strength: string): Promise<string> {
        const db = await this.ensureDb();
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM psychomatrix_compat WHERE locale = ? AND category = ? AND strength = ?`,
            [locale, category, strength]
        );
        return row?.description || '';
    }

    /** Get psychomatrix line by category and number */
    async getPsychomatrixLine(locale: string, category: string, number: number): Promise<string> {
        const db = await this.ensureDb();
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM psychomatrix_lines WHERE locale = ? AND category = ? AND number = ?`,
            [locale, category, number]
        );
        return row?.description || '';
    }

    /** Get life path compatibility between two numbers */
    async getLifePathCompat(locale: string, number1: number, number2: number): Promise<string> {
        const db = await this.ensureDb();
        const n1 = Math.min(number1, number2);
        const n2 = Math.max(number1, number2);
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM life_path_number_compat WHERE locale = ? AND number1 = ? AND number2 = ?`,
            [locale, n1, n2]
        );
        return row?.description || '';
    }

    /** Get destiny graph by state */
    async getDestinyGraph(locale: string, state: string): Promise<string> {
        const db = await this.ensureDb();
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM destiny_graph WHERE locale = ? AND state = ?`,
            [locale, state]
        );
        return row?.description || '';
    }

    // ─── Convenience methods for common queries ───

    async getPersonalDayInterpretation(locale: string, number: number): Promise<string> {
        const row = await this.getByNumber('personal_day', locale, number);
        return (row as any)?.description || '';
    }

    async getPersonalMonthInterpretation(locale: string, number: number): Promise<string> {
        const row = await this.getByNumber('personal_month', locale, number);
        return (row as any)?.description || '';
    }

    async getPersonalYearInterpretation(locale: string, number: number): Promise<string> {
        const row = await this.getByNumber('personal_year', locale, number);
        return (row as any)?.description || '';
    }

    async getLifePathNumber(locale: string, number: number): Promise<Record<string, any> | null> {
        return this.getByNumber('life_path_number', locale, number);
    }

    async getExpressionNumber(locale: string, number: number): Promise<Record<string, any> | null> {
        return this.getByNumber('expression_number', locale, number);
    }

    async getSoulUrgeNumber(locale: string, number: number): Promise<Record<string, any> | null> {
        return this.getByNumber('soul_urge_number', locale, number);
    }

    async getPersonalityNumber(locale: string, number: number): Promise<Record<string, any> | null> {
        return this.getByNumber('personality_number', locale, number);
    }

    async getBirthdayNumber(locale: string, number: number): Promise<Record<string, any> | null> {
        return this.getByNumber('birthday_number', locale, number);
    }

    async getDailyLuckyNumber(locale: string, number: number): Promise<string> {
        const row = await this.getByNumber('daily_lucky_number', locale, number);
        return (row as any)?.description || '';
    }

    async getBiorhythm(locale: string, type: string, level: string): Promise<string> {
        return this.getByTypeLevel('biorhythms', locale, type, level);
    }

    async getBiorhythmCompat(locale: string, type: string, level: string): Promise<string> {
        return this.getByTypeLevel('biorhythm_compatibility', locale, type, level);
    }

    async getSecondaryBiorhythm(locale: string, type: string, level: string): Promise<string> {
        return this.getByTypeLevel('secondary_biorhythms', locale, type, level);
    }

    async getTableDescription(tableName: string, locale: string, itemKey: number = 0): Promise<string> {
        const db = await this.ensureDb();
        const row = await db.getFirstAsync<{ description: string }>(
            `SELECT description FROM table_description WHERE table_name = ? AND locale = ? AND item_key = ?`,
            [tableName, locale, itemKey]
        );
        return row?.description || '';
    }

    /** Get all descriptions for a table (e.g. psychomatrix cells 0-9) */
    async getTableDescriptions(tableName: string, locale: string): Promise<string[]> {
        const db = await this.ensureDb();
        const rows = await db.getAllAsync<{ description: string; item_key: number }>(
            `SELECT item_key, description FROM table_description WHERE table_name = ? AND locale = ? ORDER BY item_key`,
            [tableName, locale]
        );
        return rows.map(r => r.description);
    }
}

export const dbService = new DatabaseService();
