/* eslint-disable no-unused-vars */
const {
	ProfileConstrainedBaseline,
	ProfileBaseline,
	ProfileMain,
	ProfileConstrainedHigh,
	ProfileHigh,
	Level1_b,
	Level1,
	Level1_1,
	Level1_2,
	Level1_3,
	Level2,
	Level2_1,
	Level2_2,
	Level3,
	Level3_1,
	Level3_2,
	Level4,
	Level4_1,
	Level4_2,
	Level5,
	Level5_1,
	Level5_2,
	ProfileLevelId,
	parseProfileLevelId,
	profileLevelIdToString,
	parseSdpProfileLevelId,
	isSameProfile,
	generateProfileLevelIdForAnswer
} = require('../');
/* eslint-enable no-unused-vars */

test('TestParsingInvalid', () =>
{
	// Malformed strings.
	expect(parseProfileLevelId()).toBeNull();
	expect(parseProfileLevelId('')).toBeNull();
	expect(parseProfileLevelId(' 42e01f')).toBeNull();
	expect(parseProfileLevelId('4242e01f')).toBeNull();
	expect(parseProfileLevelId('e01f')).toBeNull();
	expect(parseProfileLevelId('gggggg')).toBeNull();

	// Invalid level.
	expect(parseProfileLevelId('42e000')).toBeNull();
	expect(parseProfileLevelId('42e00f')).toBeNull();
	expect(parseProfileLevelId('42e0ff')).toBeNull();

	// Invalid profile.
	expect(parseProfileLevelId('42e11f')).toBeNull();
	expect(parseProfileLevelId('58601f')).toBeNull();
	expect(parseProfileLevelId('64e01f')).toBeNull();
});

test('TestParsingLevel', () =>
{
	expect(parseProfileLevelId('42e01f').level).toBe(Level3_1);
	expect(parseProfileLevelId('42e00b').level).toBe(Level1_1);
	expect(parseProfileLevelId('42f00b').level).toBe(Level1_b);
	expect(parseProfileLevelId('42C02A').level).toBe(Level4_2);
	expect(parseProfileLevelId('640c34').level).toBe(Level5_2);
});

test('TestParsingConstrainedBaseline', () =>
{
	expect(parseProfileLevelId('42e01f').profile).toBe(ProfileConstrainedBaseline);
	expect(parseProfileLevelId('42C02A').profile).toBe(ProfileConstrainedBaseline);
	expect(parseProfileLevelId('4de01f').profile).toBe(ProfileConstrainedBaseline);
	expect(parseProfileLevelId('58f01f').profile).toBe(ProfileConstrainedBaseline);
});

test('TestParsingBaseline', () =>
{
	expect(parseProfileLevelId('42a01f').profile).toBe(ProfileBaseline);
	expect(parseProfileLevelId('58A01F').profile).toBe(ProfileBaseline);
});

test('TestParsingMain', () =>
{
	expect(parseProfileLevelId('4D401f').profile).toBe(ProfileMain);
});

test('TestParsingHigh', () =>
{
	expect(parseProfileLevelId('64001f').profile).toBe(ProfileHigh);
});

test('TestParsingConstrainedHigh', () =>
{
	expect(parseProfileLevelId('640c1f').profile).toBe(ProfileConstrainedHigh);
});

test('TestToString', () =>
{
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileConstrainedBaseline, Level3_1))
	).toBe('42e01f');
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileBaseline, Level1))
	).toBe('42000a');
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileMain, Level3_1))
	).toBe('4d001f');
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileConstrainedHigh, Level4_2))
	).toBe('640c2a');
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileHigh, Level4_2))
	).toBe('64002a');
});

test('TestToStringLevel1b', () =>
{
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileConstrainedBaseline, Level1_b))
	).toBe('42f00b');
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileBaseline, Level1_b))
	).toBe('42100b');
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileMain, Level1_b))
	).toBe('4d100b');
});

test('TestToStringLevel1b', () =>
{
	expect(profileLevelIdToString(parseProfileLevelId('42e01f'))).toBe('42e01f');
	expect(profileLevelIdToString(parseProfileLevelId('42E01F'))).toBe('42e01f');
	expect(profileLevelIdToString(parseProfileLevelId('4d100b'))).toBe('4d100b');
	expect(profileLevelIdToString(parseProfileLevelId('4D100B'))).toBe('4d100b');
	expect(profileLevelIdToString(parseProfileLevelId('640c2a'))).toBe('640c2a');
	expect(profileLevelIdToString(parseProfileLevelId('640C2A'))).toBe('640c2a');
});

test('TestToStringInvalid', () =>
{
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileHigh, Level1_b))
	).toBeNull();
	expect(
		profileLevelIdToString(new ProfileLevelId(ProfileConstrainedHigh, Level1_b))
	).toBeNull();
	expect(
		profileLevelIdToString(new ProfileLevelId(255, Level3_1))
	).toBeNull();
});

test('TestParseSdpProfileLevelIdEmpty', () =>
{
	const profile_level_id = parseSdpProfileLevelId();

	expect(profile_level_id).toBeDefined();
	expect(profile_level_id.profile).toBe(ProfileConstrainedBaseline);
	expect(profile_level_id.level).toBe(Level3_1);
});

test('TestParseSdpProfileLevelIdConstrainedHigh', () =>
{
	const params = { 'profile-level-id': '640c2a' };
	const profile_level_id = parseSdpProfileLevelId(params);

	expect(profile_level_id).toBeDefined();
	expect(profile_level_id.profile).toBe(ProfileConstrainedHigh);
	expect(profile_level_id.level).toBe(Level4_2);
});

test('TestParseSdpProfileLevelIdInvalid', () =>
{
	const params = { 'profile-level-id': 'foobar' };

	expect(parseSdpProfileLevelId(params)).toBeNull();
});

test('TestIsSameProfile', () =>
{
	expect(
		isSameProfile({ foo: 'foo' }, { bar: 'bar' })
	).toBe(true);
	expect(
		isSameProfile({ 'profile-level-id': '42e01f' }, { 'profile-level-id': '42C02A' })
	).toBe(true);
	expect(
		isSameProfile({ 'profile-level-id': '42a01f' }, { 'profile-level-id': '58A01F' })
	).toBe(true);
	expect(
		isSameProfile({ 'profile-level-id': '42e01f' }, undefined)
	).toBe(true);
});

test('TestIsNotSameProfile', () =>
{
	expect(
		isSameProfile(undefined, { 'profile-level-id': '4d001f' })
	).toBe(false);
	expect(
		isSameProfile({ 'profile-level-id': '42a01f' }, { 'profile-level-id': '640c1f' })
	).toBe(false);
	expect(
		isSameProfile({ 'profile-level-id': '42000a' }, { 'profile-level-id': '64002a' })
	).toBe(false);
});

test('TestGenerateProfileLevelIdForAnswerEmpty', () =>
{
	expect(generateProfileLevelIdForAnswer(undefined, undefined)).toBeNull();
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

	expect(generateProfileLevelIdForAnswer(low_level, high_level)).toBe('42e015');
	expect(generateProfileLevelIdForAnswer(high_level, low_level)).toBe('42e015');
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

	expect(generateProfileLevelIdForAnswer(local_params, remote_params)).toBe('42e01f');
});
