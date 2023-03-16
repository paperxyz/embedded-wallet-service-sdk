# @paperxyz/embedded-wallet-service-sdk

## 0.0.20

### Patch Changes

- 53a17f8: perf: cache calls for load times speed up

## 0.0.19

### Patch Changes

- 4323447: feat: add `isNewDevice` to `sendPaperEmailLoginOtp` function
  Note that if you're asking the user for recovery code, checking for `isNewDevice === true` is now more accurate than checking for `!isNewUser === true` when deciding whether to ask for recovery code. In particular, some existing user (`!isNewUser`) will no longer be required to enter their recovery phrase again when logging back into an existing device.

  Passing in a `recoveryCode` even when `isNewDevice === false` will still work.

  feat: allow users logging in and out of same device to not require recovery phrase

  security: lock iframe post-messaging to paper domain

  internal: removed `AuthStoredTokenReturnType` type.
  remove unused `Modal.ts` and `UiCommunicator` files.

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
