faucet-pipeline-core version history
====================================


v1.3.2
------

_2019-10-27_

notable changes for end users:

* improved host/port handling for `--server` and `--liveserve`

no significant changes for developers


v1.3.1
------

_2019-10-07_

notable changes for end users:

* fixed concurrent compilation
* fixed host/port handling for `--server` and `--liveserve`

no significant changes for developers


v1.3.0
------

_2019-09-02_

(this version was erroneously released as v1.2.x before, violating semantic
versioning)

notable changes for end users:

* dropped support for Node 6
* path resolution now expects non-relative paths (e.g. `my-lib/util.js`) to
  reside within `node_modules`
* added `--serve` and `--liveserve` CLI options to serve the generated files
  via HTTP
* improved handling of boolean CLI arguments

notable changes for developers:

* exposed `webRoot` in `Manifest`


v1.2.0
------

_2018-11-29_

notable changes for end users:

* ensured parent paths (i.e. `../`) are permitted where configuration expects
  relative paths
* ensured consistent manifest representation, avoiding changes due to arbitrary
  ordering

notable changes for developers:

* added `loadExtension` utility function to prompt for installation of missing
  packages
* added `reportFileStatus` utility function
* fixed `Manifest#toJSON` return value


v1.1.0
------

_2018-10-23_

notable changes for end users:

* `manifest.target` is now optional, defaulting to an in-memory manifest

notable changes for developers:

* added `resolvePath` utility function
