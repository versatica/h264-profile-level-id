const config = {
	verbose: true,
	testEnvironment: 'node',
	testRegex: 'src/tests/test.ts',
	transform: {
		// transpilation: true is needed to avoid warnigns. However we lose TS
		// checks. We don't care since we have TS tasks for that.
		// See https://kulshekhar.github.io/ts-jest/docs/getting-started/options/transpilation
		'^.+\\.ts?$': ['ts-jest', { transpilation: true }],
	},
	coveragePathIgnorePatterns: ['src/tests', 'src/Logger.ts'],
	cacheDirectory: '.cache/jest',
};

export default config;
