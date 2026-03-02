/**
 * InvoiceService - Pure functions for invoice generation and management
 */

/**
 * Validates invoice data
 * @param {Object} invoice - Invoice object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateInvoice(invoice) {
  const errors = [];

  if (!invoice) {
    return { valid: false, errors: ['Invoice object is required'] };
  }

  if (!invoice.invoiceNumber || typeof invoice.invoiceNumber !== 'string') {
    errors.push('Invoice number is required and must be a string');
  }

  if (!invoice.date) {
    errors.push('Invoice date is required');
  }

  if (!invoice.billTo || typeof invoice.billTo !== 'object') {
    errors.push('Bill to information is required');
  }

  if (!Array.isArray(invoice.lineItems) || invoice.lineItems.length === 0) {
    errors.push('At least one line item is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new invoice object
 * @param {Object} data - Invoice data
 * @returns {Object} Normalized invoice object
 */
export function createInvoice(data = {}) {
  const validation = validateInvoice(data);

  if (!validation.valid) {
    throw new Error(`Invalid invoice data: ${validation.errors.join(', ')}`);
  }

  const lineItems = data.lineItems.map(item => ({
    description: item.description || '',
    quantity: item.quantity || 1,
    rate: item.rate || 0,
    amount: (item.quantity || 1) * (item.rate || 0)
  }));

  const subtotal = calculateSubtotal(lineItems);
  const tax = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
  const total = subtotal + tax;

  return {
    id: data.id || generateInvoiceId(),
    invoiceNumber: data.invoiceNumber,
    date: data.date,
    dueDate: data.dueDate || calculateDueDate(data.date, data.paymentTerms || 30),
    billTo: data.billTo,
    billFrom: data.billFrom || {},
    lineItems,
    subtotal,
    taxRate: data.taxRate || 0,
    tax,
    total,
    status: data.status || 'Draft',
    notes: data.notes || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generates a unique invoice ID
 * @returns {string} Unique ID
 */
function generateInvoiceId() {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculates invoice subtotal from line items
 * @param {Array<Object>} lineItems - Array of line item objects
 * @returns {number} Subtotal
 */
export function calculateSubtotal(lineItems) {
  if (!Array.isArray(lineItems)) {
    throw new Error('Line items must be an array');
  }

  return lineItems.reduce((sum, item) => {
    const amount = (item.quantity || 0) * (item.rate || 0);
    return sum + amount;
  }, 0);
}

/**
 * Calculates due date based on invoice date and payment terms
 * @param {string|Date} invoiceDate - Invoice date
 * @param {number} paymentTerms - Payment terms in days
 * @returns {string} Due date in ISO format
 */
function calculateDueDate(invoiceDate, paymentTerms = 30) {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + paymentTerms);
  return date.toISOString();
}

/**
 * Marks invoice as sent
 * @param {Object} invoice - Invoice to mark as sent
 * @returns {Object} Updated invoice object (immutable)
 */
export function markInvoiceAsSent(invoice) {
  if (!invoice) {
    throw new Error('Invoice is required');
  }

  return {
    ...invoice,
    status: 'Sent',
    sentDate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Marks invoice as paid
 * @param {Object} invoice - Invoice to mark as paid
 * @param {string} paymentDate - Payment date
 * @returns {Object} Updated invoice object (immutable)
 */
export function markInvoiceAsPaid(invoice, paymentDate) {
  if (!invoice) {
    throw new Error('Invoice is required');
  }

  return {
    ...invoice,
    status: 'Paid',
    paidDate: paymentDate || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Checks if invoice is overdue
 * @param {Object} invoice - Invoice to check
 * @returns {boolean} True if overdue
 */
export function isInvoiceOverdue(invoice) {
  if (!invoice || invoice.status === 'Paid') {
    return false;
  }

  const dueDate = new Date(invoice.dueDate);
  const today = new Date();

  return today > dueDate;
}

/**
 * Filters invoices by status
 * @param {Array<Object>} invoices - Array of invoice objects
 * @param {string} status - Status to filter by
 * @returns {Array<Object>} Filtered invoices
 */
export function filterInvoicesByStatus(invoices, status) {
  if (!Array.isArray(invoices)) {
    throw new Error('Invoices must be an array');
  }

  if (!status || typeof status !== 'string') {
    throw new Error('Status must be a non-empty string');
  }

  return invoices.filter(invoice => invoice.status === status);
}

/**
 * Calculates total revenue from invoices
 * @param {Array<Object>} invoices - Array of invoice objects
 * @param {string} status - Optional status filter ('Paid' to get only paid revenue)
 * @returns {number} Total revenue
 */
export function calculateTotalRevenue(invoices, status = null) {
  if (!Array.isArray(invoices)) {
    throw new Error('Invoices must be an array');
  }

  const filteredInvoices = status
    ? invoices.filter(inv => inv.status === status)
    : invoices;

  return filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
}
