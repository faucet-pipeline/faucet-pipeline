let { loadExtension, abort, repr } = require("./util");

let DEFAULTS = {
	host: "localhost",
	port: 3000
};

exports.static = (config, webroot, devServer = {}) => {
	if(devServer.middlewares) {
		abort("--static doesn't support middlewares right now, use --liveserve");
	}

	let donny = loadExtension("donny", "failed to activate server");
	let [host, port] = parseHost(config);

	donny({ port, bind: host, webroot }).
		then(() => {
			console.error(`serving ${repr(webroot)} at http://${host}:${port}`);
		});
};

exports.live = (config, root, devServer = {}) => {
	let liveServer = loadExtension("live-server", "failed to activate live-server");
	let [host, port] = parseHost(config);
	let middleware = devServer.middlewares || [];

	liveServer.start({ port, host, root, middleware, open: false });
};

exports._parseHost = parseHost;

function parseHost(config) {
	let { host, port } = DEFAULTS;
	if(config === true) {
		return [host, port];
	}
	if(!isNaN(config)) { // number or numeric string
		port = config;
	} else if(config.substr(0, 1) === ":") { // port only
		port = config.substr(1);
	} else {
		let i = config.lastIndexOf(":");
		if(i === -1) {
			abort(`invalid host parameter: ${repr(config, false)} (missing port)`);
		}
		host = config.substr(0, i);
		port = config.substr(i + 1);
	}
	return [host, port.substr ? parseInt(port, 10) : port];
}
