
'use server';

/**
 * @fileOverview A flow to manage financial data in Firestore using the Firebase Admin SDK.
 *
 * - getFinancialData - A function that retrieves the shared financial data document.
 * - setFinancialData - A function that saves the shared financial data document.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import type {FinancialData} from '@/lib/types';
import {initialFinancialData} from '@/lib/data';

const FinancialDataSchema = z.any();

function initializeFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

export const getFinancialDataFlow = ai.defineFlow(
  {
    name: 'getFinancialDataFlow',
    inputSchema: z.void(),
    outputSchema: FinancialDataSchema,
  },
  async () => {
    const db = initializeFirebase();
    const docRef = db.collection('financialData').doc('shared');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as FinancialData;
    } else {
      // If no document exists, create one with the initial data and return it
      await docRef.set(initialFinancialData);
      return initialFinancialData;
    }
  }
);

export const setFinancialDataFlow = ai.defineFlow(
  {
    name: 'setFinancialDataFlow',
    inputSchema: FinancialDataSchema,
    outputSchema: z.object({success: z.boolean()}),
  },
  async (data) => {
    const db = initializeFirebase();
    const docRef = db.collection('financialData').doc('shared');
    await docRef.set(data);
    return { success: true };
  }
);

export async function getFinancialData(): Promise<FinancialData> {
  return await getFinancialDataFlow();
}

export async function setFinancialData(data: FinancialData): Promise<{success: boolean}> {
    return await setFinancialDataFlow(data);
}
