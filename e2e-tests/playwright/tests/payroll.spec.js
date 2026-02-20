/**
 * Playwright E2E Tests — PH Payroll Calculator
 *
 * Run with: npx playwright test (from e2e-tests/)
 *
 * These tests check both happy paths and known bugs.
 * Candidates should add more tests as they discover additional issues.
 */

const { test, expect, request } = require('@playwright/test')

const BASE_URL = 'http://localhost:3000'
const API_URL = 'http://localhost:8000/api'


// QA Test jonas


//#1 Bug
//Negative value on creating new employee > If this pass = bug 
 test('POST /api/employees/ creates a new employee > Enter negative value on monthly Salary > Status code should be 400/404', async ({ request }) => {
    const res = await request.post(`${API_URL}/employees/`, {
      data: {
        first_name: 'Jonas',
        last_name: 'Candidate',
        email: `qa.test.${Date.now()}@example.com`,
        position: 'QA Engineer',
        department: 'Quality Assurance',
        employment_type: 'regular',
        monthly_salary: '-100', //invalid
        date_hired: '2024-01-01',
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()

   //* EXPECTED: Form should show validation error for negative monthly salary inputs.
   //* ACTUAL: Form submits successfully and creates new employee.
  })

  //#2 Bug
  //Should be able to reuse email > s
  test.describe('Employee List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/employees')
  })
  
   test('Add Employee > Delete the newly created employee > Reuse the email of the deleted email ', async ({ page }) => {
   
    await page.click('.btn.btn-primary'); 
    await expect(page.locator('input[type="text"].form-control').first()).toBeVisible();
    const fName = page.locator('input.form-control').nth(0);
    await fName.fill("Automate");
    const lName = page.locator('input.form-control').nth(1);
    await lName.fill("Automate");
    const email = page.locator('input.form-control').nth(2);
    const uniqueEmail = `qa.test.${Date.now()}@example.com`;
    await email.fill(uniqueEmail);
    const position = page.locator('input.form-control').nth(3);
    await position.fill("QA"); 
    const department = page.locator('input.form-control').nth(4);
    await department.fill("Engineering");
    const monthlySalary = page.locator('input.form-control').nth(5);
    await monthlySalary.fill("100000");
    const dateHired = page.locator('input.form-control').nth(6);
    await dateHired.type('02-02-2022');
    await page.click('.btn.btn-primary'); 
    
 
    const row = page.locator('table tr').filter({ hasText: uniqueEmail });
    await expect(row).toBeVisible();
    await row.locator('.btn.btn-outline-danger').click();
    await page.locator('.btn.btn-danger').click(); // confirm deletion
    await expect(page.locator('table').locator(`text=${uniqueEmail}`)).toHaveCount(0);


    //Re create and reuse the same email
    await page.click('.btn.btn-primary'); 
    await expect(page.locator('input[type="text"].form-control').first()).toBeVisible();
    await fName.fill("Automate");
    await lName.fill("Automate");
    await email.fill(uniqueEmail);
    await position.fill("QA"); 
    await department.fill("Engineering");
    await monthlySalary.fill("100000");
    await dateHired.type('02-02-2022');
    await page.click('.btn.btn-primary'); 
    await expect(page.locator('.alert.alert-danger')).toHaveCount(0);
    await expect(page.locator('table tr')).filter({ hasText: uniqueEmail }); await expect(row).toBeVisible(); // 
  });

   //* EXPECTED: Should be able to reuse email
   //* ACTUAL: Shows error message that email is already in used
})


  //#3
  //Should system accept 0 salary?  > Depends on the business requirements if this should pass or fail
 test('POST /api/employees/ creates a new employee > 0 value monthly salary > Status code 400/404 if 0 salary is invalid', async ({ request }) => {
    const res = await request.post(`${API_URL}/employees/`, {
      data: {
        first_name: 'Jonas',
        last_name: 'Candidate',
        email: `qa.test.${Date.now()}@example.com`,
        position: 'QA Engineer',
        department: 'Quality Assurance',
        employment_type: 'regular',
        monthly_salary: '0', // invalid or not?
        date_hired: '2024-01-01',
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()

   //* EXPECTED: if 0 is valid should create success > if 0 is invalid should show error msg
   //* ACTUAL: Form submits successfully and creates new employee.
   
    
  })

  //#4
  //Validate maximum input on forms (100 character for fname,lname,department,position)
  test.describe('Employee List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/employees')
  })
  
   test('Add Employee > Name field max length = 100 (UI only - expects to limit the input in the textfield)', async ({ page }) => {
   
    await page.click('.btn.btn-primary'); 
    await expect(page.locator('input[type="text"].form-control').first()).toBeVisible();
    const longText = 'A'.repeat(101);
    const fName = page.locator('input.form-control').nth(0);
    await fName.fill(longText);
    const lName = page.locator('input.form-control').nth(1);
    await lName.fill(longText);
    const email = page.locator('input.form-control').nth(2);
    await email.fill("jonas@example.com");
    const position = page.locator('input.form-control').nth(3);
    await position.fill(longText); 
    const department = page.locator('input.form-control').nth(4);
    await department.fill(longText);
    const monthlySalary = page.locator('input.form-control').nth(5);
    await monthlySalary.fill("100");
    const dateHired = page.locator('input.form-control').nth(6);
    await dateHired.type('02-02-2022');
    await page.click('.btn.btn-primary'); 
    //Expects to have all the error message for more than 100 characters
    const alert = page.locator('.alert.alert-danger.mt-3'); await expect(alert).toHaveText( '{"first_name":["Ensure this field has no more than 100 characters."],"last_name":["Ensure this field has no more than 100 characters."],"position":["Ensure this field has no more than 100 characters."],"department":["Ensure this field has no more than 100 characters."]}' );
  });
})

