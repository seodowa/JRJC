feat: Centralize rental calculation logic and refine admin features

This commit centralizes the rental calculation logic, previously duplicated between the client booking page and the admin walk-in booking context, into a shared hook. It also finalizes the "Manage Employees" module and improves session handling.

Key changes include:

- **Centralized Logic:**
  - Extracted the comprehensive rental calculation logic (pricing, duration, return time) from `app/(client)/book/page.tsx` into an updated `hooks/useRentalCalculation.ts`.
  - Refactored `app/(client)/book/page.tsx` and `app/(admin)/context/WalkInBookingContext.tsx` to utilize this shared hook, ensuring consistent behavior across both client and admin booking flows.

- **Full CRUD for Employees:**
  - Implemented `POST`, `PUT`, and `DELETE` API handlers in `app/api/admin/employees/route.ts` for creating, updating, and deleting employee records.
  - Ensured all password handling uses `bcryptjs` for secure hashing.
  - Created client-side service functions in `app/(admin)/services/manageEmployeeService.ts`.
  - The `GET` employee endpoint now returns `account_type_id` for better frontend integration.
  - **Responsive Design:** The `ManageEmployees` component now switches between a table view (desktop) and a card view (mobile) for better usability.

- **Role-Based Access Control:**
  - Protected all employee management API endpoints with `verifyOwner` middleware.
  - Conditionally rendered "Manage Employees" features in the admin dashboard based on user role.

- **Dynamic Fees in Walk-In Booking:**
  - Updated `WalkInBookingContext` and `WalkInBookingClient` to fetch `bookingFee` and `carWashFee` dynamically from the CMS using `useCMS` and `getNumber`, removing hardcoded values.
  - Exposed these fees via the `WalkInBookingContext`.

- **Session Management Fix:**
  - Updated `app/api/admin/updateacc/route.ts` to regenerate and update the session cookie upon successful profile update (e.g., image change). This ensures the UI reflects changes immediately.

- **Modular Frontend Architecture:**
  - Refactored `SettingsPage` to use a tabbed interface.
  - Extracted employee form logic into `EmployeeFormModal.tsx`.
  - Added `app/api/admin/account-types/route.ts` to fetch account roles dynamically.

- **Bug Fixes:**
  - Fixed `Unterminated string constant` in `AccountSettings.tsx`.
  - Resolved TypeScript errors in API routes.
  - Corrected prop names in `ConfirmationModal`.
