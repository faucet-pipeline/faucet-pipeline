/* global describe, it */
"use strict";

let { generateFingerprint } = require("../lib/util");
let FileFinder = require("../lib/util/files/finder");
let path = require("path");
let assert = require("assert");

let assertSame = assert.strictEqual;
let assertDeep = assert.deepStrictEqual;

let FIXTURES_PATH = path.resolve(__dirname, "fixtures");

describe("fingerprinting", _ => {
	it("generates a content-dependent hash", () => {
		let fingerprint = generateFingerprint("/path/to/foo.js", "lorem ipsum");
		assertSame(fingerprint, "/path/to/foo-80a751fde577028640c419000e33eba6.js");

		fingerprint = generateFingerprint("/path/to/bar.js", "dolor sit amet");
		assertSame(fingerprint, "/path/to/bar-7afed6210e0b8fce023f06abd4490fa0.js");
	});

	it("supports files without extension", () => {
		let fingerprint = generateFingerprint("/path/to/baz", "lipsum");
		assertSame(fingerprint, "/path/to/baz-8047cfaac755e5c7f77af066123980a5");
	});
});

describe("FileFinder", _ => {
	it("finds all files within a folder", () => {
		let fileFinder = new FileFinder(FIXTURES_PATH);

		return fileFinder.all().
			then(allFiles => {
				assertDeep(allFiles, [
					"dud.js",
					"dummy/.keep",
					"dummy/index.js",
					"dummy/src.js",
					"node_modules/dummy/images/.keep",
					"node_modules/dummy/index.js",
					"node_modules/dummy/pkg.js",
					"node_modules/faucet-pipeline-dummy/index.js",
					"node_modules/faucet-pipeline-invalid-a/index.js",
					"node_modules/faucet-pipeline-invalid-b/index.js",
					"node_modules/faucet-pipeline-invalid-c/index.js",
					"node_modules/faucet-pipeline-js/index.js",
					"node_modules/faucet-pipeline-sass/index.js",
					"node_modules/faucet-pipeline-static/index.js"
				]);
			});
	});

	it("finds all files within a folder without dotfiles", () => {
		let fileFinder = new FileFinder(FIXTURES_PATH, { skipDotfiles: true });

		return fileFinder.all().
			then(allFiles => {
				assertDeep(allFiles, [
					"dud.js",
					"dummy/index.js",
					"dummy/src.js",
					"node_modules/dummy/index.js",
					"node_modules/dummy/pkg.js",
					"node_modules/faucet-pipeline-dummy/index.js",
					"node_modules/faucet-pipeline-invalid-a/index.js",
					"node_modules/faucet-pipeline-invalid-b/index.js",
					"node_modules/faucet-pipeline-invalid-c/index.js",
					"node_modules/faucet-pipeline-js/index.js",
					"node_modules/faucet-pipeline-sass/index.js",
					"node_modules/faucet-pipeline-static/index.js"
				]);
			});
	});

	it("finds all files within a folder with a filter", () => {
		let fileFinder = new FileFinder(FIXTURES_PATH, {
			filter: filename => path.basename(filename) === "index.js"
		});

		return fileFinder.all().
			then(allFiles => {
				assertDeep(allFiles, [
					"dummy/index.js",
					"node_modules/dummy/index.js",
					"node_modules/faucet-pipeline-dummy/index.js",
					"node_modules/faucet-pipeline-invalid-a/index.js",
					"node_modules/faucet-pipeline-invalid-b/index.js",
					"node_modules/faucet-pipeline-invalid-c/index.js",
					"node_modules/faucet-pipeline-js/index.js",
					"node_modules/faucet-pipeline-sass/index.js",
					"node_modules/faucet-pipeline-static/index.js"
				]);
			});
	});

	it("matches given files", () => {
		let fileFinder = new FileFinder(FIXTURES_PATH);
		let foo = [
			path.resolve(FIXTURES_PATH, "dummy/index.js"),
			path.resolve(FIXTURES_PATH, "something.js"),
			path.resolve(FIXTURES_PATH, "../other/something.js")
		];

		fileFinder.match(foo).
			then(allFiles => {
				assertDeep(allFiles, ["dummy/index.js", "something.js"]);
			});
	});

	it("matches given files without dotfiles", () => {
		let fileFinder = new FileFinder(FIXTURES_PATH, { skipDotfiles: true });
		let foo = [
			path.resolve(FIXTURES_PATH, ".secret")
		];

		return fileFinder.match(foo).
			then(allFiles => {
				assertDeep(allFiles, []);
			});
	});

	it("matches given files with custom finder", () => {
		let fileFinder = new FileFinder(FIXTURES_PATH, {
			filter: filename => path.basename(filename) === "index.js"
		});
		let foo = [
			path.resolve(FIXTURES_PATH, "index.js"),
			path.resolve(FIXTURES_PATH, "something.js")
		];

		fileFinder.match(foo).
			then(allFiles => {
				assertDeep(allFiles, ["index.js"]);
			});
	});
});
