import React from 'react';
import type { PlanningFormSchema } from '@/schemas';

// Re-export the schema type for convenience
export type PlanningFormData = PlanningFormSchema;

export interface PlanningData {
  planning_data: PlanningFormData | null;
  notes: string | null;
  completion_percentage: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

export interface PlanningFormProps {
  onSave: (data: PlanningFormData) => void;
  initialData?: Partial<PlanningFormData>;
}

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export interface TabPanelProps {
  data: PlanningFormData;
  onChange: (field: keyof PlanningFormData, value: any) => void;
}

export type PlanningTab =
  | 'general'
  | 'ceremony'
  | 'addons'
  | 'cocktail'
  | 'introductions'
  | 'reception'
  | 'music';
