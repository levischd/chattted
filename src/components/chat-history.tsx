'use client';

import type { Conversation } from '@/server/db/schema';
import { Button } from '@headlessui/react';
import { ChevronRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface ChatHistoryProps {
  onDeleteConversation: (conversationId: string) => void;
  conversations: Conversation[];
}

export function ChatHistory({
  conversations,
  onDeleteConversation,
}: ChatHistoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categoryTitle: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle);
      } else {
        newSet.add(categoryTitle);
      }
      return newSet;
    });
  };

  const getDateBoundaries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    return { today, yesterday, lastWeek, lastMonth };
  };

  const getCategoryForConversation = (
    createdAt: Date,
    boundaries: ReturnType<typeof getDateBoundaries>
  ) => {
    const { today, yesterday, lastWeek, lastMonth } = boundaries;

    if (createdAt >= today) {
      return 'today';
    }
    if (createdAt >= yesterday) {
      return 'yesterday';
    }
    if (createdAt >= lastWeek) {
      return 'lastWeek';
    }
    if (createdAt >= lastMonth) {
      return 'lastMonth';
    }
    return 'before';
  };

  const categorizeConversations = (conversations: Conversation[]) => {
    const boundaries = getDateBoundaries();

    const categories = {
      pinned: [] as Conversation[],
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      lastWeek: [] as Conversation[],
      lastMonth: [] as Conversation[],
      before: [] as Conversation[],
    };

    for (const conversation of conversations) {
      if (conversation.isPinned) {
        categories.pinned.push(conversation);
        continue;
      }

      const createdAt = new Date(conversation.createdAt);
      const category = getCategoryForConversation(createdAt, boundaries);
      categories[category].push(conversation);
    }

    for (const category of Object.values(categories)) {
      category.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return [
      {
        title: 'Pinned',
        conversations: categories.pinned,
        collapsible: false,
      },
      {
        title: 'Today',
        conversations: categories.today,
        collapsible: true,
      },
      {
        title: 'Yesterday',
        conversations: categories.yesterday,
        collapsible: true,
      },
      {
        title: 'Last Week',
        conversations: categories.lastWeek,
        collapsible: true,
      },
      {
        title: 'Last Month',
        conversations: categories.lastMonth,
        collapsible: true,
      },
      {
        title: 'Before',
        conversations: categories.before,
        collapsible: true,
      },
    ];
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <p className="ml-2 font-medium text-brand-500 text-sm">No chats</p>
      </div>
    );
  }

  const categorizedConversations = categorizeConversations(conversations);

  return (
    <div className="flex flex-col">
      {categorizedConversations?.map(
        ({ title, conversations, collapsible }) => {
          if (conversations.length === 0) {
            return null;
          }

          const isCollapsed = collapsedCategories.has(title);

          return (
            <div key={title} className="mb-4 flex flex-col gap-1">
              <Button
                className="ml-2 flex cursor-pointer items-center"
                onClick={collapsible ? () => toggleCategory(title) : undefined}
              >
                <p
                  className={`font-medium text-brand-800 text-xs uppercase tracking-wide ${
                    collapsible ? '' : 'ml-1'
                  }`}
                >
                  {title}
                </p>
                {collapsible && (
                  <div className="flex h-4 w-4 items-center justify-center">
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${
                        collapsible && isCollapsed ? '' : 'rotate-90'
                      }`}
                    />
                  </div>
                )}
              </Button>

              {(!collapsible || !isCollapsed) && (
                <div className="flex flex-col gap-1">
                  {conversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/chat/${conversation.id}`}
                      className={`group flex cursor-pointer items-center justify-between gap-1 rounded-md p-2 transition-colors hover:bg-brand-200 ${
                        pathname === `/chat/${conversation.id}`
                          ? 'bg-brand-200'
                          : ''
                      }`}
                    >
                      <p className="truncate text-sm">{conversation.title}</p>
                      <Trash2
                        className="hidden size-4 shrink-0 text-brand-800 hover:text-brand-700 group-hover:block"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                          if (pathname === `/chat/${conversation.id}`) {
                            router.push('/chat/new');
                          }
                        }}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  );
}
