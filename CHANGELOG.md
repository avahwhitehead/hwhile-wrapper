# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/sonrad10/hwhile-wrapper/compare/v1.1.0...v1.2.0) (2021-02-17)


### Features

* removed scope from package name ([2cd87a8](https://github.com/sonrad10/hwhile-wrapper/commit/2cd87a810e74d18b1b4c5cc3b9fabc23b155b0fa))

## 1.1.0 (2021-02-17)


### Features

* added `output` event to InteractiveConnector to allow proper (controlled) console output ([c109fb6](https://github.com/sonrad10/hwhile-wrapper/commit/c109fb6f60f460e2cd9900e59feccab0a6734b57))
* added automatic versioning ([6c803b9](https://github.com/sonrad10/hwhile-wrapper/commit/6c803b9f44e32ac0982cbbb36330d24fd893199c))
* Added basic connector for running while programs ([4c7b6a0](https://github.com/sonrad10/hwhile-wrapper/commit/4c7b6a0cb14651c4a78a054c682ac1cbcbaeebbc))
* added converter between binary trees and lists of binary trees ([83e6c0f](https://github.com/sonrad10/hwhile-wrapper/commit/83e6c0f3bb059fd7cf854d6e380819f61593f07f))
* added converter between binary trees and lists of integers ([7ccb9c5](https://github.com/sonrad10/hwhile-wrapper/commit/7ccb9c5c86a63b29f4b42ce47935e1873f3d4e5e))
* added converter between integers and BinaryTrees ([3b4086b](https://github.com/sonrad10/hwhile-wrapper/commit/3b4086bf709f36651a1dc392603f9e4f78a8d4dd))
* added lexer for parsing trees ([10d9d73](https://github.com/sonrad10/hwhile-wrapper/commit/10d9d73efae8a1ade5cf4a2327ddabfe26cefdcb))
* added support for running specific tests ([a92f1bd](https://github.com/sonrad10/hwhile-wrapper/commit/a92f1bdcf338597a86197e8fd8b9ef71c500963d))
* Moved interactive wrapper to its own file ([02cf46c](https://github.com/sonrad10/hwhile-wrapper/commit/02cf46c32bd5a2bea219fb88773a3e9e89359a14))
* started adding wrapper around the interactive hwhile interface ([ac8ff7f](https://github.com/sonrad10/hwhile-wrapper/commit/ac8ff7f759dd96a248e491a176b5991c6eb3b11d))


### Bug Fixes

* added back and properly implemented `delBreakpoint` (shouldn't have been deleted) ([5964535](https://github.com/sonrad10/hwhile-wrapper/commit/5964535f33647cc07a85593b2c581dab923fd279))
* added binary tree parser and tests ([2f26fa3](https://github.com/sonrad10/hwhile-wrapper/commit/2f26fa3a16a91eaebd305350a4052d15ce3385bd))
* added breakpoint check when loading a program ([bc32193](https://github.com/sonrad10/hwhile-wrapper/commit/bc32193c3a4e49c59f9d13100626226b56c47cb1))
* added custom error when trying to (un)set a breakpoint with no program name or loaded program ([b578022](https://github.com/sonrad10/hwhile-wrapper/commit/b578022aee6934ec1fea152f2b6e813313cee667))
* added missing async annotation ([b70d546](https://github.com/sonrad10/hwhile-wrapper/commit/b70d546605c68ae6e019aa254c75be4771ed82c1))
* added missing imports and definitions ([a997260](https://github.com/sonrad10/hwhile-wrapper/commit/a997260effa5086ee17e391e176a5c9ad03615fb))
* added missing type declarations ([57ad820](https://github.com/sonrad10/hwhile-wrapper/commit/57ad8209b62e6ec86c018265d01a7133a177da65))
* added return data to `run` explaining whether it stopped at a breakpoint or program end ([ceb3d90](https://github.com/sonrad10/hwhile-wrapper/commit/ceb3d90c290cc866291b81a659e87b7c71c0dc66))
* added support and tests for loading programs ([db1f07b](https://github.com/sonrad10/hwhile-wrapper/commit/db1f07b74306ae6d5f1b37a10c2ae8c1befb5f49))
* added syntax errors and tests to TreeLexer. ([26d9658](https://github.com/sonrad10/hwhile-wrapper/commit/26d96589a924850f6c3c39abbcecf376a584879d))
* added test for adding breakpoints without specifying 'prog' ([5f60fff](https://github.com/sonrad10/hwhile-wrapper/commit/5f60fff6d5f37bc7381ac081fdd03630bbf3c30a))
* allowed setting hwhile starting directory ([b523b58](https://github.com/sonrad10/hwhile-wrapper/commit/b523b58bb47616aca4b2dac3ceda7f05623935b9))
* changed `cd` to run using `execute` ([bea5e6b](https://github.com/sonrad10/hwhile-wrapper/commit/bea5e6b301c18c086d75abf7524c1bccdb59087b))
* changed to node module resolution ([9a710b1](https://github.com/sonrad10/hwhile-wrapper/commit/9a710b1333626466eb4d4012465fa9181aa0d00e))
* changed to using SyntaxException instead of Error ([88943bb](https://github.com/sonrad10/hwhile-wrapper/commit/88943bbfcb99aebe9ad230a07b3b8bf5034abad4))
* combined `expression` and `command` into `execute` as they did the same thing. ([5bd8c9c](https://github.com/sonrad10/hwhile-wrapper/commit/5bd8c9cf8480aefa3baeadf3f31131444cc961cb))
* extended try-finally around full tests to prevent hanging on fail ([2683ac6](https://github.com/sonrad10/hwhile-wrapper/commit/2683ac60de53956c2bc576166d5d35db821d2d3c))
* fixed a problem where output data was lost when an output session is split into multiple 'data' events ([4882a2c](https://github.com/sonrad10/hwhile-wrapper/commit/4882a2c2700d7524a75c2f07206164898b3e5c26))
* fixed error where TreeParser would not check if all tokens were consumed ([a633e5d](https://github.com/sonrad10/hwhile-wrapper/commit/a633e5dad40c639ac94c4a77491a83285210a2c2))
* moved `run` return type to on variable ([3b58b17](https://github.com/sonrad10/hwhile-wrapper/commit/3b58b179f2eac0ef02311ef1d89196dd35985b86))
* removed logging from `store()` ([7e7dbc1](https://github.com/sonrad10/hwhile-wrapper/commit/7e7dbc1516af0e9ecd55a8a430aefe87bfc43bbb))
* removed setting printmode option for sake of simplicity ([95c393c](https://github.com/sonrad10/hwhile-wrapper/commit/95c393c25345963c54abd8aeea17f13def482d24))
* removed unnecessary null checks ([e7ac23f](https://github.com/sonrad10/hwhile-wrapper/commit/e7ac23ffb969e1461c3791799e1a1bac36322dd3))
* replaced hardcoded tree with one generated from a list ([c42e71b](https://github.com/sonrad10/hwhile-wrapper/commit/c42e71b6fa38789b3b9fb642c7289647cec2979a))
* split TreeLexer tests into valid and invalid ([cca47f2](https://github.com/sonrad10/hwhile-wrapper/commit/cca47f2777df8964121a356b7835aa5d404ea101))
* stopped `execute` occasionally returning blank lines ([9e7d7d6](https://github.com/sonrad10/hwhile-wrapper/commit/9e7d7d66e440251c4011ba5de6018347d501d4d0))
* updated typescript ([ce7c2c3](https://github.com/sonrad10/hwhile-wrapper/commit/ce7c2c36160c9c26f2ee4d9827f65d9d1d97ec63))
