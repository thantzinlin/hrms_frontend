/** Node in the org reporting hierarchy tree */
export interface HierarchyNode {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  reportingToId: number | null;
  subordinates: HierarchyNode[];
}
