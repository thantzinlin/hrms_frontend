import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { menuGuard } from './core/guards/menu.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard, menuGuard],
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'employees',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/employee/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./pages/employee/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () => import('./pages/employee/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
                    }
                ]
            },
            {
                path: 'attendance',
                loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent),
            },
            {
                path: 'leaves',
                loadComponent: () => import('./pages/leave/leave.component').then(m => m.LeaveComponent),
            },
            {
                path: 'overtime',
                loadComponent: () => import('./pages/overtime/overtime.component').then(m => m.OvertimeComponent),
            },
            {
                path: 'approvals',
                loadComponent: () => import('./pages/approvals/approvals.component').then(m => m.ApprovalsComponent),
            },
            {
                path: 'org/hierarchy',
                loadComponent: () => import('./pages/org-hierarchy/org-hierarchy.component').then(m => m.OrgHierarchyComponent),
            },
            {
                path: 'admin/holidays',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/holiday/holiday-list.component').then(m => m.HolidayListComponent),
            },
            {
                path: 'admin/leave-types',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/leave-type-list/leave-type-list.component').then(m => m.LeaveTypeListComponent),
            },
            {
                path: 'departments',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/department/department-list.component').then(m => m.DepartmentListComponent),
            },
            {
                path: 'positions',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/position-list/position-list.component').then(m => m.PositionListComponent),
            },
            {
                path: 'roles',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/role-list/role-list.component').then(m => m.RoleListComponent),
            },
            {
                path: 'admin/roles',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/role-list/role-list.component').then(m => m.RoleListComponent),
            },
            {
                path: 'admin/menus',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/menu-list/menu-list.component').then(m => m.MenuListComponent),
            },
            {
                path: 'admin/role-menus',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/role-menu-mapping/role-menu-mapping.component').then(m => m.RoleMenuMappingComponent),
            },
            {
                path: 'users',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/setup/users-placeholder/users-placeholder.component').then(m => m.UsersPlaceholderComponent),
            }
        ]
    },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];