// #5 

test.describe('Payroll History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/history')
  })
 test('Payroll history > Expect 2026 year and select the same year for the dropdown filter ', async ({ page }) => {
  const rows = page.locator('table tr');
  const year2026Rows = rows.filter({ hasText: '2026' });
  const count = await year2026Rows.count(); 
  await expect(count).toBeGreaterThan(0);
  await page.locator('select.form-select.form-select-sm').selectOption('2026');
  await expect(page.locator('select.form-select.form-select-sm')).toHaveValue('2026');
});

});



// #6  Expects to have a year selection in the drop down that is existing in the table
/** 
  I've added this data in the postman to have a year 2000
{
    "employee_id": 56,
    "period_month": 11,
    "period_year": 2000,
    "override_salary": 1234
}
*/ 
test.describe('Payroll History lower year than 2022', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/history');
  });

  test('Payroll history > Expect a specific year and select the same year for the dropdown filter', async ({ page }) => {
    const rows = page.locator('table tr');
    const year2000Rows = rows.filter({ hasText: '2000' });
    const count = await year2000Rows.count();
    expect(count).toBeGreaterThan(0);
    const dropdown = page.locator('select.form-select.form-select-sm');
    const option2000 = dropdown.locator('option[value="2000"]');
    const exists = await option2000.count();
    expect(exists).toBeGreaterThan(0); // will fail if count = 0
    await dropdown.selectOption('2000');
    await expect(dropdown).toHaveValue('2000');
  });
});


/** 
test.describe('Dashboard', () => {
  test('loads and shows API status as Online', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Online')).toBeVisible()
  })

  test('shows employee count', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Active Employees')).toBeVisible()
  })
})

test.describe('Employee List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees')
  })

  test('displays 5 employees from sample data', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(5)
  })

  test('shows Juan Dela Cruz', async ({ page }) => {
    await expect(page.getByText('Juan Dela Cruz')).toBeVisible()
  })

  test('shows Ana Garcia as contractual', async ({ page }) => {
    await expect(page.getByText('Ana Garcia')).toBeVisible()
    await expect(page.getByText('contractual')).toBeVisible()
  })

  test('can open add employee form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Employee' }).click()
    await expect(page.getByText('Add New Employee')).toBeVisible()
  })
})
*/

