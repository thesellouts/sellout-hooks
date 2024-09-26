# @thesellouts/sellout-hooks

This package provides a set of hooks and SDK functions for interacting with the Sellout protocol, designed to facilitate managing shows, artists, organizers, venues, and referrals on the blockchain. The hooks utilize TanStack React Query under the hood for data fetching and caching.

## Installation

You can install the package using npm or yarn:

```bash
pnpm install @thesellouts/sellout-hooks
```

or

```bash
yarn add @thesellouts/sellout-hooks
```

or

```bash
npm add @thesellouts/sellout-hooks
```

## Smart Account Support

This package supports both EOA (Externally Owned Accounts) and smart accounts using the `permissionless` library. Here's how it works:

- **With Provider**: If you pass `smartAccountClient` to the `SelloutProvider`, by default it will always use the smart account to execute functions. You can override this by passing `{ smart: false }` in the options argument of an SDK function call.

- **With Hooks**: By default, hooks use an EOA. To use a smart account, pass `smartAccountClient` in the options object when calling a hook.

## Usage

### Client-Side Usage (Hooks)

You can use the provided hooks directly without needing to wrap your application in a provider. However, you must provide the `chainId` when using the hooks. The hooks allow you to access the Sellout protocol's functionalities easily and use TanStack React Query for efficient data fetching and caching.

Here's an example of using a hook:

```jsx
import React from 'react';
import { useVote } from '@thesellouts/sellout-hooks';
import { base } from 'viem/chains';
import { SmartAccountClient } from 'permissionless';

const VoteComponent = ({ showId, proposalIndex }) => {
  const chainId = base.id;
  const smartAccountClient = /* your SmartAccountClient initialization */;

  const { mutate, isLoading, error } = useVote(
    { showId, proposalIndex, chainId },
    { smartAccountClient } // Optional: Use smart account
  );

  const handleVote = () => {
    mutate();
  };

  if (isLoading) return <div>Voting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <button onClick={handleVote}>Vote</button>;
};

export default VoteComponent;
```

### Server-Side Usage (SDK Functions)

To use SDK functions on the server-side, you need to initialize the SDK instance. Here's an example of using an SDK function:

```javascript
import { SelloutSDK } from '@thesellouts/sellout-hooks'
import { base } from 'viem/chains'

const handleVote = async () => {
  const chainId = base.id
  const sdk = new SelloutSDK(chainId)

  try {
    const result = await sdk.vote(
      { showId: '123', proposalIndex: 0 },
      { smart: false } // Optional: Force EOA usage even if smartAccountClient is provided
    )
    console.log('Vote cast:', result)
  } catch (error) {
    console.error('Error casting vote:', error)
  }
}
```

### Provider (Optional for Client-Side SDK Usage)

If you need to use SDK functions on the client-side, you can wrap your application in the `SelloutProvider`. This provider initializes the SDK instance and makes it available throughout your application.

Here's how to create and use the provider:

```jsx
import React from 'react';
import { SelloutProvider } from '@thesellouts/sellout-hooks';
import { SmartAccountClient } from 'permissionless';
import YourComponent from './YourComponent';

const App = () => {
  const chainId = base.id;
  const smartAccountClient = /* your SmartAccountClient initialization */;

  return (
    <SelloutProvider chainId={chainId} smartAccountClient={smartAccountClient}>
      <YourComponent />
    </SelloutProvider>
  );
};

export default App;
```

Then, in your components, you can use the `useSellout` hook to access the SDK instance:

```jsx
import React from 'react'
import { useSellout } from '@thesellouts/sellout-hooks'

const SomeComponent = () => {
  const { sdk } = useSellout()

  const handleVote = async () => {
    try {
      const result = await sdk.vote(
        { showId: '123', proposalIndex: 0 },
        { smart: false } // Optional: Explicitly don't use smart account (default if smartAccountClient is provided)
      )
      console.log('Vote cast:', result)
    } catch (error) {
      console.error('Error casting vote:', error)
    }
  }

  return <button onClick={handleVote}>Vote</button>
}

export default SomeComponent
```

## Summary

- Use hooks without a provider for easy access to Sellout functionalities on the client-side, providing `chainId` with each hook call.
- Use SDK functions directly for server-side operations.
- Optionally wrap your application in `SelloutProvider` for client-side SDK usage.
- Hooks utilize TanStack React Query for efficient data handling.
- Smart account support is available using the `permissionless` library:
  - With provider: Smart account used by default, override with `{ smart: false }`.
  - With hooks: EOA used by default, use smart account by passing `smartAccountClient` in options.

For more details, refer to the individual function and hook documentation in their respective files.
