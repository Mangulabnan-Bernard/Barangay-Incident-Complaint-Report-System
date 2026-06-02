import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(1, "Address is required"),
  user: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Incidents. Form fields arrive as strings; numeric/date conversion happens in
// the route/service layer so empty values become null cleanly.
export const incidentCreateSchema = z.object({
  complaint: z.string().trim().min(1, "Complainant name is required"),
  age: z.string().trim().optional().default(""),
  current_address: z.string().trim().min(1, "Complainant address is required"),
  contact: z.string().trim().optional().default(""),
  complainee: z.string().trim().min(1, "Respondent name is required"),
  cage: z.string().trim().optional().default(""),
  caddress: z.string().trim().optional().default(""),
  ccontact: z.string().trim().optional().default(""),
  incident: z.string().trim().min(1, "Incident type is required"),
  incident_details: z.string().trim().min(1, "Incident details are required"),
  datetime_incident: z.string().trim().optional().default(""),
});

export const incidentUpdateSchema = incidentCreateSchema.extend({
  status: z.enum(["Pending", "Solved", "Unsolved"]),
  action: z.string().trim().optional().default("none"),
  description: z.string().trim().optional().default(""),
  incident_involve: z.string().trim().optional().default(""),
  failReason: z.string().trim().optional().default(""),
  punong_barangay: z.string().trim().optional().default(""),
});

export type IncidentCreateInput = z.infer<typeof incidentCreateSchema>;
export type IncidentUpdateInput = z.infer<typeof incidentUpdateSchema>;
