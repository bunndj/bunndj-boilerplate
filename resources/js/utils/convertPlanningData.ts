import type { PlanningFormData } from '@/types';

/**
 * Convert planning data from database format to form format
 */
export function convertPlanningDataFromDB(dbData: any[]): PlanningFormData {
  if (!Array.isArray(dbData)) {
    return {};
  }

  const formData: any = {};

  // Convert array of {field_name, field_value} to object
  dbData.forEach(item => {
    if (item.field_name && item.field_value !== undefined) {
      formData[item.field_name] = item.field_value;
    }
  });

  return formData;
}

/**
 * Convert planning data from form format to database format
 */
export function convertPlanningDataToDB(formData: PlanningFormData): any[] {
  const dbData: any[] = [];

  Object.entries(formData).forEach(([fieldName, fieldValue]) => {
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      dbData.push({
        field_name: fieldName,
        field_value: fieldValue,
      });
    }
  });

  return dbData;
}
