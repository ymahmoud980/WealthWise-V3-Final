import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east4'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const getMyTransactionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyTransactions');
}
getMyTransactionsRef.operationName = 'GetMyTransactions';

export function getMyTransactions(dc) {
  return executeQuery(getMyTransactionsRef(dc));
}

export const createTransactionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTransaction', inputVars);
}
createTransactionRef.operationName = 'CreateTransaction';

export function createTransaction(dcOrVars, vars) {
  return executeMutation(createTransactionRef(dcOrVars, vars));
}

export const listAccountsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAccounts');
}
listAccountsRef.operationName = 'ListAccounts';

export function listAccounts(dc) {
  return executeQuery(listAccountsRef(dc));
}

