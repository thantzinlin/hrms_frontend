export interface ClaimType {
  id: number;
  code: string;
  name: string;
  description?: string;
  maxAmountPerClaim?: number;
  requiresReceipt?: boolean;
  currency?: string;
  isActive?: boolean;
}
