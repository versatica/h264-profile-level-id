const config = {
	verbose: true,
	testEnvironment: 'node',
	testRegex: 'src/tests/test.ts',
	transform: {
		'^.+\\.ts?$': ['ts-jest'],
	},
	coveragePathIgnorePatterns: ['src/tests', 'src/Logger.ts'],
	cacheDirectory: '.cache/jest',
};

export default config;
