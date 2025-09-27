export type LoginResponse = {
  message: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    // Try to parse structured error; fallback to generic message
    let errorMessage = "Login failed";
    try {
      const data = await response.json();
      if (data?.error) errorMessage = data.error;
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export type LogoutResponse = {
  message: string;
};

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    let errorMessage = "Logout failed";
    try {
      const data = await response.json();
      if (data?.error) errorMessage = data.error;
    } catch (_) {}
    throw new Error(errorMessage);
  }
  return response.json();
}
