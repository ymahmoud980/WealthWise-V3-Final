import type { Asset, Liability, UpcomingPayment, UpcomingRent, CashFlowItem } from './types';

export const assets: Asset[] = [
  { id: '1', name: 'Mountain View iCity', location: 'Egypt', type: 'Apartment', rentalIncome: 600, marketValue: 120000 },
  { id: '2', name: 'Bodrum Villa', location: 'Turkey', type: 'Villa', rentalIncome: 1500, marketValue: 450000 },
  { id: '3', name: 'North Coast Chalet', location: 'Egypt', type: 'Chalet', rentalIncome: 800, marketValue: 180000 },
  { id: '4', name: 'Istanbul Residence', location: 'Turkey', type: 'Apartment', rentalIncome: 900, marketValue: 250000 },
  { id: '5', name: 'New Cairo Apartment', location: 'Egypt', type: 'Apartment', rentalIncome: 750, marketValue: 150000 },
];

export const liabilities: Liability[] = [
  { id: 'l1', name: 'iCity Apt. Installment', type: 'Real Estate', totalAmount: 100000, amountPaid: 40000, dueDate: '2028-12-31' },
  { id: 'l2', name: 'Car Loan', type: 'Loan', totalAmount: 30000, amountPaid: 15000, dueDate: '2026-06-30' },
  { id: 'l3', name: 'Bodrum Villa Mortgage', type: 'Real Estate', totalAmount: 300000, amountPaid: 120000, dueDate: '2035-01-01' },
];

export const upcomingPaymentsData: UpcomingPayment[] = [
    { id: 'p1', name: 'iCity Apt. Installment', amount: 833, dueDate: '2024-08-01' },
    { id: 'p2', name: 'Car Loan', amount: 500, dueDate: '2024-08-05' },
    { id: 'p3', name: 'Bodrum Villa Mortgage', amount: 1250, dueDate: '2024-08-15' },
    { id: 'p4', name: 'Credit Card Bill', amount: 700, dueDate: '2024-08-25' },
    { id: 'p5', name: 'iCity Apt. Installment', amount: 833, dueDate: '2024-09-01' },
    { id: 'p6', name: 'Car Loan', amount: 500, dueDate: '2024-09-05' },
    { id: 'p7', name: 'Bodrum Villa Mortgage', amount: 1250, dueDate: '2024-09-15' },
    { id: 'p8', name: 'iCity Apt. Installment', amount: 833, dueDate: '2024-10-01' },
    { id: 'p9', name: 'Car Loan', amount: 500, dueDate: '2024-10-05' },
    { id: 'p10', name: 'Bodrum Villa Mortgage', amount: 1250, dueDate: '2024-10-15' },
];

export const upcomingRentsData: UpcomingRent[] = [
    { id: 'r1', property: 'New Cairo Apartment', amount: 750, dueDate: '2024-08-01' },
    { id: 'r2', property: 'Istanbul Residence', amount: 900, dueDate: '2024-08-05' },
    { id: 'r3', property: 'Mountain View iCity', amount: 600, dueDate: '2024-08-10' },
    { id: 'r4', property: 'North Coast Chalet', amount: 800, dueDate: '2024-08-20' },
    { id: 'r5', property: 'New Cairo Apartment', amount: 750, dueDate: '2024-09-01' },
    { id: 'r6', property: 'Istanbul Residence', amount: 900, dueDate: '2024-09-05' },
    { id: 'r7', property: 'Mountain View iCity', amount: 600, dueDate: '2024-09-10' },
    { id: 'r8', property: 'North Coast Chalet', amount: 800, dueDate: '2024-09-20' },
    { id: 'r9', property: 'New Cairo Apartment', amount: 750, dueDate: '2024-10-01' },
    { id: 'r10', property: 'Istanbul Residence', amount: 900, dueDate: '2024-10-05' },
];

export const cashFlowItems: CashFlowItem[] = [
    { name: 'Salary', amount: 4000, type: 'Income', category: 'Salary'},
    { name: 'Rental Income Egypt', amount: 2150, type: 'Income', category: 'Rental'},
    { name: 'Rental Income Turkey', amount: 2400, type: 'Income', category: 'Rental'},
    { name: 'Household Expenses (Egypt)', amount: 1000, type: 'Expense', category: 'Household'},
    { name: 'Household Expenses (Kuwait)', amount: 1500, type: 'Expense', category: 'Household'},
    { name: 'Average Installments', amount: 2083, type: 'Expense', category: 'Installments'},
];