/** 
test.describe('Payroll Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculate')
  })

  test('shows calculator form', async ({ page }) => {
    await expect(page.getByText('Payroll Calculator')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Calculate Payroll' })).toBeVisible()
  })

  test('calculates payroll and shows results', async ({ page }) => {
    // Select the first employee (Juan Dela Cruz)
    await page.locator('select').first().selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await expect(page.getByText('Payroll Result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Net Pay')).toBeVisible()
  })
*/
  /**
   * BUG #2: Negative salary input — no validation
   *
   * EXPECTED: Form should show validation error for -5000.
   * ACTUAL: Form submits successfully with negative salary.
   */

  /** 
  test('[BUG #2] form accepts negative override salary without validation error', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 })
    const salaryInput = page.locator('input[type="number"]').first()
    await salaryInput.fill('-5000')

    // Check that there is no min attribute preventing negative input
    const minAttr = await salaryInput.getAttribute('min')
    expect(minAttr).toBeNull() // BUG CONFIRMED: min attribute is missing

    // Form submits without client-side error
    await page.getByRole('button', { name: 'Calculate Payroll' }).click()
    await page.waitForTimeout(2000)
    // Candidates: document what happens after submission
  })
})

test.describe('Payroll History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history')
  })

  test('displays 10 payroll records from fixtures', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount(10, { timeout: 10000 })
  })

  test('shows employee names in history', async ({ page }) => {
    await expect(page.getByText('Juan Dela Cruz').first()).toBeVisible()
  })

  test('can filter by year', async ({ page }) => {
    await page.locator('select').selectOption('2025')
    const rows = page.locator('table tbody tr')
    await expect(rows).toHaveCount.greaterThan(0)
  })
})

test.describe('Tax Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tax-info')
  })

  test('shows TRAIN Law tax table', async ({ page }) => {
    await expect(page.getByText('TRAIN Law Income Tax Brackets')).toBeVisible()
  })

  test('shows tax-exempt bracket', async ({ page }) => {
    await expect(page.getByText('₱0 – ₱250,000')).toBeVisible()
    await expect(page.getByText('0%')).toBeVisible()
  })

  test('shows all three contribution sections', async ({ page }) => {
    await expect(page.getByText('SSS Contributions')).toBeVisible()
    await expect(page.getByText('PhilHealth')).toBeVisible()
    await expect(page.getByText('Pag-IBIG / HDMF')).toBeVisible()
  })
})

test.describe('API Tests', () => {
  test('GET /api/health/ returns 200', async ({ request }) => {
    const res = await request.get(`${API_URL}/health/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  test('GET /api/employees/ returns 5 employees', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees/`)
    expect(res.status()).toBe(200)
    const employees = await res.json()
    expect(employees).toHaveLength(5)
  })

  test('GET /api/tax-brackets/ returns brackets array', async ({ request }) => {
    const res = await request.get(`${API_URL}/tax-brackets/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.brackets).toHaveLength(6)
  })

  /**
   * BUG #1: Tax boundary — 250,000 should be exempt
   *
   * Using monthly salary of 20,833.33 (~250,000/year)
   * EXPECTED: income_tax = 0.00
   * ACTUAL: income_tax > 0 due to >= boundary bug
   */

  /** 
  test('[BUG #1] income_tax is non-zero for annual salary of exactly 250,000', async ({ request }) => {
    const res = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 1,
        period_month: 7,
        period_year: 2025,
        override_salary: 20833.33,
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    console.log('Income tax for ~250k annual salary:', body.income_tax)
    // BUG CONFIRMED when income_tax > 0:
    // expect(Number(body.income_tax)).toBe(0)  // This line would FAIL due to Bug #1
    expect(Number(body.income_tax)).toBeGreaterThan(0) // This PASSES, confirming Bug #1
  })

  /**
   * BUG #3: Wrong HTTP status for missing employee
   *
   * EXPECTED: HTTP 404
   * ACTUAL: HTTP 200
   */

  /*
  test('[BUG #3] calculate-payroll returns 200 (not 404) for nonexistent employee', async ({ request }) => {
    const res = await request.post(`${API_URL}/calculate-payroll/`, {
      data: {
        employee_id: 99999,
        period_month: 1,
        period_year: 2025,
      },
      failOnStatusCode: false,
    })
    // BUG CONFIRMED: status is 200 instead of 404
    expect(res.status()).toBe(200) // Should be 404 — this passing confirms Bug #3
    const body = await res.json()
    expect(body).toHaveProperty('error')
    console.log('BUG #3: Got status', res.status(), 'expected 404. Body:', body)
  })

  test('GET /api/employees/99999/ returns 404 (correct behavior)', async ({ request }) => {
    const res = await request.get(`${API_URL}/employees/99999/`, {
      failOnStatusCode: false,
    })
    expect(res.status()).toBe(404)
  })

  test('POST /api/employees/ creates a new employee', async ({ request }) => {
    const res = await request.post(`${API_URL}/employees/`, {
      data: {
        first_name: 'Test',
        last_name: 'Candidate',
        email: `qa.test.${Date.now()}@example.com`,
        position: 'QA Engineer',
        department: 'Quality Assurance',
        employment_type: 'regular',
        monthly_salary: '50000.00',
        date_hired: '2024-01-01',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.full_name).toBe('Test Candidate')
  })

  test('GET /api/payroll-history/ returns 10 records', async ({ request }) => {
    const res = await request.get(`${API_URL}/payroll-history/`)
    expect(res.status()).toBe(200)
    const records = await res.json()
    expect(records.length).toBeGreaterThanOrEqual(10)
  })


*/
//})
