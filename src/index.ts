import { Logger } from './Logger';

const logger = new Logger();

/**
 * Supported profiles.
 */
// ESLint absurdly complains about "'Profile' is already declared in
// the upper scope".
// eslint-disable-next-line no-shadow
export enum Profile
{
	ConstrainedBaseline = 1,
	Baseline = 2,
	Main = 3,
	ConstrainedHigh = 4,
	High = 5,
	PredictiveHigh444 = 6
}

/**
 * Supported levels.
 */
// ESLint absurdly complains about "'Level' is already declared in
// the upper scope".
// eslint-disable-next-line no-shadow
export enum Level
{
	Level1_b = 0,
	Level1 = 10,
	Level1_1 = 11,
	Level1_2 = 12,
	Level1_3 = 13,
	Level2 = 20,
	Level2_1 = 21,
	Level2_2 = 22,
	Level3 = 30,
	Level3_1 = 31,
	Level3_2 = 32,
	Level4 = 40,
	Level4_1 = 41,
	Level4_2 = 42,
	Level5 = 50,
	Level5_1 = 51,
	Level5_2 = 52
}

/**
 * Represents a parsed h264 profile-level-id value.
 */
export class ProfileLevelId
{
	public readonly profile: Profile;
	public readonly level: Level;

	constructor(profile: Profile, level: Level)
	{
		this.profile = profile;
		this.level = level;
	}
}

// Default ProfileLevelId.
//
// TODO: The default should really be profile Baseline and level 1 according to
// the spec: https://tools.ietf.org/html/rfc6184#section-8.1. In order to not
// break backwards compatibility with older versions of WebRTC where external
// codecs don't have any parameters, use profile ConstrainedBaseline level 3_1
// instead. This workaround will only be done in an interim period to allow
// external clients to update their code.
//
// http://crbug/webrtc/6337.
const DefaultProfileLevelId =
	new ProfileLevelId(Profile.ConstrainedBaseline, Level.Level3_1);

/**
 * Class for matching bit patterns such as "x1xx0000" where 'x' is allowed to
 * be either 0 or 1.
 */
class BitPattern
{
	public readonly mask: number;
	public readonly masked_value: number;

	constructor(str: string)
	{
		this.mask = ~byteMaskString('x', str);
		this.masked_value = byteMaskString('1', str);
	}

	isMatch(value: number): boolean
	{
		return this.masked_value === (value & this.mask);
	}
}

/**
 * Class for converting between profile_idc/profile_iop to Profile.
 */
class ProfilePattern
{
	public readonly profile_idc: number;
	public readonly profile_iop: BitPattern;
	public readonly profile: Profile;

	constructor(profile_idc: number, profile_iop: BitPattern, profile: Profile)
	{
		this.profile_idc = profile_idc;
		this.profile_iop = profile_iop;
		this.profile = profile;
	}
}

// This is from https://tools.ietf.org/html/rfc6184#section-8.1.
const ProfilePatterns =
[
	new ProfilePattern(0x42, new BitPattern('x1xx0000'), Profile.ConstrainedBaseline),
	new ProfilePattern(0x4D, new BitPattern('1xxx0000'), Profile.ConstrainedBaseline),
	new ProfilePattern(0x58, new BitPattern('11xx0000'), Profile.ConstrainedBaseline),
	new ProfilePattern(0x42, new BitPattern('x0xx0000'), Profile.Baseline),
	new ProfilePattern(0x58, new BitPattern('10xx0000'), Profile.Baseline),
	new ProfilePattern(0x4D, new BitPattern('0x0x0000'), Profile.Main),
	new ProfilePattern(0x64, new BitPattern('00000000'), Profile.High),
	new ProfilePattern(0x64, new BitPattern('00001100'), Profile.ConstrainedHigh),
	new ProfilePattern(0xF4, new BitPattern('00000000'), Profile.PredictiveHigh444)
];

/**
 * Parse profile level id that is represented as a string of 3 hex bytes.
 * Nothing will be returned if the string is not a recognized H264 profile
 * level id.
 */
