# @paperxyz/embedded-wallet-service-sdk

## 0.0.18

### Patch Changes

- 80ea5d7: feat: add `userWalletId` to user's `AuthDetails` type

## 0.0.17

### Patch Changes

- 4543071: feat: move ews to full non-custodial model
- bb3930a: docs: update inline docs to reflect current SDK interface

  types: Developer's can now always expect `email` to be returned in the `InitializedUser.authDetails` object

  BREAKING (internal): rename `storeCookieString` to `shouldStoreCookieString` in `AuthStoredTokenWithCookieReturnType`.

  BREAKING: remove `getAddress` function in `EmbeddedWallet`. Developer's already have access to user's wallet address from the `InitializedUser` object that is returned from the auth methods like `Paper.auth.loginWithPaperModal()`.

  BREAKING: `recoveryCode` param is now required in `loginWithHwtAuth` and `verifyPaperEmailLoginOtp` functions when the user is an existing user.

- af3a9d7: breaking: remove `success` from `sendPaperEmailLoginOtp` return type
- 7b3a663: BREAKING: rename the Chains type to Chain

## 0.0.16

### Patch Changes

- 35b6446: docs(headless email OTP auth): update documentation around headless auth for greater clarity
- e9349d2: feat(headless email OTP auth): add ability to support email OTP auth
  docs(headless email OTP auth): add code samples and function overview for headless auth
