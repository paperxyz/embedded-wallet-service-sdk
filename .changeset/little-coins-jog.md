---
"@paperxyz/embedded-wallet-service-sdk": patch
---

feat: add `isNewDevice` to `sendPaperEmailLoginOtp` function
Note that if you're asking the user for recovery code, checking for `isNewDevice` is now more accurate than checking for `isNewUser`. In particular, some existing user (`!isNewUser`) will not be required to enter their recovery phrase again when logging back into an existing device.

Passing in a `recoveryCode` even when `isNewDevice === false` will still work.

feat: allow users logging in and out of same device to not require recovery phrase

security: lock iframe post-messaging to paper domain

internal: removed `AuthStoredTokenReturnType` type.
remove unused `Modal.ts` and `UiCommunicator` files.