export function parseProfileLevelId(str: string): ProfileLevelId | undefined
{
	// For level_idc=11 and profile_idc=0x42, 0x4D, or 0x58, the constraint set3
	// flag specifies if level 1b or level 1.1 is used.
	const ConstraintSet3Flag = 0x10;

	// The string should consist of 3 bytes in hexadecimal format.
	if (typeof str !== 'string' || str.length !== 6)
	{
		return undefined;
	}

	const profile_level_id_numeric = parseInt(str, 16);

	if (profile_level_id_numeric === 0)
	{
		return undefined;
	}

	// Separate into three bytes.
	const level_idc = (profile_level_id_numeric & 0xFF) as Level;
	const profile_iop = (profile_level_id_numeric >> 8) & 0xFF;
	const profile_idc = (profile_level_id_numeric >> 16) & 0xFF;

	// Parse level based on level_idc and constraint set 3 flag.
	let level: Level;

	switch (level_idc)
	{
		case Level.Level1_1:
		{
			level = (profile_iop & ConstraintSet3Flag) !== 0
				? Level.Level1_b
				: Level.Level1_1;

			break;
		}

		case Level.Level1:
		case Level.Level1_2:
		case Level.Level1_3:
		case Level.Level2:
		case Level.Level2_1:
		case Level.Level2_2:
		case Level.Level3:
		case Level.Level3_1:
		case Level.Level3_2:
		case Level.Level4:
		case Level.Level4_1:
		case Level.Level4_2:
		case Level.Level5:
		case Level.Level5_1:
		case Level.Level5_2:
		{
			level = level_idc;

			break;
		}

		// Unrecognized level_idc.
		default:
		{
			logger.warn(
				`parseProfileLevelId() | unrecognized level_idc [str:${str}, level_idc:${level_idc}]`
			);

			return undefined;
		}
	}

	// Parse profile_idc/profile_iop into a Profile enum.
	for (const pattern of ProfilePatterns)
	{
		if (
			profile_idc === pattern.profile_idc &&
			pattern.profile_iop.isMatch(profile_iop)
		)
		{
			return new ProfileLevelId(pattern.profile, level);
		}
	}

	logger.warn(
		`parseProfileLevelId() | unrecognized profile_idc/profile_iop combination [str:${str}, profile_idc:${profile_idc}, profile_iop:${profile_iop}]`
	);

	return undefined;
}

/**
 * Returns canonical string representation as three hex bytes of the profile
 * level id, or returns nothing for invalid profile level ids.
 */
export function profileLevelIdToString(
	profile_level_id: ProfileLevelId
): string | undefined
{
	// Handle special case level == 1b.
	if (profile_level_id.level == Level.Level1_b)
	{
		switch (profile_level_id.profile)
		{
			case Profile.ConstrainedBaseline:
			{
				return '42f00b';
			}

			case Profile.Baseline:
			{
				return '42100b';
			}

			case Profile.Main:
			{
				return '4d100b';
			}

			// Level 1_b is not allowed for other profiles.
			default:
			{
				logger.warn(
					`profileLevelIdToString() | Level 1_b not is allowed for profile ${profile_level_id.profile}`
				);

				return undefined;
			}
		}
	}

	let profile_idc_iop_string: string;

	switch (profile_level_id.profile)
	{
		case Profile.ConstrainedBaseline:
		{
			profile_idc_iop_string = '42e0';

			break;
		}

		case Profile.Baseline:
		{
			profile_idc_iop_string = '4200';

			break;
		}

		case Profile.Main:
		{
			profile_idc_iop_string = '4d00';

			break;
		}

		case Profile.ConstrainedHigh:
		{
			profile_idc_iop_string = '640c';

			break;
		}

		case Profile.High:
		{
			profile_idc_iop_string = '6400';

			break;
		}

		case Profile.PredictiveHigh444:
		{
			profile_idc_iop_string = 'f400';

			break;
		}
		default:
		{
			logger.warn(
				`profileLevelIdToString() | unrecognized profile ${profile_level_id.profile}`
			);

			return undefined;
		}
	}

	let levelStr: string = (profile_level_id.level).toString(16);

	if (levelStr.length === 1)
	{
		levelStr = `0${levelStr}`;
	}

	return `${profile_idc_iop_string}${levelStr}`;
}

