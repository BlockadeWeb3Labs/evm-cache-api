function stripFiltersFromEmail(email) {
	let email_split = email.split("@");
	let email_without_predicate = email_split[0].split("+")[0];
	return email_without_predicate + "@" + email_split[1];
}

module.exports = stripFiltersFromEmail;
