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
	profileLevelIdToString
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
