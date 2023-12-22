import {
	Profile,
	Level,
	ProfileLevelId,
	parseProfileLevelId,
	profileLevelIdToString,
	parseSdpProfileLevelId,
	isSameProfile,
	generateProfileLevelIdStringForAnswer
} from '../';

test('TestParsingInvalid', () =>
{
	// Malformed strings.
	// @ts-ignore
	expect(parseProfileLevelId()).toBeUndefined();
	expect(parseProfileLevelId('')).toBeUndefined();
	expect(parseProfileLevelId(' 42e01f')).toBeUndefined();
	expect(parseProfileLevelId('4242e01f')).toBeUndefined();
	expect(parseProfileLevelId('e01f')).toBeUndefined();
	expect(parseProfileLevelId('gggggg')).toBeUndefined();

	// Invalid level.
	expect(parseProfileLevelId('42e000')).toBeUndefined();
	expect(parseProfileLevelId('42e00f')).toBeUndefined();
	expect(parseProfileLevelId('42e0ff')).toBeUndefined();

	// Invalid profile.
	expect(parseProfileLevelId('42e11f')).toBeUndefined();
	expect(parseProfileLevelId('58601f')).toBeUndefined();
	expect(parseProfileLevelId('64e01f')).toBeUndefined();
});

test('TestParsingLevel', () =>
{
	expect(parseProfileLevelId('42e01f')?.level).toBe(Level.L3_1);
	expect(parseProfileLevelId('42e00b')?.level).toBe(Level.L1_1);
	expect(parseProfileLevelId('42f00b')?.level).toBe(Level.L1_b);
	expect(parseProfileLevelId('42C02A')?.level).toBe(Level.L4_2);
	expect(parseProfileLevelId('640c34')?.level).toBe(Level.L5_2);
});

test('TestParsingConstrainedBaseline', () =>
{
	expect(
		parseProfileLevelId('42e01f')?.profile
	).toBe(Profile.ConstrainedBaseline);

	expect(
		parseProfileLevelId('42C02A')?.profile
	).toBe(Profile.ConstrainedBaseline);

	expect(
		parseProfileLevelId('4de01f')?.profile
	).toBe(Profile.ConstrainedBaseline);

	expect(
		parseProfileLevelId('58f01f')?.profile
	).toBe(Profile.ConstrainedBaseline);
});

test('TestParsingBaseline', () =>
{
	expect(parseProfileLevelId('42a01f')?.profile).toBe(Profile.Baseline);
	expect(parseProfileLevelId('58A01F')?.profile).toBe(Profile.Baseline);
});

test('TestParsingMain', () =>
{
	expect(parseProfileLevelId('4D401f')?.profile).toBe(Profile.Main);
});

test('TestParsingHigh', () =>
{
	expect(parseProfileLevelId('64001f')?.profile).toBe(Profile.High);
});

test('TestParsingConstrainedHigh', () =>
{
	expect(parseProfileLevelId('640c1f')?.profile).toBe(Profile.ConstrainedHigh);
});

test('TestToString', () =>
{
	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.ConstrainedBaseline, Level.L3_1)
	)).toBe('42e01f');

	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.Baseline, Level.L1)
	)).toBe('42000a');

	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.Main, Level.L3_1)
	)).toBe('4d001f');

	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.ConstrainedHigh, Level.L4_2)
	)).toBe('640c2a');

	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.High, Level.L4_2)
	)).toBe('64002a');
});

test('TestToStringLevel1b', () =>
{
	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.ConstrainedBaseline, Level.L1_b)
	)).toBe('42f00b');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.Baseline, Level.L1_b))
	).toBe('42100b');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.Main, Level.L1_b))
	).toBe('4d100b');
});

