sap.ui.define([ "sap/ui/core/format/DateFormat", "sap/base/strings/formatMessage" ], function(DateFormat, formatMessage) {
	"use strict";
	return {

		/**
		 * formats a date into ex. "May 5, 2011"
		 * @returns {string} The formatted version of sDate.
		 * @param {string} sDate A string compatible with the constructor of Date.
		 */
		formatDate : function(sDate) {
			if (sDate) {
				var dateFormat = DateFormat.getDateTimeInstance({
					style : "medium"
				});
				return dateFormat.format(new Date(sDate));
			}

			return "";
		},

		/**
		 * Formats the given contact point system value in a icon
		 *
		 * @see @link{https://www.hl7.org/fhir/valueset-contact-point-system.html}
		 * @param {string} sContactPointSystem A contact point sytem value to be formatted.
		 * @returns {sap.ui.core.URI} sIconUrl
		 */
		formatContactPointSystemIcon : function(sContactPointSystem) {
			switch (sContactPointSystem) {
				case "phone":
					return "sap-icon://iphone";
				case "fax":
					return "sap-icon://fax-machine";
				case "email":
					return "sap-icon://email";
				case "pager":
					return "sap-icon://simulate";
				case "url":
					return "sap-icon://internet-browser";
				case "sms":
					return "sap-icon://ui-notifications";
				default:
					return "sap-icon://internet-browser";
			}

		},

		/**
         * Creates a string from a pattern by replacing placeholders with concrete values.
         *
         * @see sap/base/strings/formatMessage
	     * @param {string} sPattern A pattern string in the described syntax
	     * @param {any[]} [aValues=[]] The values to be used instead of the placeholders.
	     * @returns {string} The formatted result string
         */
		formatMessage: formatMessage

	};
});