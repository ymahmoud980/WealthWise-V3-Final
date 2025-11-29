# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMyTransactions*](#getmytransactions)
  - [*ListAccounts*](#listaccounts)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*CreateTransaction*](#createtransaction)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMyTransactions
You can execute the `GetMyTransactions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyTransactions(): QueryPromise<GetMyTransactionsData, undefined>;

interface GetMyTransactionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTransactionsData, undefined>;
}
export const getMyTransactionsRef: GetMyTransactionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyTransactions(dc: DataConnect): QueryPromise<GetMyTransactionsData, undefined>;

interface GetMyTransactionsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyTransactionsData, undefined>;
}
export const getMyTransactionsRef: GetMyTransactionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyTransactionsRef:
```typescript
const name = getMyTransactionsRef.operationName;
console.log(name);
```

### Variables
The `GetMyTransactions` query has no variables.
### Return Type
Recall that executing the `GetMyTransactions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyTransactionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyTransactions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyTransactions } from '@dataconnect/generated';


// Call the `getMyTransactions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyTransactions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyTransactions(dataConnect);

console.log(data.transactions);

// Or, you can use the `Promise` API.
getMyTransactions().then((response) => {
  const data = response.data;
  console.log(data.transactions);
});
```

### Using `GetMyTransactions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyTransactionsRef } from '@dataconnect/generated';


// Call the `getMyTransactionsRef()` function to get a reference to the query.
const ref = getMyTransactionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyTransactionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.transactions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.transactions);
});
```

## ListAccounts
You can execute the `ListAccounts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAccounts(): QueryPromise<ListAccountsData, undefined>;

interface ListAccountsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAccountsData, undefined>;
}
export const listAccountsRef: ListAccountsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAccounts(dc: DataConnect): QueryPromise<ListAccountsData, undefined>;

interface ListAccountsRef {
  ...
  (dc: DataConnect): QueryRef<ListAccountsData, undefined>;
}
export const listAccountsRef: ListAccountsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAccountsRef:
```typescript
const name = listAccountsRef.operationName;
console.log(name);
```

### Variables
The `ListAccounts` query has no variables.
### Return Type
Recall that executing the `ListAccounts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAccountsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAccountsData {
  accounts: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    accountType: string;
    balance?: number | null;
  } & Account_Key)[];
}
```
### Using `ListAccounts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAccounts } from '@dataconnect/generated';


// Call the `listAccounts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAccounts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAccounts(dataConnect);

console.log(data.accounts);

// Or, you can use the `Promise` API.
listAccounts().then((response) => {
  const data = response.data;
  console.log(data.accounts);
});
```

### Using `ListAccounts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAccountsRef } from '@dataconnect/generated';


// Call the `listAccountsRef()` function to get a reference to the query.
const ref = listAccountsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAccountsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.accounts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.accounts);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  displayName: string;
  email: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateTransaction
You can execute the `CreateTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTransaction(vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;

interface CreateTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
}
export const createTransactionRef: CreateTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTransaction(dc: DataConnect, vars: CreateTransactionVariables): MutationPromise<CreateTransactionData, CreateTransactionVariables>;

interface CreateTransactionRef {
  ...
  (dc: DataConnect, vars: CreateTransactionVariables): MutationRef<CreateTransactionData, CreateTransactionVariables>;
}
export const createTransactionRef: CreateTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTransactionRef:
```typescript
const name = createTransactionRef.operationName;
console.log(name);
```

### Variables
The `CreateTransaction` mutation requires an argument of type `CreateTransactionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTransactionVariables {
  accountId: UUIDString;
  categoryId?: UUIDString | null;
  amount: number;
  description: string;
  transactionDate: DateString;
  transactionType: string;
}
```
### Return Type
Recall that executing the `CreateTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTransactionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTransactionData {
  transaction_insert: Transaction_Key;
}
```
### Using `CreateTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTransaction, CreateTransactionVariables } from '@dataconnect/generated';

// The `CreateTransaction` mutation requires an argument of type `CreateTransactionVariables`:
const createTransactionVars: CreateTransactionVariables = {
  accountId: ..., 
  categoryId: ..., // optional
  amount: ..., 
  description: ..., 
  transactionDate: ..., 
  transactionType: ..., 
};

// Call the `createTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTransaction(createTransactionVars);
// Variables can be defined inline as well.
const { data } = await createTransaction({ accountId: ..., categoryId: ..., amount: ..., description: ..., transactionDate: ..., transactionType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTransaction(dataConnect, createTransactionVars);

console.log(data.transaction_insert);

// Or, you can use the `Promise` API.
createTransaction(createTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.transaction_insert);
});
```

### Using `CreateTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTransactionRef, CreateTransactionVariables } from '@dataconnect/generated';

// The `CreateTransaction` mutation requires an argument of type `CreateTransactionVariables`:
const createTransactionVars: CreateTransactionVariables = {
  accountId: ..., 
  categoryId: ..., // optional
  amount: ..., 
  description: ..., 
  transactionDate: ..., 
  transactionType: ..., 
};

// Call the `createTransactionRef()` function to get a reference to the mutation.
const ref = createTransactionRef(createTransactionVars);
// Variables can be defined inline as well.
const ref = createTransactionRef({ accountId: ..., categoryId: ..., amount: ..., description: ..., transactionDate: ..., transactionType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTransactionRef(dataConnect, createTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.transaction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.transaction_insert);
});
```

