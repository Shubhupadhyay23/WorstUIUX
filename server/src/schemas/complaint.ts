import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  location_text: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  category: z.string().optional()
});

export const aiAnalysisSchema = z.object({
  category: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  priority: z.number().min(1).max(10),
  department: z.string(),
  summary: z.string(),
  recommended_action: z.string(),
  confidence: z.number().min(0).max(1),
  requires_immediate_attention: z.boolean(),
  duplicate_keywords: z.array(z.string())
});
