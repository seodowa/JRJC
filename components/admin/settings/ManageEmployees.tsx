'use client';

import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '@/app/(admin)/context/UserContext';
import { ManageEmployee } from '@/types/manageEmployee';
import { 
  getEmployees, 
  getAccountTypes, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  AccountType 
} from '@/app/(admin)/services/manageEmployeeService';
import { toast } from '@/components/toast/use-toast';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';
import { convertImageToWebP } from '@/utils/imageUtils';
import EmployeeFormModal from './EmployeeFormModal';

export default function ManageEmployees() {
  const user = useContext(UserContext);
  const [employees, setEmployees] = useState<ManageEmployee[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<ManageEmployee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<ManageEmployee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security Check: Only owners can view this
  if (!user || user.account_type !== 'owner') {
    return null; 
  }

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [empRes, typeRes] = await Promise.all([getEmployees(), getAccountTypes()]);
      
      if (empRes.error) throw new Error(empRes.error);
      if (typeRes.error) throw new Error(typeRes.error);

      setEmployees(empRes.data || []);
      setAccountTypes(typeRes.data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (employee: ManageEmployee) => {
    setEditingEmployee(employee);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (employee: ManageEmployee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: any, selectedFile: File | null) => {
    setIsSubmitting(true);

    try {
      let imageUrl = editingEmployee?.profile_image || null;

      // Upload image if selected
      if (selectedFile) {
        const fileToUpload = await convertImageToWebP(selectedFile);
        const form = new FormData();
        form.append('file', fileToUpload);
        form.append('category', 'profile');

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const { publicUrl } = await uploadRes.json();
        imageUrl = publicUrl;
      }

      const payload = {
        ...formData,
        image: imageUrl,
        account_type_id: parseInt(formData.account_type_id),
      };

      let result;
      if (editingEmployee) {
        result = await updateEmployee({ ...payload, id: editingEmployee.ID });
      } else {
        result = await createEmployee(payload);
      }

      if (!result.success) throw new Error(result.error);

      toast({
        title: 'Success',
        description: `Employee ${editingEmployee ? 'updated' : 'created'} successfully.`,
      });

      setIsFormModalOpen(false);
      fetchData(); // Refresh list

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    try {
      const result = await deleteEmployee(employeeToDelete.ID);
      if (!result.success) throw new Error(result.error);
      
      toast({ title: 'Success', description: 'Employee deleted successfully.' });
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm text-red-600">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Employees</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-3xl p-4 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">Manage Employees</h2>
        <button
          onClick={handleOpenCreate}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>
      
      {employees.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No employees found.</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.ID}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.ID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.profile_image ? (
                        <img src={emp.profile_image} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.Username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.Email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{emp.account_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenEdit(emp)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleOpenDelete(emp)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {employees.map((emp) => (
              <div key={emp.ID} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {emp.profile_image ? (
                    <img src={emp.profile_image} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">N/A</div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{emp.Username}</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full capitalize">
                      {emp.account_type}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 break-all">
                  <span className="font-medium text-gray-700">Email: </span> {emp.Email}
                </div>

                <div className="flex justify-end gap-3 mt-2 border-t border-gray-200 pt-3">
                  <button 
                    onClick={() => handleOpenEdit(emp)} 
                    className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleOpenDelete(emp)} 
                    className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Modal */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        employee={editingEmployee}
        accountTypes={accountTypes}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Employee"
          message={`Are you sure you want to delete employee "${employeeToDelete.Username}"? This action cannot be undone.`}
          confirmButtonText="Delete"
        />
      )}
    </div>
  );
}