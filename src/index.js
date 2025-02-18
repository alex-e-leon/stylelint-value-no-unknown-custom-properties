import stylelint from 'stylelint';
import getCustomPropertiesFromRoot from './lib/get-custom-properties-from-root';
import getCustomPropertiesFromImports from './lib/get-custom-properties-from-imports';
import validateResult from './lib/validate-result';
import messages from './lib/messages';
import ruleName from './lib/rule-name';

export default stylelint.createPlugin(ruleName, (method, opts) => {
	// sources to import custom selectors from
	const importFrom = [].concat(Object(opts).importFrom || []);
	const resolver = Object(opts).resolver || {};

	// promise any custom selectors are imported
	const customPropertiesPromise = isMethodEnabled(method)
		? getCustomPropertiesFromImports(importFrom, resolver)
		: {};

	return async (root, result) => {
		// validate the method
		const isMethodValid = stylelint.utils.validateOptions(result, ruleName, {
			actual: method,
			possible() {
				return isMethodEnabled(method) || isMethodDisabled(method);
			},
		});

		if (isMethodValid && isMethodEnabled(method)) {
			// all custom properties from the file and imports
			const customProperties = Object.assign(
				await customPropertiesPromise,
				await getCustomPropertiesFromRoot(root, resolver),
			);

			// validate the css root
			validateResult(result, customProperties);
		}
	};
});

export { messages, ruleName };

const isMethodEnabled = method => method === true;
const isMethodDisabled = method => method === null || method === false;
