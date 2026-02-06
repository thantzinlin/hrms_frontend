/** Admin menu for CRUD (backend uses menuId, menuName, etc.). */
export interface AdminMenu {
  menuId?: number;
  menuName: string;
  moduleCode: string | null;
  parentId?: number | null;
  url?: string | null;
  icon?: string;
  sequence?: number;
  children?: AdminMenu[];
}