test('TestToStringLevel1b', () =>
{
	expect(profileLevelIdToString(
		parseProfileLevelId('42e01f')!)
	).toBe('42e01f');

	expect(profileLevelIdToString(
		parseProfileLevelId('42E01F')!)
	).toBe('42e01f');

	expect(profileLevelIdToString(
		parseProfileLevelId('4d100b')!)
	).toBe('4d100b');

	expect(profileLevelIdToString(
		parseProfileLevelId('4D100B')!)
	).toBe('4d100b');

	expect(profileLevelIdToString(
		parseProfileLevelId('640c2a')!)
	).toBe('640c2a');

	expect(profileLevelIdToString(
		parseProfileLevelId('640C2A')!)
	).toBe('640c2a');
});

test('TestToStringInvalid', () =>
{
	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.High, Level.L1_b)
	)).toBeUndefined();

	expect(profileLevelIdToString(
		new ProfileLevelId(Profile.ConstrainedHigh, Level.L1_b)
	)).toBeUndefined();

	expect(profileLevelIdToString(
		new ProfileLevelId(255 as Profile, Level.L3_1)
	)).toBeUndefined();
});

test('TestParseSdpProfileLevelIdEmpty', () =>
{
	const profile_level_id = parseSdpProfileLevelId();

	expect(profile_level_id).toBeDefined();
	expect(profile_level_id?.profile).toBe(Profile.ConstrainedBaseline);
	expect(profile_level_id?.level).toBe(Level.L3_1);
});

test('TestParseSdpProfileLevelIdConstrainedHigh', () =>
{
	const params = { 'profile-level-id': '640c2a' };
	const profile_level_id = parseSdpProfileLevelId(params);

	expect(profile_level_id).toBeDefined();
	expect(profile_level_id?.profile).toBe(Profile.ConstrainedHigh);
	expect(profile_level_id?.level).toBe(Level.L4_2);
});

test('TestParseSdpProfileLevelIdInvalid', () =>
{
	const params = { 'profile-level-id': 'foobar' };

	expect(parseSdpProfileLevelId(params)).toBeUndefined();
});

test('TestIsSameProfile', () =>
{
	expect(isSameProfile({ foo: 'foo' }, { bar: 'bar' })).toBe(true);

	expect(isSameProfile(
		{ 'profile-level-id': '42e01f' },
		{ 'profile-level-id': '42C02A' }
	)).toBe(true);

	expect(isSameProfile(
		{ 'profile-level-id': '42a01f' },
		{ 'profile-level-id': '58A01F' }
	)).toBe(true);

	expect(
		isSameProfile({ 'profile-level-id': '42e01f' }, undefined)
	).toBe(true);
});

test('TestIsNotSameProfile', () =>
{
	expect(isSameProfile(
		undefined, { 'profile-level-id': '4d001f' }
	)).toBe(false);

	expect(isSameProfile(
		{ 'profile-level-id': '42a01f' }, { 'profile-level-id': '640c1f' }
	)).toBe(false);

	expect(isSameProfile(
		{ 'profile-level-id': '42000a' }, { 'profile-level-id': '64002a' }
	)).toBe(false);
});

test('TestGenerateProfileLevelIdForAnswerEmpty', () =>
{
	expect(generateProfileLevelIdStringForAnswer(
		undefined, undefined)
	).toBeUndefined();
});

test('TestGenerateProfileLevelIdForAnswerLevelSymmetryCapped', () =>
{
	const low_level =
	{
		'profile-level-id' : '42e015'
	};

	const high_level =
	{
		'profile-level-id' : '42e01f'
	};

	expect(generateProfileLevelIdStringForAnswer(
		low_level, high_level)
	).toBe('42e015');

	expect(generateProfileLevelIdStringForAnswer(
		high_level, low_level)
	).toBe('42e015');
});

test('TestGenerateProfileLevelIdForAnswerConstrainedBaselineLevelAsymmetry', () =>
{
	const local_params =
	{
		'profile-level-id'        : '42e01f',
		'level-asymmetry-allowed' : '1'
	};

	const remote_params =
	{
		'profile-level-id'        : '42e015',
		'level-asymmetry-allowed' : '1'
	};

	expect(generateProfileLevelIdStringForAnswer(
		local_params, remote_params)
	).toBe('42e01f');
});
