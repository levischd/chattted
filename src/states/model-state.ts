import { DEFAULT_LLM_MODEL_ID, type ModelId } from '@/lib/config/models';
import { create } from 'zustand';

interface ModelState {
    modelId: ModelId;
    setModelId: (modelId: ModelId) => void;
}

export const useModelState = create<ModelState>((set) => ({
    modelId: DEFAULT_LLM_MODEL_ID,
    setModelId: (modelId: ModelId) => set({ modelId }),
}));
