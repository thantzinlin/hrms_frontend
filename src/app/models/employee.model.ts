export interface Employee {
    id: number;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    status: string;
    departmentId: number;
    departmentName?: string;
    positionId?: number;
    position?: string;
    role: string;
}
