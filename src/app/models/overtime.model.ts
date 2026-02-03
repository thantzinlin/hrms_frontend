export interface Overtime {
    id: number;
    employeeId: number;
    employeeName?: string; // Optional, as it might be populated in the component
    date: string;
    hours: number;
    reason: string;
    status: string; // PENDING, APPROVED, REJECTED
}
