export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token: string;
  employeeId: string;
}

/** Used for user listing (read-only) from /api/users */
export interface UserListItem {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  employeeName?: string;
  phone?: string;
}
