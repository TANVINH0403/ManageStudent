# Modification Log - Subtask Fix & Status Update

## Date: 2026-04-20

### 1. Fix Subtask Creation (Bad Request 400)
- **Problem:** Creating a subtask was failing with a 400 error because the requested payload contained properties not recognized by the API (like `Status` during creation) and mixed camelCase/PascalCase naming.
- **Solution:** Updated `handleAddSubtaskSubmit` in `Tasks.jsx` to send a clean payload matching the `TaskCreationRequestDto` expected by the .NET API.
  - Used Only PascalCase properties: `TaskName`, `Description`, `ParentId`, `CategoryId`, `Priority`, `DueDate`.
  - Removed `Status` from the creation payload as the API defaults this on the backend.

### 2. Status Logic Update
- **Requirement:** Remove the "Accepted" status (value 3) as it is no longer needed.
- **Changes:**
  - Updated `getStatusLabel` in `Tasks.jsx` to only include `['Pending', 'In Progress', 'Completed']`.
  - Removed the `Accepted` option from the status dropdowns in the task table and subtask rows.
  - Verified `TaskStatus.cs` in the API to ensure the enum matches the frontend (0: Todo, 1: InProgress, 2: Completed).

### 3. API Consistency
- Verified that all task-related service calls use `axiosClient` which correctly handles authorization and token refresh.
- Improved casing consistency between Frontend payloads and Backend DTOs.
