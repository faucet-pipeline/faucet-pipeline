"use strict";

let AssetManager = require("./manager");
let { abort, repr } = require("./util");
let browserslist = require("browserslist");

let DEFAULTS = {
	plugins: { // maps config identifiers to corresponding import identifiers
		js: "faucet-pipeline-js",
		sass: "faucet-pipeline-sass",
		static: "faucet-pipeline-static",
		images: "faucet-pipeline-images"
	}
};

module.exports = (referenceDir, config, { watch, fingerprint, compact, sourcemaps }) => {
	let assetManager = new AssetManager(referenceDir, {
		manifestConfig: config.manifest,
		fingerprint,
		exitOnError: !watch
	});
	let watcher = watch && makeWatcher(config.watchDirs, referenceDir,
			assetManager.resolvePath);
	let browsers = browserslist.findConfig(referenceDir) || {};

	let plugins = Object.assign({}, DEFAULTS.plugins, config.plugins);
	Object.keys(plugins).forEach(type => {
		let pluginConfig = config[type];
		if(!pluginConfig) {
			return;
		}

		let plugin = plugins[type];
		if(!plugin.call) {
			plugin = load(plugin);
		}
		plugin(pluginConfig, assetManager, { watcher, browsers, compact, sourcemaps });
	});
};

function makeWatcher(watchDirs, referenceDir, resolvePath) {
	let niteOwl = require("nite-owl");

	/* eslint-disable indent */
	watchDirs = watchDirs ?
			watchDirs.map(dir => resolvePath(dir, { enforceRelative: true })) :
			[referenceDir];
	/* eslint-enable indent */

	let watcher = niteOwl(watchDirs);
	watcher.on("error", err => {
		if(err.code === "ERR_TOO_MANY_FILES") {
			abort("ERROR: there are too many files being monitored - please " +
					"use the `watchDirs` configuration setting:\n" +
					// eslint-disable-next-line max-len
					"https://github.com/faucet-pipeline/faucet-pipeline#configuration-for-file-watching");
		}

		throw err;
	});
	return watcher;
}

function load(pkg) {
	try {
		return require(pkg);
	} catch(err) {
		if(err.code !== "MODULE_NOT_FOUND") {
			throw err;
		}
		abort(`ERROR: missing plugin - please install ${repr(pkg)}`);
	}
}
