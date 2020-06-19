"use strict";

let { Manifest } = require("@faucet-pipeline/marx");
let createFile = require("./util/files");
let resolvePath = require("./util/resolve");
let { reportFileStatus, abort, generateFingerprint } = require("./util");
let path = require("path");

module.exports = class AssetManager {
	constructor(referenceDir, { manifestConfig, fingerprint, exitOnError } = {}) {
		this.referenceDir = referenceDir;
		this.fingerprint = fingerprint;
		this.exitOnError = exitOnError;

		this.writeFile = this.writeFile.bind(this); // for convenience
		this.resolvePath = filepath => resolvePath(filepath, referenceDir);

		this.manifest = new Manifest(referenceDir, manifestConfig || {});
	}

	// NB: `fingerprint` option takes precedence over corresponding instance property
	writeFile(filepath, data, { targetDir, fingerprint = this.fingerprint, error } = {}) {
		if(!targetDir) {
			targetDir = path.dirname(filepath);
		}

		let originalPath = filepath;
		if(fingerprint) {
			filepath = generateFingerprint(filepath, data);
		}

		return createFile(filepath, data).
			then(_ => this.manifest &&
					this._updateManifest(originalPath, filepath, targetDir)).
			then(_ => {
				reportFileStatus(originalPath, this.referenceDir, error);
				if(error && this.exitOnError) {
					throw error;
				}
			}).
			catch(err => { // eslint-disable-line handle-callback-err
				abort(`aborting: ${err}`);
			});
	}

	get packagesDir() {
		let memo = this._packagesDir;
		if(!memo) {
			memo = this._packagesDir = this.resolvePath("./node_modules");
		}
		return memo;
	}

	_updateManifest(originalPath, actualPath, targetDir) {
		let { referenceDir } = this;
		originalPath = path.relative(referenceDir, originalPath);
		actualPath = path.relative(referenceDir, actualPath);
		return this.manifest.set(originalPath, actualPath, targetDir);
	}
};
