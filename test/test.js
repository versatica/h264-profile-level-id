const {
	Profile,
	Level,
	ProfileLevelId,
	parseProfileLevelId,
	profileLevelIdToString
} = require('../');

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
	expect(parseProfileLevelId('42e01f').level).toBe(Level['3_1']);
	expect(parseProfileLevelId('42e00b').level).toBe(Level['1_1']);
	expect(parseProfileLevelId('42f00b').level).toBe(Level['1_b']);
	expect(parseProfileLevelId('42C02A').level).toBe(Level['4_2']);
	expect(parseProfileLevelId('640c34').level).toBe(Level['5_2']);
});

test('TestParsingConstrainedBaseline', () =>
{
	expect(parseProfileLevelId('42e01f').profile).toBe(Profile.ConstrainedBaseline);
	expect(parseProfileLevelId('42C02A').profile).toBe(Profile.ConstrainedBaseline);
	expect(parseProfileLevelId('4de01f').profile).toBe(Profile.ConstrainedBaseline);
	expect(parseProfileLevelId('58f01f').profile).toBe(Profile.ConstrainedBaseline);
});

test('TestParsingBaseline', () =>
{
	expect(parseProfileLevelId('42a01f').profile).toBe(Profile.Baseline);
	expect(parseProfileLevelId('58A01F').profile).toBe(Profile.Baseline);
});

test('TestParsingMain', () =>
{
	expect(parseProfileLevelId('4D401f').profile).toBe(Profile.Main);
});

test('TestParsingHigh', () =>
{
	expect(parseProfileLevelId('64001f').profile).toBe(Profile.High);
});

test('TestParsingConstrainedHigh', () =>
{
	expect(parseProfileLevelId('640c1f').profile).toBe(Profile.ConstrainedHigh);
});

test('TestToString', () =>
{
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.ConstrainedBaseline, Level['3_1']))
	).toBe('42e01f');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.Baseline, Level['1']))
	).toBe('42000a');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.Main, Level['3_1']))
	).toBe('4d001f');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.ConstrainedHigh, Level['4_2']))
	).toBe('640c2a');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.High, Level['4_2']))
	).toBe('64002a');
});

test('TestToStringLevel1b', () =>
{
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.ConstrainedBaseline, Level['1_b']))
	).toBe('42f00b');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.Baseline, Level['1_b']))
	).toBe('42100b');
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.Main, Level['1_b']))
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
		profileLevelIdToString(new ProfileLevelId(Profile.High, Level['1_b']))
	).toBeNull();
	expect(
		profileLevelIdToString(new ProfileLevelId(Profile.ConstrainedHigh, Level['1_b']))
	).toBeNull();
	expect(
		profileLevelIdToString(new ProfileLevelId(255, Level['3_1']))
	).toBeNull();
});
