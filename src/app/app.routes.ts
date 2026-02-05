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
                path: 'admin/holidays',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/holiday/holiday-list.component').then(m => m.HolidayListComponent),
            },
            {
                path: 'departments',
                canActivate: [roleGuard],
                data: { expectedRoles: ['ADMIN'] },
                loadComponent: () => import('./pages/department/department-list.component').then(m => m.DepartmentListComponent),
            }
        ]
    },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];