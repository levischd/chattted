import {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
} from '@headlessui/react';
import { ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

const MENU_ITEMS = [
  { label: 'Settings', href: '/settings' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Documentation', href: '/docs' },
  { label: 'Logout', href: '/logout' },
];

const USER_DATA = {
  name: 'Levi Schad',
  email: 'levi.schad@icloud.com',
  plan: 'PRO',
};

export function UserButton() {
  return (
    <Menu>
      <MenuButton className="flex w-full cursor-pointer items-center justify-between rounded-md border border-brand-200 bg-brand-50 px-3 py-4 outline-none transition-colors focus:outline-none">
        <div className="flex items-center gap-2">
          <User className="size-4" />
          <p className="text-sm">{USER_DATA.email}</p>
        </div>
        <ChevronRight className="size-4" />
      </MenuButton>

      <MenuItems
        anchor="bottom"
        className="flex w-(--button-width) cursor-pointer flex-col gap-2 rounded-md border border-brand-200 bg-brand-50 p-2 outline-none transition-colors [--anchor-gap:8px] focus:outline-none"
      >
        <MenuSection className="flex flex-col gap-1">
          <MenuHeading className="flex cursor-default items-center gap-2 px-2 py-1 font-medium">
            <span className="text-sm">{USER_DATA.name}</span>
            <div className="flex items-center justify-center rounded-md bg-brand px-2 py-1 text-xs">
              <span className="text-brand-100 text-xs">{USER_DATA.plan}</span>
            </div>
          </MenuHeading>

          {MENU_ITEMS.map((item) => (
            <MenuItem key={item.label}>
              <Link
                href={item.href}
                className="block rounded-md px-2 py-1 text-sm transition-colors hover:bg-brand-200"
              >
                {item.label}
              </Link>
            </MenuItem>
          ))}
        </MenuSection>
      </MenuItems>
    </Menu>
  );
}
