import {
	Profile,
	Level,
	ProfileLevelId,
	parseProfileLevelId,
	profileLevelIdToString,
	parseSdpProfileLevelId,
	isSameProfile,
	isSameProfileAndLevel,
	generateProfileLevelIdStringForAnswer,
	supportedLevel,
} from '../';

describe('parseProfileLevelId()', () => {
	test('parse level', () => {
		expect(parseProfileLevelId('42e01f')?.level).toBe(Level.L3_1);

		expect(parseProfileLevelId('42e00b')?.level).toBe(Level.L1_1);

		expect(parseProfileLevelId('42f00b')?.level).toBe(Level.L1_b);

		expect(parseProfileLevelId('42C02A')?.level).toBe(Level.L4_2);

		expect(parseProfileLevelId('640c34')?.level).toBe(Level.L5_2);
	});

	test('Profile.ConstrainedBaseline', () => {
		expect(parseProfileLevelId('42e01f')?.profile).toBe(
			Profile.ConstrainedBaseline
		);

		expect(parseProfileLevelId('42C02A')?.profile).toBe(
			Profile.ConstrainedBaseline
		);

		expect(parseProfileLevelId('4de01f')?.profile).toBe(
			Profile.ConstrainedBaseline
		);

		expect(parseProfileLevelId('58f01f')?.profile).toBe(
			Profile.ConstrainedBaseline
		);
	});

	test('Profile.Baseline', () => {
		expect(parseProfileLevelId('42a01f')?.profile).toBe(Profile.Baseline);

		expect(parseProfileLevelId('58A01F')?.profile).toBe(Profile.Baseline);
	});

	test('Profile.Main', () => {
		expect(parseProfileLevelId('4D401f')?.profile).toBe(Profile.Main);
	});

	test('Profile.High', () => {
		expect(parseProfileLevelId('64001f')?.profile).toBe(Profile.High);
	});

	test('Profile.ConstrainedHigh', () => {
		expect(parseProfileLevelId('640c1f')?.profile).toBe(
			Profile.ConstrainedHigh
		);
	});

	test('invalid value', () => {
		/* Malformed strings. */

		// @ts-expect-error --- Invalid empty argument.
		expect(parseProfileLevelId()).toBeUndefined();

		expect(parseProfileLevelId('')).toBeUndefined();

		expect(parseProfileLevelId(' 42e01f')).toBeUndefined();

		expect(parseProfileLevelId('4242e01f')).toBeUndefined();

		expect(parseProfileLevelId('e01f')).toBeUndefined();

		expect(parseProfileLevelId('gggggg')).toBeUndefined();

		/* Invalid level. */

		expect(parseProfileLevelId('42e000')).toBeUndefined();

		expect(parseProfileLevelId('42e00f')).toBeUndefined();

		expect(parseProfileLevelId('42e0ff')).toBeUndefined();

		/* Invalid profile. */

		expect(parseProfileLevelId('42e11f')).toBeUndefined();

		expect(parseProfileLevelId('58601f')).toBeUndefined();

		expect(parseProfileLevelId('64e01f')).toBeUndefined();
	});
});

describe('profileLevelIdToString()', () => {
	test('various', () => {
		expect(
			profileLevelIdToString(
				new ProfileLevelId(Profile.ConstrainedBaseline, Level.L3_1)
			)
		).toBe('42e01f');

		expect(
			profileLevelIdToString(new ProfileLevelId(Profile.Baseline, Level.L1))
		).toBe('42000a');

		expect(
			profileLevelIdToString(new ProfileLevelId(Profile.Main, Level.L3_1))
		).toBe('4d001f');

		expect(
			profileLevelIdToString(
				new ProfileLevelId(Profile.ConstrainedHigh, Level.L4_2)
			)
		).toBe('640c2a');

		expect(
			profileLevelIdToString(new ProfileLevelId(Profile.High, Level.L4_2))
		).toBe('64002a');
	});

	test('Level.L1_b', () => {
		expect(
			profileLevelIdToString(
				new ProfileLevelId(Profile.ConstrainedBaseline, Level.L1_b)
			)
		).toBe('42f00b');

		expect(
			profileLevelIdToString(new ProfileLevelId(Profile.Baseline, Level.L1_b))
		).toBe('42100b');

		expect(
			profileLevelIdToString(new ProfileLevelId(Profile.Main, Level.L1_b))
		).toBe('4d100b');
	});

	test('round trip', () => {
		expect(profileLevelIdToString(parseProfileLevelId('42e01f')!)).toBe(
			'42e01f'
		);

		expect(profileLevelIdToString(parseProfileLevelId('42E01F')!)).toBe(
			'42e01f'
		);

		expect(profileLevelIdToString(parseProfileLevelId('4d100b')!)).toBe(
			'4d100b'
		);

		expect(profileLevelIdToString(parseProfileLevelId('4D100B')!)).toBe(
			'4d100b'
		);

		expect(profileLevelIdToString(parseProfileLevelId('640c2a')!)).toBe(
			'640c2a'
		);

		expect(profileLevelIdToString(parseProfileLevelId('640C2A')!)).toBe(
			'640c2a'
		);
	});

	test('invalid value', () => {
		expect(
			profileLevelIdToString(new ProfileLevelId(Profile.High, Level.L1_b))
		).toBeUndefined();

		expect(
			profileLevelIdToString(
				new ProfileLevelId(Profile.ConstrainedHigh, Level.L1_b)
			)
		).toBeUndefined();

		expect(
			profileLevelIdToString(new ProfileLevelId(255 as Profile, Level.L3_1))
		).toBeUndefined();
	});
});

