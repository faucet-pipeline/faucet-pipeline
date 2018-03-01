"use strict";

let path = require("path");
let createFile = require("./util/files");
let { abort, repr } = require("./util");

let retryTimings = [10, 50, 100, 250, 500, 1000];

module.exports = class Manifest {
	constructor(filepath, { key, value, baseURI, webRoot }, assetManager) {
		this.filepath = filepath;

		if(key === "short") {
			this.keyTransform = (f, targetDir) => path.relative(targetDir, f);
		} else if(key) {
			this.keyTransform = key;
		} else {
			this.keyTransform = filepath => filepath;
		}

		if(value && (baseURI || webRoot)) {
			abort("Either provide a value OR baseURI and/or webRoot");
		} else if(value) {
			this.valueTransform = value;
		} else {
			baseURI = baseURI || "/";
			webRoot = assetManager.resolvePath(webRoot || "./", {
				enforceRelative: true
			});
			this.valueTransform = filepath => baseURI + path.relative(webRoot, filepath);
		}

		this._index = {};

		this._resolve = this._resolve.bind(this);
	}

	// repeatedly attempts `#get` until it resolves successfully or times out
	resolve(originalPath) {
		return retry(this._resolve, retryTimings)(originalPath);
	}

	_resolve(originalPath) {
		return new Promise((resolve, reject) => {
			let actualPath = this.get(originalPath);
			if(actualPath) {
				resolve(actualPath);
			} else {
				reject(new Error(`could not find asset ${repr(originalPath)}`));
			}
		});
	}

	get(originalPath) {
		return this._index[originalPath];
	}

	set(originalPath, actualPath, targetDir) {
		let key = this.keyTransform(originalPath, targetDir);
		let uri = this.valueTransform(actualPath);
		this._index[key] = uri;

		let fp = this.filepath;
		return fp ? createFile(fp, this.toJSON()) : Promise.resolve(null);
	}

	toJSON() {
		return JSON.stringify(this._index) + "\n";
	}
};

// repeatedly invokes a function which returns a promise until it is resolved or
// all `retries` are exhausted
// `retries` is an array of milliseconds to wait in between attempts
// returns a new function that wraps `fn`, accepting the same arguments
function retry(fn, retries) {
	return (...params) => fn(...params).
		catch(err => {
			if(retries.length === 0) {
				throw err;
			}

			let backoff = retries.shift();
			return wait(backoff).
				then(_ => retry(fn, retries)(...params));
		});
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
