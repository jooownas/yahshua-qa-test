# 🐞 Bug Report – Payroll Management System

## 📌 Overview
This document outlines functional, validation, and calculation issues identified during QA testing of the Payroll Management System running on:

- **Environment:** Localhost
- **Base URL:** http://localhost:3000
- **Test Scope:** Dashboard, Employee Management, Payroll Calculator, History, Tax Info

---

# 📊 Executive Summary

| ID | Title | Severity | Category |
|----|--------|----------|-----------|
| BUG-001 | Inconsistent KPI Card Alignment | Low | UI |
| BUG-002 | Missing Employee Name Validation | Medium | Validation |
| BUG-003 | Raw JSON Error Messages Displayed | Medium | UX / Error Handling |
| BUG-004 | Deleted Email Cannot Be Reused | Medium | Data Integrity |
| BUG-005 | 100 Character Limit Not Enforced | Medium | Validation |
| BUG-006 | Negative override salary input no validation | Medium | Validation |
| BUG-007 | Incorrect Employer Pag-IBIG Calculation | Medium | Business Logic |
| BUG-008 | Pag-IBIG Max ₱200 Rule Not Applied | Medium | Business Logic |
| BUG-009 |  API Allows Negative or Zero Salary | Medium | Backend Validation |
| BUG-010 |  Large override_salary Value Causes Internal Server Error | Medium | Backend Validation |
| BUG-011 |  DELETE Payroll History Returns 200 But Does Not Delete Record | Medium | Backend Validation |
---

# 🐛 Detailed Findings

---

## BUG-001: Inconsistent KPI Card Alignment

**Severity:** Low  

### Steps to Reproduce
1. Navigate to Dashboard
2. Observe KPI cards

### Expected Result
All KPI cards should have consistent alignment and typography.

### Actual Result
"Avg Monthly Salary" KPI card is misaligned compared to others.

### Impact
Affects UI consistency but does not block functionality.

---

## BUG-002: Employee Name Validation Missing

**Severity:** Medium  

### Steps to Reproduce
1. Go to Employees
2. Click "Add Employee"
3. Enter numeric or special characters in First Name & Last Name
4. Submit form

### Expected Result
First Name, Last Name should accept letters only.

### Actual Result
System allows numeric and special characters.

### Impact
Data integrity risk and poor input validation.

---

## BUG-003: Raw JSON Error Message Displayed

**Severity:** Medium  

### Steps to Reproduce
1. Submit invalid employee form data (invalid email, existing email, invalid date hired, enter more than character limit)
2. Observe error message

### Expected Result
User-friendly validation message.

### Actual Result
Raw JSON error is displayed.

### Impact
Poor user experience and potential exposure of backend structure.

---

## BUG-004: Deleted Email Cannot Be Reused

**Severity:** Medium   

### Steps to Reproduce
1. Add employee with email (e.g., test@gmail.com)
2. Delete employee
3. Re-add employee using same email

### Expected Result
Email should be reusable after deletion.

### Actual Result
System blocks reuse of deleted email.

### Impact
Indicates soft-delete or database constraint issue.

---

## BUG-005: 100 Character Limit Not Enforced

**Severity:** Medium  

### Steps to Reproduce
1. Enter more than 100 characters in text fields
2. Submit form

### Expected Result
System should enforce limit or update validation message.

### Actual Result
System allows more than 100 characters.

### Impact
Mismatch between UI validation and backend constraints.

---

## BUG-006: Negative override salary input no validation

**Severity:** Medium  

### Steps to Reproduce
1. Select employee
2. Enter negative value on salary override
2. Calculate payroll

### Expected Result
System should show correct validation message for negative values


### Actual Result
System allows input and successfully submit negative value

### Impact
Negative salary can cause incorrect payroll calculation



---

## BUG-007: Incorrect Employer Pag-IBIG Contribution (₱20,000 Salary)

**Severity:** Medium  

### Steps to Reproduce
1. Select employee with ₱20,000 salary
2. Calculate payroll

### Expected Result
Employer contribution = ₱400 (2% of 20,0000)
**Pag-IBIG / HDMF Rules**
- Employer: 2% of monthly salary
- 
### Actual Result
Employer contribution = ₱200

### Impact
Incorrect payroll computation affecting financial accuracy.

---


## BUG-008: Pag-IBIG ₱200 Maximum Rule Not Enforced

**Severity:** Medium  

### Steps to Reproduce
1. Override salary to above ₱5,001
2. Calculate payroll

### Expected Result
Employee contribution should be capped at ₱200.

**Pag-IBIG / HDMF Rules**
- Employee: 2% of monthly salary (max ₱200/month if salary > ₱5,000)

### Actual Result
System continues computing 2% beyond ₱200.

### Impact
Incorrect statutory deduction calculation.

---


---

## BUG-009: API Allows Negative or Zero Salary

**Severity:** High    

### Endpoint
POST /api/employees/

### Test Method
Sent request with:
{
  "monthly_salary": -5000
}

Also tested:
{
  "monthly_salary": 0
}

### Expected Result
API should return 400 Bad Request with validation error:
"Salary must be greater than 0."

### Actual Result
API accepts the request and creates the employee record.

### Impact
Critical data integrity issue.
Negative or zero salary may break payroll calculations and financial reporting.


---

## BUG-010: Large override_salary Value Causes Internal Server Error

**Severity:** High  

### Endpoint
POST /api/calculate-payroll/

### Test Method
Sent request with:
{
  "override_salary": 1000000000
}

### Expected Result
API should:
- Either validate maximum salary limit
- Or safely process calculation
- Return structured error response if invalid

### Actual Result
API returns 500 Internal Server Error.

### Impact
Indicates lack of input validation and unhandled backend exception.
This may expose system instability and security risks.

---

## BUG-011: DELETE Payroll History Returns 200 But Does Not Delete Record

**Severity:** Medium  

### Endpoint
DELETE /api/payroll-history/{id}

### Test Case
DELETE /api/payroll-history/50

### Expected Result
- Record with ID 50 should be deleted
- OR API should return 404 if record does not exist
- Response should confirm deletion (e.g., 204 No Content)

### Actual Result
- API returns 200 OK
- Record remains in database
- No confirmation message returned

### Impact
Misleading success response.
May cause data inconsistency and confusion for frontend integration.




# 🔎 Severity Justification

- **Low** – Cosmetic issue with no functional impact.
- **Medium** – Affects validation, data integrity, or payroll accuracy.
- No critical/system-breaking issues identified during testing.

---

# ✅ Recommendations

1. Implement strict frontend + backend validation.
2. Improve error handling to return user-friendly messages.
3. Review statutory contribution formulas and enforce caps/minimums.
4. Ensure alignment between UI validation rules and database constraints.

---

# 📎 Attachments

Screenshots are available in the `/evidence` folder.