/**
 * Returns a human friendly name for the given profile.
 */
export function profileToString(profile: Profile): string | undefined
{
	switch (profile)
	{
		case Profile.ConstrainedBaseline:
		{
			return 'ConstrainedBaseline';
		}

		case Profile.Baseline:
		{
			return 'Baseline';
		}

		case Profile.Main:
		{
			return 'Main';
		}

		case Profile.ConstrainedHigh:
		{
			return 'ConstrainedHigh';
		}

		case Profile.High:
		{
			return 'High';
		}

		case Profile.PredictiveHigh444:
		{
			return 'PredictiveHigh444';
		}

		default:
		{
			logger.warn(`profileToString() | unrecognized profile ${profile}`);

			return undefined;
		}
	}
}

/**
 * Returns a human friendly name for the given level.
 */
export function levelToString(level: Level): string | undefined
{
	switch (level)
	{
		case Level.Level1_b:
		{
			return '1b';
		}

		case Level.Level1:
		{
			return '1';
		}

		case Level.Level1_1:
		{
			return '1.1';
		}

		case Level.Level1_2:
		{
			return '1.2';
		}

		case Level.Level1_3:
		{
			return '1.3';
		}

		case Level.Level2:
		{
			return '2';
		}

		case Level.Level2_1:
		{
			return '2.1';
		}

		case Level.Level2_2:
		{
			return '2.2';
		}

		case Level.Level3:
		{
			return '3';
		}

		case Level.Level3_1:
		{
			return '3.1';
		}

		case Level.Level3_2:
		{
			return '3.2';
		}

		case Level.Level4:
		{
			return '4';
		}

		case Level.Level4_1:
		{
			return '4.1';
		}

		case Level.Level4_2:
		{
			return '4.2';
		}

		case Level.Level5:
		{
			return '5';
		}

		case Level.Level5_1:
		{
			return '5.1';
		}

		case Level.Level5_2:
		{
			return '5.2';
		}

		default:
		{
			logger.warn(`levelToString() | unrecognized level ${level}`);

			return undefined;
		}
	}
}

/**
 * Parse profile level id that is represented as a string of 3 hex bytes
 * contained in an SDP key-value map. A default profile level id will be
 * returned if the profile-level-id key is missing. Nothing will be returned
 * if the key is present but the string is invalid.
 */
export function parseSdpProfileLevelId(
	params: any = {}
): ProfileLevelId | undefined
{
	const profile_level_id = params['profile-level-id'];

	return profile_level_id
		? parseProfileLevelId(profile_level_id)
		: DefaultProfileLevelId;
}

/**
 * Returns true if the parameters have the same H264 profile, i.e. the same
 * H264 profile (Baseline, High, etc).
 */
export function isSameProfile(params1: any = {}, params2: any = {}): boolean
{
	const profile_level_id_1 = parseSdpProfileLevelId(params1);
	const profile_level_id_2 = parseSdpProfileLevelId(params2);

	// Compare H264 profiles, but not levels.
	return Boolean(
		profile_level_id_1 &&
		profile_level_id_2 &&
		profile_level_id_1.profile === profile_level_id_2.profile
	);
}

