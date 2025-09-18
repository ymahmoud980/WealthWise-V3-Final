
import type { FinancialData } from './types';

export const initialFinancialData: FinancialData = {
    assets: {
        realEstate: [
            { id: 're1-apt1', name: "Building Apt 1 (GF)", location: "New Cairo", currentValue: 5000000, currency: "EGP", monthlyRent: 8500, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're1-apt2', name: "Building Apt 2 (1F)", location: "New Cairo", currentValue: 5000000, currency: "EGP", monthlyRent: 0, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're1-apt3', name: "Building Apt 3 (2F)", location: "New Cairo", currentValue: 5000000, currency: "EGP", monthlyRent: 11000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-11-01' },
            { id: 're1-apt4', name: "Building Apt 4 (3F)", location: "New Cairo", currentValue: 5000000, currency: "EGP", monthlyRent: 10000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-10-01' },
            { id: 're1-apt5', name: "Building Apt 5 (4F-1)", location: "New Cairo", currentValue: 3000000, currency: "EGP", monthlyRent: 8500, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-05-01' },
            { id: 're1-apt6', name: "Building Apt 6 (4F-2)", location: "New Cairo", currentValue: 3000000, currency: "EGP", monthlyRent: 8500, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-05-01' },
            { id: 're1-base', name: "Building Basement", location: "New Cairo", currentValue: 4000000, currency: "EGP", monthlyRent: 0, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're2', name: "Lotus Apt.", location: "New Cairo", currentValue: 6000000, currency: "EGP", monthlyRent: 11000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-08-01' },
            { id: 're3', name: "Enppi Apt.", location: "New Cairo", currentValue: 3500000, currency: "EGP", monthlyRent: 9000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-11-01' },
            { id: 're4', name: "Miami Apt.", location: "Alexandria", currentValue: 3000000, currency: "EGP", monthlyRent: 8000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're5', name: "City Light Apt. 1", location: "Alexandria", currentValue: 2270000, currency: "EGP", monthlyRent: 6000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're6', name: "City Light Apt. 2", location: "Alexandria", currentValue: 1650000, currency: "EGP", monthlyRent: 6000, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're7', name: "Land in Belqas", location: "Belqas", currentValue: 3000000, currency: "EGP", monthlyRent: 0, rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01' },
            { id: 're8', name: "Neurol Park Apt.", location: "Turkey", currentValue: 154000, currency: "USD", monthlyRent: 138000, rentCurrency: "TRY", rentDueDay: 1, rentFrequency: 'semi-annual', nextRentDueDate: '2026-01-01'},
            { id: 're9', name: "Adres Atakent Apt.", location: "Turkey", currentValue: 196000, currency: "USD", monthlyRent: 29000, rentCurrency: "TRY", rentDueDay: 8, rentFrequency: 'monthly', nextRentDueDate: '2025-08-08'},
            { id: 're10', name: "Innovia Apt. 1 (Mr. Ali)", location: "Turkey", currentValue: 95000, currency: "USD", monthlyRent: 13000, rentCurrency: "TRY", rentDueDay: 20, rentFrequency: 'monthly', nextRentDueDate: '2025-08-20'},
            { id: 're11', name: "Innovia Apt. 2", location: "Turkey", currentValue: 60000, currency: "USD", monthlyRent: 20000, rentCurrency: "TRY", rentDueDay: 1, rentFrequency: 'monthly', nextRentDueDate: '2025-09-01'},
        ],
        underDevelopment: [
            { id: 'ud1', name: 'Nile Admin (A4719)', location: 'New Capital', purchasePrice: 2414450, currentValue: 3621675, currency: 'EGP', linkedInstallmentId: 'i1' },
            { id: 'ud2', name: 'Nile Commercial (Co-A1050)', location: 'New Capital', purchasePrice: 8446984, currentValue: 12670476, currency: 'EGP', linkedInstallmentId: 'i2' },
            { id: 'ud3', name: 'Tycoon H2222', location: 'New Capital', purchasePrice: 10578141, currentValue: 14231416.5, currency: 'EGP', linkedInstallmentId: 'i3' },
            { id: 'ud4', name: 'Tycoon H2203', location: 'New Capital', purchasePrice: 10022052, currentValue: 15033078, currency: 'EGP', linkedInstallmentId: 'i4' },
            { id: 'ud5', name: 'Nurai (NUI-11A1-23)', location: 'New Capital', purchasePrice: 4334550, currentValue: 6501825, currency: 'EGP', linkedInstallmentId: 'i5' },
            { id: 'ud6', name: 'Dejoya Primero (S1/S-24)', location: 'New Capital', purchasePrice: 7875000, currentValue: 11812500, currency: 'EGP', linkedInstallmentId: 'i6' },
        ],
        cash: [
            { id: 'c1', location: "Egypt", amount: 2323596, currency: "EGP" },
            { id: 'c2', location: "Kuwait", amount: 11622, currency: "KWD" },
            { id: 'c3', location: "Turkey", amount: 115924, currency: "TRY" },
        ],
        gold: [ { id: 'g1', description: "Gold Bars", grams: 300 } ],
        otherAssets: [
            { id: 'oa1', description: "End of Service Allowance (KOC)", value: 82000, currency: "KWD" },
            { id: 'oa2', description: "Loan to Mahmoud (Receivable)", value: 677, currency: "KWD" }
        ],
        salary: { id: 's1', amount: 4000, currency: "KWD" }
    },
    liabilities: {
        loans: [
            { id: 'l1', lender: "Gulf Bank", initial: 20000, remaining: 16815, currency: "KWD", monthlyPayment: 395.860, finalPayment: "2029-10-01" },
            { id: 'l2', lender: "Gulf Bank", initial: 6238, remaining: 4781, currency: "KWD", monthlyPayment: 124.258, finalPayment: "2029-05-01" },
            { id: 'l3', lender: "Gulf Bank", initial: 23000, remaining: 21745.423, currency: "KWD", monthlyPayment: 456.543, finalPayment: "2030-05-01" },
            { id: 'l4', lender: "KOC Company", initial: 12396, remaining: 700, currency: "KWD", monthlyPayment: 344, finalPayment: "2025-10-22" },
        ],
        installments: [
            { id: 'i1', project: "Nile Admin (A4719)", developer: "Nile", total: 2414450, paid: 1207390, currency: "EGP", nextDueDate: "2026-07-01", amount: 241500, frequency: "Annual" },
            { id: 'i2', project: "Nile Commercial (Co-A1050)", developer: "Nile", total: 8446984, paid: 4223497, currency: "EGP", nextDueDate: "2026-07-01", amount: 844700, frequency: "Annual" },
            { id: 'i3', project: "Tycoon H2222", developer: "Nile", total: 10578141, paid: 4830267, currency: "EGP", nextDueDate: "2026-03-01", amount: 776300, frequency: "Semi-Annual" },
            { id: 'i4', project: "Tycoon H2203", developer: "Nile", total: 10022052, paid: 4282205, currency: "EGP", nextDueDate: "2026-03-01", amount: 820000, frequency: "Semi-Annual" },
            { id: 'i5', project: "Nurai (NUI-11A1-23)", developer: "MERCON", total: 4334550, paid: 546047, currency: "EGP", nextDueDate: "2025-09-25", amount: 135593, frequency: "Quarterly" },
            { id: 'i6', project: "Dejoya Primero (S1/S-24)", developer: "Taj Misr", total: 7875000, paid: 1181250, currency: "EGP", nextDueDate: "2025-08-17", amount: 157500, frequency: "Quarterly" },
        ]
    },
    monthlyExpenses: {
        household: [
            { id: 'he1', description: "Egypt Household", amount: 80000, currency: "EGP" },
            { id: 'he2', description: "Kuwait Household", amount: 350, currency: "KWD" }
        ]
    },
    history: [],
    lastUpdated: "2024-08-02T12:00:00.000Z"
};
