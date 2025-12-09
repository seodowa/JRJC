export interface UpdateAccountData {
  username: string;
  email: string;
  password?: string;
  image?: string | null;
}

export async function updateAccountService(currentUsername: string, formData: UpdateAccountData) {
  try {
    const response = await fetch('/api/admin/updateacc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentUsername,
        formData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return the error message from the API (e.g., "Missing fields" or DB error)
      return { 
        success: false, 
        message: data.message || 'Failed to update account' 
      };
    }

    return data; // Returns { success: true, message: 'Profile updated successfully' }

  } catch (error) {
    console.error('Service Call Error:', error);
    return { 
      success: false, 
      message: 'Network error occurred. Please check your connection.' 
    };
  }
}