/**
 * Generate codec parameters that will be used as answer in an SDP negotiation
 * based on local supported parameters and remote offered parameters. Both
 * local_supported_params and remote_offered_params represent sendrecv media
 * descriptions, i.e they are a mix of both encode and decode capabilities. In
 * theory, when the profile in local_supported_params represent a strict
 * superset of the profile in remote_offered_params, we could limit the profile
 * in the answer to the profile in remote_offered_params.
 *
 * However, to simplify the code, each supported H264 profile should be listed
 * explicitly in the list of local supported codecs, even if they are redundant.
 * Then each local codec in the list should be tested one at a time against the
 * remote codec, and only when the profiles are equal should this function be
 * called. Therefore, this function does not need to handle profile intersection,
 * and the profile of local_supported_params and remote_offered_params must be
 * equal before calling this function. The parameters that are used when
 * negotiating are the level part of profile-level-id and
 * level-asymmetry-allowed.
 */
export function generateProfileLevelIdStringForAnswer(
	local_supported_params: any = {},
	remote_offered_params: any = {}
): string | undefined
{
	// If both local and remote params do not contain profile-level-id, they are
	// both using the default profile. In this case, don't return anything.
	if (
		!local_supported_params['profile-level-id'] &&
		!remote_offered_params['profile-level-id']
	)
	{
		logger.warn(
			'generateProfileLevelIdStringForAnswer() | profile-level-id missing in local and remote params'
		);

		return undefined;
	}

	// Parse profile-level-ids.
	const local_profile_level_id = parseSdpProfileLevelId(local_supported_params);
	const remote_profile_level_id = parseSdpProfileLevelId(remote_offered_params);

	// The local and remote codec must have valid and equal H264 Profiles.
	if (!local_profile_level_id)
	{
		throw new TypeError('invalid local_profile_level_id');
	}

	if (!remote_profile_level_id)
	{
		throw new TypeError('invalid remote_profile_level_id');
	}

	if (local_profile_level_id.profile !== remote_profile_level_id.profile)
	{
		throw new TypeError('H264 Profile mismatch');
	}

	// Parse level information.
	const level_asymmetry_allowed: boolean = (
		isLevelAsymmetryAllowed(local_supported_params) &&
		isLevelAsymmetryAllowed(remote_offered_params)
	);

	const local_level: Level = local_profile_level_id.level;
	const remote_level: Level = remote_profile_level_id.level;
	const min_level: Level = minLevel(local_level, remote_level);

	// Determine answer level. When level asymmetry is not allowed, level upgrade
	// is not allowed, i.e., the level in the answer must be equal to or lower
	// than the level in the offer.
	const answer_level: Level = level_asymmetry_allowed
		? local_level
		: min_level;

	logger.debug(
		`generateProfileLevelIdStringForAnswer() | result [profile:${local_profile_level_id.profile}, level:${answer_level}]`
	);

	// Return the resulting profile-level-id for the answer parameters.
	return profileLevelIdToString(
		new ProfileLevelId(local_profile_level_id.profile, answer_level)
	);
}

/**
 * Convert a string of 8 characters into a byte where the positions containing
 * character c will have their bit set. For example, c = 'x', str = "x1xx0000"
 * will return 0b10110000.
 */
function byteMaskString(c: string, str: string): number
{
	return (
		(Number(str[0] === c) << 7) | (Number(str[1] === c) << 6) |
		(Number(str[2] === c) << 5) |	(Number(str[3] === c) << 4)	|
		(Number(str[4] === c) << 3)	| (Number(str[5] === c) << 2)	|
		(Number(str[6] === c) << 1)	| (Number(str[7] === c) << 0)
	);
}

// Compare H264 levels and handle the level 1b case.
function isLessLevel(a: Level, b: Level): boolean
{
	if (a === Level.Level1_b)
	{
		return b !== Level.Level1 && b !== Level.Level1_b;
	}

	if (b === Level.Level1_b)
	{
		return a !== Level.Level1;
	}

	return a < b;
}

function minLevel(a: Level, b: Level): Level
{
	return isLessLevel(a, b) ? a : b;
}

function isLevelAsymmetryAllowed(params: any = {}): boolean
{
	const level_asymmetry_allowed = params['level-asymmetry-allowed'];

	return (
		level_asymmetry_allowed === true ||
		level_asymmetry_allowed === 1 ||
		level_asymmetry_allowed === '1'
	);
}
