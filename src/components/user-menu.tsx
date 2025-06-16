'use client';
import { apiClient } from '@/lib/client';
import { useClerk } from '@clerk/nextjs';
import {
  Button,
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
} from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { signOut } = useClerk();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await apiClient.auth.getUser.$get();
      return await res.json();
    },
  });

  if (!user) {
    return null;
  }

  return (
    <Menu>
      <MenuButton className="flex w-full cursor-pointer items-center justify-between rounded-md border border-brand-200 bg-brand-50 px-3 py-4 outline-none transition-colors focus:outline-none">
        <div className="flex items-center gap-2">
          <User className="size-4" />
          <p className="text-sm">{user.email}</p>
        </div>
        <ChevronRight className="size-4" />
      </MenuButton>

      <MenuItems
        anchor="bottom"
        className="flex w-(--button-width) cursor-pointer flex-col gap-2 rounded-md border border-brand-200 bg-brand-50 p-2 outline-none transition-colors [--anchor-gap:8px] focus:outline-none"
      >
        <MenuSection className="flex flex-col gap-1">
          <MenuHeading className="flex cursor-default items-center gap-2 px-2 py-1 font-medium">
            <span className="text-sm">{user.name}</span>
            <div className="flex items-center justify-center rounded-md bg-brand px-2 py-1 text-xs">
              <span className="text-brand-100 text-xs">FREE</span>
            </div>
          </MenuHeading>

          <MenuItem>
            <Link
              href="/settings"
              className="block rounded-md px-2 py-1 text-sm transition-colors hover:bg-brand-200"
            >
              Settings
            </Link>
          </MenuItem>

          <MenuItem>
            <Button
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
              className="block w-full rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-brand-200"
            >
              Logout
            </Button>
          </MenuItem>
        </MenuSection>
      </MenuItems>
    </Menu>
  );
}
