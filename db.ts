
// FIX: Use a named import for Dexie to prevent potential module resolution issues.
import { Dexie, type Table } from 'dexie';
import type { Tournament, Player } from './types';

export class BilliardProDB extends Dexie {
    tournaments!: Table<Tournament, string>;
    players!: Table<Player, string>;

    constructor() {
        super('BilliardProDB');
        this.version(1).stores({
            tournaments: 'id, name, status', // Primary key 'id', index 'name' and 'status'
            players: 'id, name, rating'    // Primary key 'id', index 'name' and 'rating'
        });
    }
}

export const db = new BilliardProDB();
