/** Node in the org reporting hierarchy tree */
export interface HierarchyNode {
  id: number;
  employeeId: string;
  name: string;
  email?: string;
  /** Position name (displayed in hierarchy). */
  positionName?: string;
  reportingToId: number | null;
  subordinates: HierarchyNode[];
}
