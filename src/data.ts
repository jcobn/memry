import { normalizePath, TAbstractFile, TFile } from "obsidian";
import MemryPlugin from "./main";
import { randomUUID } from "crypto";

const DATA_STORE_PATH = "./.obsidian/plugins/memry/memry_data.json";
const SRS_DATA_VERSION = 1;
const DEFAULT_SRS_DATA: SRSData = {
    metadata: {
        version: SRS_DATA_VERSION,
        updatedAt: Date.now()
    },
    notes: {},
    sets: {}
};

export interface NoteState {
    setId: string;
    lastReview: number | null;
    nextReview: number;
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
}

export interface SetState {
    name: string;
    description: string;
    createdAt: number;
}

export interface SRSData {
    metadata: {
        version: number;
        updatedAt: number;
    }
    notes: Record<string, NoteState>,
    sets: Record<string, SetState>
}

export class DataStore {
    plugin: MemryPlugin;
    private normalizedPath: string;
    private srsData: SRSData = DEFAULT_SRS_DATA;

    constructor(plugin: MemryPlugin) {
        this.plugin = plugin;
        this.normalizedPath = normalizePath(DATA_STORE_PATH);
    }

    getDataStorePath() {
        return DATA_STORE_PATH;
    }

    async load() {
        const file = this.plugin.app.vault.getAbstractFileByPath(this.normalizedPath);
        
        if(!file) {
            await this.plugin.app.vault.create(this.normalizedPath, JSON.stringify(this.srsData, null, 2));
            return;
        }

        const raw = await this.plugin.app.vault.read(file as TFile);
        try {
            this.srsData = JSON.parse(raw);
        } catch (e) {
            console.error("memry: failed to load: " + this.normalizedPath);
            this.srsData = DEFAULT_SRS_DATA;
        }
    }

    async save() {
        const file = this.plugin.app.vault.getAbstractFileByPath(this.normalizedPath);
        const serialized = JSON.stringify(this.srsData, null, 2);

        if(!file) {
            await this.plugin.app.vault.create(this.normalizedPath, serialized);
        } else {
            await this.plugin.app.vault.modify(file as TFile, serialized);
        }
    }

    getAllData() {
        return this.srsData;
    }

    async upsertNote(id: string, updated: NoteState) {
        this.srsData.notes[id] = updated;
        this.srsData.metadata.updatedAt = Date.now();
        await this.save();
    }

    async deleteNote(id: string) {
        delete this.srsData.notes[id];
        this.srsData.metadata.updatedAt = Date.now();
        await this.save();
    }

    async createSet(name: string, description: string = "") {
        let id: string = randomUUID().toString();
        while(!!this.srsData.sets[id]) {
            id = randomUUID().toString();
        }
        this.srsData.sets[id] = {
            name,
            description,
            createdAt: Date.now()
        };
        await this.save();
    }
}