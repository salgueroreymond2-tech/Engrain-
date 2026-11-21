import { z } from "zod";

export const workOrderIdSchema = z.object({
  id: z.string().cuid(),
});

export const createWorkOrderSchema = z.object({
  vehicleId: z.string().cuid(),
  workshopId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export const updateWorkOrderSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  closedAt: z.string().datetime().optional(),
}).strict();

export const listWorkOrdersQuerySchema = z.object({
  vehicleId: z.string().cuid().optional(),
  workshopId: z.string().cuid().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
}).strict();
