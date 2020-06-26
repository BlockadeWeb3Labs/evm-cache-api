function getParams(req) {
	if (req.body && Object.keys(req.body).length) {
		return req.body;
	} else if (req.query && Object.keys(req.query).length) {
		return req.query;
	}

	return {};
}

module.exports = getParams;
