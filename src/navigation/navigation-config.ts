export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  activeIcon?: string;
  isActive?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'local-gallery',
    label: 'Local Gallery',
    route: '/',
    icon: '📱',
    activeIcon: '📱',
  },
  {
    id: 'online-gallery',
    label: 'Online Gallery',
    route: '/online-gallery',
    icon: '☁️',
    activeIcon: '☁️',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: '⚙️',
    activeIcon: '⚙️',
  },
];

export const getNavigationItemByRoute = (
  route: string,
): NavigationItem | undefined => {
  return navigationItems.find((item) => item.route === route);
};

export const getActiveNavigationItems = (
  currentRoute: string,
): NavigationItem[] => {
  return navigationItems.map((item) => ({
    ...item,
    isActive:
      item.route === currentRoute ||
      (item.route === '/' && currentRoute === '/local-gallery'),
  }));
};
