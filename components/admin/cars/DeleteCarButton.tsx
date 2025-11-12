// components/admin/cars/DeleteCarButton.tsx
"use client";

import AsyncButton from "@/components/AsyncButton";

interface DeleteCarButtonProps {
  carId: number;
}

const DeleteCarButton = ({ carId }: DeleteCarButtonProps) => {
  
  const handleDelete = async () => {
    // TODO: Implement actual delete logic
    // This will involve:
    // 1. Showing a confirmation modal.
    // 2. Calling a server action or API route to delete the car from the database.
    // 3. Handling success (e.g., refreshing the page or removing the item from the list).
    // 4. Handling errors.
    alert(`Placeholder: Delete car with ID: ${carId}`);
  };

  return (
    <AsyncButton 
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
    >
      Delete
    </AsyncButton>
  );
};

export default DeleteCarButton;
