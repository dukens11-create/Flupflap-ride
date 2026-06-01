# Changelog

## [1.1.0](https://github.com/dukens11-create/drive/compare/drive-home-mobile-v1.0.0...drive-home-mobile-v1.1.0) (2026-06-01)


### Features

* add CI/CD and deployment scaffolding ([a06c493](https://github.com/dukens11-create/drive/commit/a06c493e793da5587ff1772a27e13484a1650406))
* add food delivery features to passenger and driver mobile apps ([#9](https://github.com/dukens11-create/drive/issues/9)) ([4385496](https://github.com/dukens11-create/drive/commit/43854963e08d537136a1f092b79798568af95df3))
* add full-screen ride request popup ([a354143](https://github.com/dukens11-create/drive/commit/a354143ba25aa6ba302bd7e358e923113229b034))
* add in-app passenger communication system ([bf37649](https://github.com/dukens11-create/drive/commit/bf376496603e632dcb6c053f5eaead7468bd7475))
* add mobile driver alerts and background tracking ([052140e](https://github.com/dukens11-create/drive/commit/052140e04eff1850723d7c9ab93cf2f3fd41b8a8))
* expand driver navigation mode ([9d9d69c](https://github.com/dukens11-create/drive/commit/9d9d69c06562ef835dcf78f391a923b9888b1d76))
* improve driver trip request flow ([17e5e4a](https://github.com/dukens11-create/drive/commit/17e5e4a5169fdef43651e5be9936b95affd46aa0))
* in-app passenger communication system (call, chat, voice notes, translation, quick replies) ([64b73fe](https://github.com/dukens11-create/drive/commit/64b73fe72a61f15f33aeaa85f87dba79675af10a))
* migrate mobile app from Flutter to Expo React Native Drive Home ([7530647](https://github.com/dukens11-create/drive/commit/7530647eea176c0cc404cddf523ec19095ac6ea4))
* **mobile:** add phase 9 observability instrumentation ([7055064](https://github.com/dukens11-create/drive/commit/70550641af32377135568ef45188b0e3835c738e))
* **mobile:** phase 11 accessibility improvements and settings ([9733083](https://github.com/dukens11-create/drive/commit/9733083abbd1cf530429e7c018dca56dfe7c30b4))
* **mobile:** polish map routing and geolocation flow ([bcec92e](https://github.com/dukens11-create/drive/commit/bcec92eb13d528d43f1751c5799c7059ec1943b0))
* **mobile:** replace blank scaffold with minimal home layout ([6cc4c49](https://github.com/dukens11-create/drive/commit/6cc4c49476547a946c25c1969c0f8ae03a58ca2d))
* polish driver auth onboarding and safety UI ([7e59b03](https://github.com/dukens11-create/drive/commit/7e59b03add0393aed3d170888190efe00dddd57d))
* polish mobile accessibility and telemetry ([73d3c74](https://github.com/dukens11-create/drive/commit/73d3c747f77b0f5b33364502b12b8ceccd772931))
* upgrade the driver dashboard experience ([39ee29f](https://github.com/dukens11-create/drive/commit/39ee29fb510c6364ab7321a18c01c37803519f5a))
* wire Mapbox public token across all app surfaces ([997a7e0](https://github.com/dukens11-create/drive/commit/997a7e0f49abfd9c747ea0f3fafc934d06e576d3))


### Bug Fixes

* add accessibilityLabel to truncated route text in trips screen ([d048d4f](https://github.com/dukens11-create/drive/commit/d048d4f8e1fdf9139d29e4ed74f3dd650a6825f6))
* address review findings in realtime flow and map camera updates ([c682843](https://github.com/dukens11-create/drive/commit/c6828439cdb92f93b6fc10033e581976a8b7d264))
* bump react-native-worklets to 0.9.1 to satisfy react-native-reanimated@4.4.0 peer dep ([3964666](https://github.com/dukens11-create/drive/commit/3964666d2ccf2fa60eb2543102c8cc4f5cfb0555))
* clarify food delivery completion logic (advance state then check completed) ([4385496](https://github.com/dukens11-create/drive/commit/43854963e08d537136a1f092b79798568af95df3))
* clarify mobile background alerts ([b4d63d0](https://github.com/dukens11-create/drive/commit/b4d63d0a6669107655d62db0890fc1d2099332db))
* harden mobile telemetry and navigation polish ([00c7454](https://github.com/dukens11-create/drive/commit/00c7454ee10eb539b211ceab1f80e832269e8daa))
* keep navigation validation changes focused ([b4583b6](https://github.com/dukens11-create/drive/commit/b4583b6d8016912aa63ae368610a8520e7f13958))
* **mobile:** bump react-native-worklets to 0.9.1 to satisfy reanimated 4.4.0 peer dep ([30d98a3](https://github.com/dukens11-create/drive/commit/30d98a33cfe07127ca12ff49837883a1a2451c85))
* **mobile:** refine telemetry timing and trip transition logging ([38bb3e7](https://github.com/dukens11-create/drive/commit/38bb3e7c9f45c0bc857e2804a24574375b1fab1d))
* **mobile:** regenerate lockfile for npm ci sync ([b415d44](https://github.com/dukens11-create/drive/commit/b415d44e4b42670fd506e9e38437aaddce658087))
* polish driver request flow details ([92c785f](https://github.com/dukens11-create/drive/commit/92c785f833cae03307c031a827a0b5377b7880ad))
* polish mobile alert flow ([84f09da](https://github.com/dukens11-create/drive/commit/84f09da39186e32fce36791bd2e75080b1b287c3))
* prevent Android startup crash in release APK ([498a138](https://github.com/dukens11-create/drive/commit/498a13830183b5c12901dcb5e6175f7e09c9a9ad))
* refine mobile alert internals ([ce48cce](https://github.com/dukens11-create/drive/commit/ce48cce1b4196aa686428992bb0076144392ffd3))
* regenerate mobile/package-lock.json to resolve npm ci lockfile mismatch ([4711ad6](https://github.com/dukens11-create/drive/commit/4711ad6a65dbe10167b7ab7c79df042b9ddf0e48))
* regenerate mobile/package-lock.json to sync with package.json ([f06918a](https://github.com/dukens11-create/drive/commit/f06918aeb3c46411d713ade450ab700885df9688))
* remove fragile allergen 'none' string check (use empty array instead) ([4385496](https://github.com/dukens11-create/drive/commit/43854963e08d537136a1f092b79798568af95df3))
* resolve main merge conflicts in mobile screens ([cac9532](https://github.com/dukens11-create/drive/commit/cac9532201989ee42a136b83ee7e95538c43d2f5))
* resolve merge conflicts between phase-12 branch and main ([4d48e87](https://github.com/dukens11-create/drive/commit/4d48e87b93a04f51650685aed556580bcbc16616))
* resolve package-lock.json merge conflict by regenerating lockfile ([da67cdc](https://github.com/dukens11-create/drive/commit/da67cdc12065daa1e4b49d1b9cec52925ac73333))
* resolve PR merge conflicts ([7486bec](https://github.com/dukens11-create/drive/commit/7486bec4ecaf03010898acdcf12b066def6f8c36))
* stabilize the mocked trip dashboard data ([e26f436](https://github.com/dukens11-create/drive/commit/e26f4364dd6ae9eb69f5afe9afeba4a3b841a69e))
* three Android release startup crashes in Expo mobile app ([5d86478](https://github.com/dukens11-create/drive/commit/5d86478f187654a429a4f82a15b247590d1b4ee8))
* tighten mobile alert handling ([3c223a5](https://github.com/dukens11-create/drive/commit/3c223a542e9938c289bd5f9941d1af95fbaf1436))
