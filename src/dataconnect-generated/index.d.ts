import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Account_Key {
  id: UUIDString;
  __typename?: 'Account_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateTransactionData {
  transaction_insert: Transaction_Key;
}

export interface CreateTransactionVariables {
  accountId: UUIDString;
  categoryId?: UUIDString | null;
  amount: number;
  description: string;
  transactionDate: DateString;
  transactionType: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
}

export interface GetMyTransactionsData {
  transactions: ({
    id: UUIDString;
    amount: number;
    description?: string | null;
    transactionDate: DateString;
    transactionType: string;
    category?: {
      id: UUIDString;
      name: string;
    } & Category_Key;
      account: {
        id: UUIDString;
        name: string;
      } & Account_Key;
  } & Transaction_Key)[];
}

export interface Investment_Key {
  id: UUIDString;
  __typename?: 'Investment_Key';
}

export interface ListAccountsData {
  accounts: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    accountType: string;
    balance?: number | null;
  } & Account_Key)[];
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetMyTransactionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTransactionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyTransactionsData, undefined>;
  operationName: string;
}
export const getMyTransactionsRef: GetMyTransactionsRef;

export function getMyTransactions(): QueryPromise<GetMyTransactionsData, undefined>;
export function getMyTransactions(dc: DataConnect): QueryPromise<GetMyTransactionsData, undefined>;

interface CreateTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
  operationName: string;
}
export const createTransactionRef: CreateTransactionRef;

export function createTransaction(vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;
export function createTransaction(dc: DataConnect, vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;

interface ListAccountsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAccountsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAccountsData, undefined>;
  operationName: string;
}
export const listAccountsRef: ListAccountsRef;

export function listAccounts(): QueryPromise<ListAccountsData, undefined>;
export function listAccounts(dc: DataConnect): QueryPromise<ListAccountsData, undefined>;

