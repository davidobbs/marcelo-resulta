import { z } from 'zod';

export const QuantifiableItemSchema = z.object({
  total: z.number().min(0),
});

export const RevenueSchema = z.object({
  fieldRental: QuantifiableItemSchema,
  membership: QuantifiableItemSchema,
  sponsorship: z.number().min(0),
  soccerSchool: QuantifiableItemSchema,
  events: QuantifiableItemSchema,
  merchandise: QuantifiableItemSchema,
  foodBeverage: QuantifiableItemSchema,
  broadcastRights: z.number().min(0).optional(),
  playerTransfers: z.number().min(0).optional(),
  customRevenues: z.array(z.object({ id: z.string(), name: z.string(), value: z.number().min(0) })).optional(),
});

export const CostSchema = z.object({
  personnel: z.object({
    technicalStaff: QuantifiableItemSchema,
    players: QuantifiableItemSchema,
    administrativeStaff: QuantifiableItemSchema,
    supportStaff: QuantifiableItemSchema,
    medicalStaff: QuantifiableItemSchema,
  }),
  facilities: QuantifiableItemSchema,
  utilities: QuantifiableItemSchema,
  medical: QuantifiableItemSchema,
  transportation: QuantifiableItemSchema,
  equipment: QuantifiableItemSchema,
  marketing: QuantifiableItemSchema,
  administrative: QuantifiableItemSchema,
  insurance: QuantifiableItemSchema,
  regulatory: QuantifiableItemSchema,
  technology: QuantifiableItemSchema,
  competitions: QuantifiableItemSchema,
  transfers: z.number().min(0),
  depreciation: z.number().min(0),
  financial: z.number().min(0),
  otherOperational: z.number().min(0),
  customCosts: z.array(z.object({ id: z.string(), name: z.string(), value: z.number().min(0) })).optional(),
});

export const FinancialDataSchema = z.object({
  revenues: RevenueSchema,
  costs: CostSchema,
});