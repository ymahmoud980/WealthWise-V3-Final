import { CreateUserData, CreateUserVariables, GetMyTransactionsData, CreateTransactionData, CreateTransactionVariables, ListAccountsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetMyTransactions(options?: useDataConnectQueryOptions<GetMyTransactionsData>): UseDataConnectQueryResult<GetMyTransactionsData, undefined>;
export function useGetMyTransactions(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyTransactionsData>): UseDataConnectQueryResult<GetMyTransactionsData, undefined>;

export function useCreateTransaction(options?: useDataConnectMutationOptions<CreateTransactionData, FirebaseError, CreateTransactionVariables>): UseDataConnectMutationResult<CreateTransactionData, CreateTransactionVariables>;
export function useCreateTransaction(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTransactionData, FirebaseError, CreateTransactionVariables>): UseDataConnectMutationResult<CreateTransactionData, CreateTransactionVariables>;

export function useListAccounts(options?: useDataConnectQueryOptions<ListAccountsData>): UseDataConnectQueryResult<ListAccountsData, undefined>;
export function useListAccounts(dc: DataConnect, options?: useDataConnectQueryOptions<ListAccountsData>): UseDataConnectQueryResult<ListAccountsData, undefined>;
