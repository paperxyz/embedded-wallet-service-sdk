---
"@paperxyz/embedded-wallet-service-sdk": patch
---

docs: update inline docs to reflect current SDK interface

types: Developer's can now always expect `email` to be returned in the `InitializedUser.authDetails` object

BREAKING (internal): rename `storeCookieString` to `shouldStoreCookieString` in `AuthStoredTokenWithCookieReturnType`.

BREAKING: remove `getAddress` function in `EmbeddedWallet`. Developer's already have access to user's wallet address from the `InitializedUser` object that is returned from the auth methods like `Paper.auth.loginWithPaperModal()`.

BREAKING: `recoveryCode` param is now required in `loginWithHwtAuth` and `verifyPaperEmailLoginOtp` functions when the user is an existing user.
