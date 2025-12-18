import MemryPlugin from "./main";

interface MemrySettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MemrySettings = {
  mySetting: "default",
};

const SRS_DATA_VERSION = 1;
const DEFAULT_SRS_DATA: SRSData = {
  metadata: {
    version: SRS_DATA_VERSION,
    updatedAt: Date.now(),
  },
  notes: {},
  sets: {},
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
  description: string | null;
  createdAt: number;
}

export interface SRSData {
  metadata: {
    version: number;
    updatedAt: number;
  };
  notes: Record<string, NoteState>;
  sets: Record<string, SetState>;
}

export class DataManager {
  plugin: MemryPlugin;
  public settings: MemrySettings;
  public srsData: SRSData;

  constructor(plugin: MemryPlugin) {
    this.plugin = plugin;
  }

  async init() {
    let toSave = false;
    const data = await this.plugin.loadData();
    if (!!data?.settings) {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
    } else {
      this.settings = DEFAULT_SETTINGS;
      toSave = true;
    }
    if (data?.srsData?.metadata?.version !== undefined) {
      this.srsData = data.srsData;
    } else {
      this.srsData = DEFAULT_SRS_DATA;
      toSave = true;
    }
    if (toSave) {
      await this.save();
    }
  }

  async save() {
    await this.plugin.dashboard.rerender();
    await this.plugin.saveData({
      settings: this.settings,
      srsData: this.srsData,
    });
  }
}
