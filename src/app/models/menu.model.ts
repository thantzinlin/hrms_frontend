/**
 * Represents a single menu item from the backend.
 * Supports multi-level nesting via children.
 */
export interface MenuItem {
  menuId: number;
  menuName: string;
  /** Route path or null for parent-only (no navigation) */
  url: string | null;
  icon: string;
  sequence: number;
  children: MenuItem[];
}
