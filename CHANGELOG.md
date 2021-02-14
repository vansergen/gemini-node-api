# Changelog

## [3.1.0](https://github.com/vansergen/gemini-node-api/compare/v3.0.1...v3.1.0) (2021-02-05)

### Features

- add the `getSymbol` method ([d98ec03](https://github.com/vansergen/gemini-node-api/commit/d98ec03d48fcff7d58cd5b2dc928db4eb990d08b))

### Dependencies

- update `ws` to `v7.4.3` ([5e2fc35](https://github.com/vansergen/gemini-node-api/commit/5e2fc355a77bf040ed6475562e54d4137ae19261))

### [3.0.1](https://github.com/vansergen/gemini-node-api/compare/v3.0.0...v3.0.1) (2020-12-21)

### Dependencies

- update `rpc-bluebird` to `v3.0.1` ([1a61f64](https://github.com/vansergen/gemini-node-api/commit/1a61f646bf2980a508fbf8980f9eb99a62242ffa))

## [3.0.0](https://github.com/vansergen/gemini-node-api/compare/v2.1.0...v3.0.0) (2020-12-20)

### ⚠ BREAKING CHANGES

- drop Node `<14.15.3` support
- the main methods of the `WebsocketClient` class return promises
- update AuthenticatedClient
- pass `payload` as string
- the class `PublicClient` extends `FetchClient`
- drop Node `<12.20.0` support

### Bug Fixes

- package.json, package-lock.json & .snyk to reduce vulnerabilities ([3b5bc40](https://github.com/vansergen/gemini-node-api/commit/3b5bc4029e39154286d4828922898c5fd3e1f572))
- package.json, package-lock.json & .snyk to reduce vulnerabilities ([7a560e2](https://github.com/vansergen/gemini-node-api/commit/7a560e2147f84fd1775b6a8f5282c4a65aca3a0e))
- package.json, package-lock.json & .snyk to reduce vulnerabilities ([50c45e9](https://github.com/vansergen/gemini-node-api/commit/50c45e9325913a8f3dfa26941390dac7d44d40a5))
- update AuthenticatedClient ([d7336fd](https://github.com/vansergen/gemini-node-api/commit/d7336fdb4989ffa7b220715d54acd8af94fcae6d))
- upgrade @types/ws from 7.2.1 to 7.2.2 ([870a9b0](https://github.com/vansergen/gemini-node-api/commit/870a9b0a0f36433893f7f6e2fb227cb759787542))
- upgrade @types/ws from 7.2.3 to 7.2.6 ([783c1d3](https://github.com/vansergen/gemini-node-api/commit/783c1d3c23973466ed76001c927b39faac33d87b))
- upgrade rpc-bluebird from 2.0.2 to 2.0.3 ([700ca1f](https://github.com/vansergen/gemini-node-api/commit/700ca1f6bb904f01f94155fcf87c2e9f7ebab004))
- upgrade snyk from 1.316.1 to 1.352.1 ([757dfa9](https://github.com/vansergen/gemini-node-api/commit/757dfa955bb2fb9452694916812f9321a92d15cb))
- upgrade snyk from 1.352.1 to 1.388.0 ([295aaee](https://github.com/vansergen/gemini-node-api/commit/295aaee5adb358092d87c7accc0cb5a0a0c4d335))
- upgrade ws from 7.2.3 to 7.2.5 ([9a66b91](https://github.com/vansergen/gemini-node-api/commit/9a66b917527cb11a422418854abe6e9a4f4a2a7f))
- upgrade ws from 7.2.3 to 7.2.5 ([ae29355](https://github.com/vansergen/gemini-node-api/commit/ae29355c533cdace98398e5914cc97cdbf47183a))
- upgrade ws from 7.2.5 to 7.3.1 ([b5d2f4a](https://github.com/vansergen/gemini-node-api/commit/b5d2f4a5236c1aa5567be9469da98390bff0ba8c))

### Performance Improvements

- drop Node `<14.15.3` support ([bf0c9d5](https://github.com/vansergen/gemini-node-api/commit/bf0c9d5b6bee4155237b6e7060893774b7d5ad9c))
- pass `payload` as string ([e20a99c](https://github.com/vansergen/gemini-node-api/commit/e20a99c8e1a92c2f46ef4d36ad788d658bbbc276))
- the class `PublicClient` extends `FetchClient` ([e6c1c67](https://github.com/vansergen/gemini-node-api/commit/e6c1c67b900f4daa8aee276868e772f7fb34f6a7))
- the main methods of the `WebsocketClient` class return promises ([f4d0091](https://github.com/vansergen/gemini-node-api/commit/f4d009179eff15e50303c5eae9271f515015b9b6))

### Dependencies

- remove snyk ([62a896a](https://github.com/vansergen/gemini-node-api/commit/62a896a23899360a31585fb831a9e60ee86dba44))
- update `@types/ws` to `v7.4.0` ([4f16162](https://github.com/vansergen/gemini-node-api/commit/4f161629749edee51f942875e1a795e924fcf35c))
- update `rpc-bluebird` to `v3.0.0` ([44d5b4d](https://github.com/vansergen/gemini-node-api/commit/44d5b4d35cec2217c7244e43601dadea2b44cd2b))
- update `ws` to `v7.4.1` ([54f901e](https://github.com/vansergen/gemini-node-api/commit/54f901efa3218be1e10c097b6b320547d422c6a8))

### Miscellaneous Chores

- drop Node `<12.20.0` support ([c190963](https://github.com/vansergen/gemini-node-api/commit/c190963227124d8c90e5e875e9efb6a41f03b25d))