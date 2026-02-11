export interface Employee {
    id: number;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    status: string;
    fatherName?: string;
    dateOfBirth?: string;
    nationality?: string;
    race?: string;
    gender?: string;
    maritalStatus?: string;
    nrc?: string;
    departmentId: number;
    departmentName?: string;
    positionId?: number;
    position?: string;
    role: string;
    /** Reporting manager id (for hierarchy). */
    reportingToId?: number | null;
    reportingToName?: string;
    /** Approval authority: can approve leave at supervisor level. */
    canApproveLeave?: boolean;
    /** Approval authority: can approve overtime at supervisor level. */
    canApproveOvertime?: boolean;
    /** Approval authority: is HR (final approval). */
    isHr?: boolean;
}
