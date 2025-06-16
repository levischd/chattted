'use client';

import { models } from '@/lib/config/models';
import type { ModelId } from '@/lib/config/models';
import { PROVIDERS } from '@/lib/config/providers';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { Fragment } from 'react';

interface ModelSelectProps {
  modelId: ModelId;
  setModelId: (modelId: ModelId) => void;
}

export function ModelSelect({ modelId, setModelId }: ModelSelectProps) {
  const selectedModel = models[modelId];

  const groupedModels = PROVIDERS.map((provider) => ({
    provider,
    models: Object.values(models).filter(
      (model) => model.provider === provider.id
    ),
  })).filter((group) => group.models.length > 0);

  return (
    <Listbox
      value={selectedModel}
      onChange={(model) =>
        model &&
        setModelId(
          Object.keys(models)[Object.values(models).indexOf(model)] as ModelId
        )
      }
      as={Fragment}
    >
      <ListboxButton
        aria-label="Model"
        className="flex flex-1 cursor-pointer items-center justify-center gap-1 self-stretch rounded-lg border-none bg-transparent px-2 text-sm outline-none hover:bg-brand-200"
      >
        {selectedModel?.name}
        <ChevronDown className="pointer-events-none size-3" />
      </ListboxButton>
      <ListboxOptions
        anchor="top end"
        className="flex cursor-pointer flex-col gap-1 rounded-md border border-brand-200 bg-brand-50 p-2 outline-none transition-colors [--anchor-gap:8px] focus:outline-none"
      >
        {groupedModels.map((group, groupIndex) => (
          <Fragment key={group.provider.id}>
            {groupIndex > 0 && (
              <div className="my-1 border-brand-200 border-t" />
            )}
            <div className="px-2 py-1 font-medium text-sm">
              {group.provider.name}
            </div>
            {group.models.map((model) => {
              const modelId = Object.keys(models).find(
                (key) => models[key as ModelId] === model
              ) as ModelId;
              return (
                <ListboxOption
                  key={modelId}
                  value={model}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-brand-200"
                >
                  <span>{model.name}</span>
                  {model.isPremium && (
                    <div className="flex items-center justify-center rounded-md bg-brand px-2 py-1 text-xs">
                      <span className="text-brand-100 text-xs">PRO</span>
                    </div>
                  )}
                </ListboxOption>
              );
            })}
          </Fragment>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
