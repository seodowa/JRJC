import { ManageEmployee } from '@/types/manageEmployee';

export interface AccountType {
  id: number;
  type: string;
}

export const getEmployees = async (): Promise<{ data: ManageEmployee[] | null; error: string | null }> => {
  try {
    const response = await fetch('/api/admin/employees', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch employees' };
    }
    const employees: ManageEmployee[] = await response.json();
    return { data: employees, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message || 'An unexpected error occurred' };
  }
};

export const getAccountTypes = async (): Promise<{ data: AccountType[] | null; error: string | null }> => {
  try {
    const response = await fetch('/api/admin/account-types', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to fetch account types' };
    }
    const types: AccountType[] = await response.json();
    return { data: types, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const createEmployee = async (employeeData: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/admin/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to create employee' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const updateEmployee = async (employeeData: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/admin/employees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to update employee' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteEmployee = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/admin/employees?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to delete employee' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};