describe('parseSdpProfileLevelId()', () => {
	test('empty value', () => {
		const profile_level_id = parseSdpProfileLevelId();

		expect(profile_level_id).toBeDefined();
		expect(profile_level_id?.profile).toBe(Profile.ConstrainedBaseline);
		expect(profile_level_id?.level).toBe(Level.L3_1);
	});

	test('Profile.ConstrainedHigh', () => {
		const params = { 'profile-level-id': '640c2a' };
		const profile_level_id = parseSdpProfileLevelId(params);

		expect(profile_level_id).toBeDefined();
		expect(profile_level_id?.profile).toBe(Profile.ConstrainedHigh);
		expect(profile_level_id?.level).toBe(Level.L4_2);
	});

	test('invalid value', () => {
		const params = { 'profile-level-id': 'foobar' };

		expect(parseSdpProfileLevelId(params)).toBeUndefined();
	});
});

describe('isSameProfile()', () => {
	test('same profile', () => {
		expect(isSameProfile({ foo: 'foo' }, { bar: 'bar' })).toBe(true);

		expect(
			isSameProfile(
				{ 'profile-level-id': '42e01f' },
				{ 'profile-level-id': '42C02A' }
			)
		).toBe(true);

		expect(
			isSameProfile(
				{ 'profile-level-id': '42a01f' },
				{ 'profile-level-id': '58A01F' }
			)
		).toBe(true);

		expect(isSameProfile({ 'profile-level-id': '42e01f' }, undefined)).toBe(
			true
		);
	});

	test('not same profile', () => {
		expect(isSameProfile(undefined, { 'profile-level-id': '4d001f' })).toBe(
			false
		);

		expect(
			isSameProfile(
				{ 'profile-level-id': '42a01f' },
				{ 'profile-level-id': '640c1f' }
			)
		).toBe(false);

		expect(
			isSameProfile(
				{ 'profile-level-id': '42000a' },
				{ 'profile-level-id': '64002a' }
			)
		).toBe(false);
	});
});

describe('isSameProfileAndLevel()', () => {
	test('same profile and level', () => {
		expect(isSameProfileAndLevel({ foo: 'foo' }, { bar: 'bar' })).toBe(true);

		expect(
			isSameProfileAndLevel(
				{ 'profile-level-id': '42e01f' },
				{ 'profile-level-id': '42f01f' }
			)
		).toBe(true);

		expect(
			isSameProfileAndLevel(
				{ 'profile-level-id': '42a01f' },
				{ 'profile-level-id': '58A01F' }
			)
		).toBe(true);

		expect(
			isSameProfileAndLevel({ 'profile-level-id': '42e01f' }, undefined)
		).toBe(true);
	});

	test('not same profile', () => {
		expect(
			isSameProfileAndLevel(undefined, { 'profile-level-id': '4d001f' })
		).toBe(false);

		expect(
			isSameProfileAndLevel(
				{ 'profile-level-id': '42a01f' },
				{ 'profile-level-id': '640c1f' }
			)
		).toBe(false);

		expect(
			isSameProfileAndLevel(
				{ 'profile-level-id': '42000a' },
				{ 'profile-level-id': '64002a' }
			)
		).toBe(false);
	});
});

describe('generateProfileLevelIdStringForAnswer()', () => {
	test('empty SDP answer', () => {
		expect(
			generateProfileLevelIdStringForAnswer(undefined, undefined)
		).toBeUndefined();
	});

	test('level symmetry capped', () => {
		const low_level = {
			'profile-level-id': '42e015',
		};

		const high_level = {
			'profile-level-id': '42e01f',
		};

		expect(generateProfileLevelIdStringForAnswer(low_level, high_level)).toBe(
			'42e015'
		);

		expect(generateProfileLevelIdStringForAnswer(high_level, low_level)).toBe(
			'42e015'
		);
	});

	test('Profile.ConstrainedBaseline with level asymmetry', () => {
		const local_params = {
			'profile-level-id': '42e01f',
			'level-asymmetry-allowed': '1',
		};

		const remote_params = {
			'profile-level-id': '42e015',
			'level-asymmetry-allowed': '1',
		};

		expect(
			generateProfileLevelIdStringForAnswer(local_params, remote_params)
		).toBe('42e01f');
	});
});

describe('supportedLevel()', () => {
	test('valid values', () => {
		expect(supportedLevel(640 * 480, 25)).toBe(Level.L2_1);

		expect(supportedLevel(1280 * 720, 30)).toBe(Level.L3_1);

		expect(supportedLevel(1920 * 1280, 60)).toBe(Level.L4_2);
	});

	test('invalid values', () => {
		expect(supportedLevel(0, 0)).toBeUndefined();

		// All levels support fps > 5.
		expect(supportedLevel(1280 * 720, 5)).toBeUndefined();

		// All levels support frame sizes > 183 * 137.
		expect(supportedLevel(183 * 137, 30)).toBeUndefined();
	});
});
