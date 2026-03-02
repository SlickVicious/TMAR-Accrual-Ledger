/**
 * PayrollService - Pure functions for payroll calculations
 */

/**
 * Validates employee data
 * @param {Object} employee - Employee object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateEmployee(employee) {
  const errors = [];

  if (!employee) {
    return { valid: false, errors: ['Employee object is required'] };
  }

  if (!employee.name || typeof employee.name !== 'string') {
    errors.push('Employee name is required and must be a string');
  }

  if (!employee.payRate || typeof employee.payRate !== 'number') {
    errors.push('Pay rate is required and must be a number');
  }

  if (employee.payRate && employee.payRate <= 0) {
    errors.push('Pay rate must be greater than zero');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new employee object
 * @param {Object} data - Employee data
 * @returns {Object} Normalized employee object
 */
export function createEmployee(data = {}) {
  const validation = validateEmployee(data);

  if (!validation.valid) {
    throw new Error(`Invalid employee data: ${validation.errors.join(', ')}`);
  }

  return {
    id: data.id || generateEmployeeId(),
    name: data.name,
    payRate: data.payRate,
    payType: data.payType || 'hourly', // 'hourly' or 'salary'
    federalAllowances: data.federalAllowances || 0,
    stateAllowances: data.stateAllowances || 0,
    additionalWithholding: data.additionalWithholding || 0,
    status: data.status || 'Active',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generates a unique employee ID
 * @returns {string} Unique ID
 */
function generateEmployeeId() {
  return `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates gross pay for an employee
 * @param {Object} employee - Employee object
 * @param {number} hoursWorked - Hours worked (for hourly employees)
 * @param {number} payPeriods - Pay periods per year (for salary employees, default 26)
 * @returns {number} Gross pay
 */
export function calculateGrossPay(employee, hoursWorked = 0, payPeriods = 26) {
  if (!employee) {
    throw new Error('Employee is required');
  }

  if (employee.payType === 'hourly') {
    if (typeof hoursWorked !== 'number' || hoursWorked < 0) {
      throw new Error('Hours worked must be a non-negative number');
    }

    // Calculate overtime (hours over 40)
    const regularHours = Math.min(hoursWorked, 40);
    const overtimeHours = Math.max(hoursWorked - 40, 0);

    const regularPay = regularHours * employee.payRate;
    const overtimePay = overtimeHours * employee.payRate * 1.5;

    return regularPay + overtimePay;
  } else if (employee.payType === 'salary') {
    // Annual salary divided by pay periods
    return employee.payRate / payPeriods;
  }

  throw new Error('Invalid pay type');
}

/**
 * Calculates federal tax withholding (simplified)
 * @param {number} grossPay - Gross pay amount
 * @param {number} allowances - Federal allowances
 * @returns {number} Federal tax withholding
 */
export function calculateFederalTax(grossPay, allowances = 0) {
  if (typeof grossPay !== 'number' || grossPay < 0) {
    throw new Error('Gross pay must be a non-negative number');
  }

  // Simplified 2024 withholding calculation
  // This is a basic approximation - real calculations are more complex
  const allowanceValue = 4300 / 26; // Annual allowance divided by bi-weekly periods
  const taxableIncome = Math.max(grossPay - (allowances * allowanceValue), 0);

  let tax = 0;

  // Progressive tax brackets (bi-weekly, approximate)
  if (taxableIncome > 0) {
    if (taxableIncome <= 200) {
      tax = taxableIncome * 0.10;
    } else if (taxableIncome <= 600) {
      tax = 20 + (taxableIncome - 200) * 0.12;
    } else if (taxableIncome <= 1500) {
      tax = 68 + (taxableIncome - 600) * 0.22;
    } else if (taxableIncome <= 3000) {
      tax = 266 + (taxableIncome - 1500) * 0.24;
    } else {
      tax = 626 + (taxableIncome - 3000) * 0.32;
    }
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Calculates Social Security tax (FICA)
 * @param {number} grossPay - Gross pay amount
 * @param {number} ytdGross - Year-to-date gross pay
 * @returns {number} Social Security tax
 */
export function calculateSocialSecurityTax(grossPay, ytdGross = 0) {
  if (typeof grossPay !== 'number' || grossPay < 0) {
    throw new Error('Gross pay must be a non-negative number');
  }

  const SS_RATE = 0.062; // 6.2%
  const SS_WAGE_BASE = 168600; // 2024 wage base limit

  // Check if already exceeded wage base
  if (ytdGross >= SS_WAGE_BASE) {
    return 0;
  }

  // Calculate taxable amount
  const remainingWageBase = SS_WAGE_BASE - ytdGross;
  const taxableAmount = Math.min(grossPay, remainingWageBase);

  return Math.round(taxableAmount * SS_RATE * 100) / 100;
}

/**
 * Calculates Medicare tax
 * @param {number} grossPay - Gross pay amount
 * @returns {number} Medicare tax
 */
export function calculateMedicareTax(grossPay) {
  if (typeof grossPay !== 'number' || grossPay < 0) {
    throw new Error('Gross pay must be a non-negative number');
  }

  const MEDICARE_RATE = 0.0145; // 1.45%
  return Math.round(grossPay * MEDICARE_RATE * 100) / 100;
}

/**
 * Calculates state tax withholding (simplified, using CA rates as example)
 * @param {number} grossPay - Gross pay amount
 * @param {number} allowances - State allowances
 * @returns {number} State tax withholding
 */
export function calculateStateTax(grossPay, allowances = 0) {
  if (typeof grossPay !== 'number' || grossPay < 0) {
    throw new Error('Gross pay must be a non-negative number');
  }

  // Simplified CA state tax calculation (bi-weekly)
  const allowanceValue = 144.20; // CA allowance value (bi-weekly)
  const taxableIncome = Math.max(grossPay - (allowances * allowanceValue), 0);

  let tax = 0;

  if (taxableIncome > 0) {
    if (taxableIncome <= 400) {
      tax = taxableIncome * 0.01;
    } else if (taxableIncome <= 900) {
      tax = 4 + (taxableIncome - 400) * 0.02;
    } else if (taxableIncome <= 1500) {
      tax = 14 + (taxableIncome - 900) * 0.04;
    } else {
      tax = 38 + (taxableIncome - 1500) * 0.06;
    }
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Calculates complete payroll for an employee
 * @param {Object} employee - Employee object
 * @param {number} hoursWorked - Hours worked (for hourly)
 * @param {number} ytdGross - Year-to-date gross (for SS calculation)
 * @returns {Object} Complete payroll breakdown
 */
export function calculatePayroll(employee, hoursWorked = 0, ytdGross = 0) {
  if (!employee) {
    throw new Error('Employee is required');
  }

  const grossPay = calculateGrossPay(employee, hoursWorked);
  const federalTax = calculateFederalTax(grossPay, employee.federalAllowances);
  const stateTax = calculateStateTax(grossPay, employee.stateAllowances);
  const socialSecurity = calculateSocialSecurityTax(grossPay, ytdGross);
  const medicare = calculateMedicareTax(grossPay);

  const totalDeductions = federalTax + stateTax + socialSecurity + medicare + (employee.additionalWithholding || 0);
  const netPay = grossPay - totalDeductions;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    payPeriod: new Date().toISOString(),
    hoursWorked: employee.payType === 'hourly' ? hoursWorked : null,
    grossPay: Math.round(grossPay * 100) / 100,
    deductions: {
      federalTax: Math.round(federalTax * 100) / 100,
      stateTax: Math.round(stateTax * 100) / 100,
      socialSecurity: Math.round(socialSecurity * 100) / 100,
      medicare: Math.round(medicare * 100) / 100,
      additional: employee.additionalWithholding || 0
    },
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100
  };
}
