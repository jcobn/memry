import { normalizePath } from "obsidian";
import MemryPlugin from "./main";

const DATA_STORE_PATH = "./.obsidian/plugins/memry/memry_data.json"

export interface NoteState {
    lastReview: number | null;
    nextReview: number;
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
}

export interface NoteData {
    notes: Record<string, NoteState>
}

export class DataStore {
    plugin: MemryPlugin;

    constructor(plugin: MemryPlugin) {
        this.plugin = plugin;
    }

    getDataStorePath() {
        return DATA_STORE_PATH;
    }

    load() {
        
    }
}