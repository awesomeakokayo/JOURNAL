import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const submitSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  authors: z.string().min(2, "Author(s) must be at least 2 characters"),
  abstract: z.string().min(10, "Abstract must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

export const approvePublishSchema = z.object({
  submissionId: z.string(),
});
