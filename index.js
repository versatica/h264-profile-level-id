const Profile =
{
	ConstrainedBaseline : 1,
	Baseline            : 2,
	Main                : 3,
	ConstrainedHigh     : 4,
	High                : 5
};

exports.Profile = Profile;

// All values are equal to ten times the level number, except level 1b which is
// special.
const Level =
{
	'1_b' : 0,
	'1'   : 10,
	'1_1' : 11,
	'1_2' : 12,
	'1_3' : 13,
	'2'   : 20,
	'2_1' : 21,
	'2_2' : 22,
	'3'   : 30,
	'3_1' : 31,
	'3_2' : 32,
	'4'   : 40,
	'4_1' : 41,
	'4_2' : 42,
	'5'   : 50,
	'5_1' : 51,
	'5_2' : 52
};

exports.Level = Level;

// For level_idc=11 and profile_idc=0x42, 0x4D, or 0x58, the constraint set3
// flag specifies if level 1b or level 1.1 is used.
const ConstraintSet3Flag = 0x10;

// Convert a string of 8 characters into a byte where the positions containing
// character c will have their bit set. For example, c = 'x', str = "x1xx0000"
// will return 0b10110000.
function byteMaskString(c, str)
{
	return (
		((str[0] === c) << 7) | ((str[1] === c) << 6) | ((str[2] === c) << 5) |
		((str[3] === c) << 4)	| ((str[4] === c) << 3)	| ((str[5] === c) << 2)	|
		((str[6] === c) << 1)	| ((str[7] === c) << 0)
	);
}

// Class for matching bit patterns such as "x1xx0000" where 'x' is allowed to be
// either 0 or 1.
class BitPattern
{
	constructor(str)
	{
		this._mask = ~byteMaskString('x', str);
		this._maskedValue = byteMaskString('1', str);
	}

	isMatch(value)
	{
		return this._maskedValue === (value & this._mask);
	}
}

// Class for converting between profile_idc/profile_iop to Profile.
class ProfilePattern
{
	constructor(profile_idc, profile_iop, profile)
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
	new ProfilePattern(0x64, new BitPattern('00001100'), Profile.ConstrainedHigh)
];

// Compare H264 levels and handle the level 1b case.
function isLess(a, b)
{
	if (a === Level['1_b'])
		return b !== Level['1'] && b !== Level['1_b'];

	if (b === Level['1_b'])
		return a !== Level['1'];

	return a < b;
}

function min(a, b)
{
	return isLess(a, b) ? a : b;
}

class ProfileLevelId
{
	constructor(profile, level)
	{
		this.profile = profile;
		this.level = level;
	}
}

exports.ProfileLevelId = ProfileLevelId;

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
	new ProfileLevelId(Profile.ConstrainedBaseline, Level['3_1']);

/**
 * Parse profile level id that is represented as a string of 3 hex bytes.
 * Nothing will be returned if the string is not a recognized H264 profile
 * level id.
 *
 * @param {String} str - profile-level-id value as a string of 3 hex bytes.
 *
 * @returns {ProfileLevelId}
 */
exports.parseProfileLevelId = function(str)
{
	// The string should consist of 3 bytes in hexadecimal format.
	if (typeof str !== 'string' || str.length !== 6)
		return null;

	const profile_level_id_numeric = parseInt(str, 16);

	if (profile_level_id_numeric === 0)
		return null;

	// Separate into three bytes.
	const level_idc = profile_level_id_numeric & 0xFF;
	const profile_iop = (profile_level_id_numeric >> 8) & 0xFF;
	const profile_idc = (profile_level_id_numeric >> 16) & 0xFF;

	// Parse level based on level_idc and constraint set 3 flag.
	let level;

	switch (level_idc)
	{
		case Level['1_1']:
			level = (profile_iop & ConstraintSet3Flag) !== 0 ? Level['1_b'] : Level['1_1'];
			break;
		case Level['1']:
		case Level['1_2']:
		case Level['1_3']:
		case Level['2']:
		case Level['2_1']:
		case Level['2_2']:
		case Level['3']:
		case Level['3_1']:
		case Level['3_2']:
		case Level['4']:
		case Level['4_1']:
		case Level['4_2']:
		case Level['5']:
		case Level['5_1']:
		case Level['5_2']:
			level = level_idc;
			break;
		// Unrecognized level_idc.
		default:
			return null;
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

	// Unrecognized profile_idc/profile_iop combination.
	return null;
};

/**
 * Returns canonical string representation as three hex bytes of the profile
 * level id, or returns nothing for invalid profile level ids.
 *
 * @param {ProfileLevelId} profileLevelId
 *
 * @returns {String}
 */
exports.profileLevelIdToString = function(profile_level_id)
{
	// Handle special case level == 1b.
	if (profile_level_id.level == Level['1_b'])
	{
		switch (profile_level_id.profile)
		{
			case Profile.ConstrainedBaseline:
				return '42f00b';
			case Profile.Baseline:
				return '42100b';
			case Profile.Main:
				return '4d100b';
			// Level 1_b is not allowed for other profiles.
			default:
				return null;
		}
	}

	let profile_idc_iop_string;

	switch (profile_level_id.profile)
	{
		case Profile.ConstrainedBaseline:
			profile_idc_iop_string = '42e0';
			break;
		case Profile.Baseline:
			profile_idc_iop_string = '4200';
			break;
		case Profile.Main:
			profile_idc_iop_string = '4d00';
			break;
		case Profile.ConstrainedHigh:
			profile_idc_iop_string = '640c';
			break;
		case Profile.High:
			profile_idc_iop_string = '6400';
			break;
		// Unrecognized profile.
		default:
			return null;
	}

	let levelStr = (profile_level_id.level).toString(16);

	if (levelStr.length === 1)
		levelStr = `0${levelStr}`;

	return `${profile_idc_iop_string}${levelStr}`;
};

/**
 * Generate codec parameters that will be used as answer in an SDP negotiation
 * based on local supported parameters and remote offered parameters. Both
 * local_supported_params, remote_offered_params, and answer_params
 * represent sendrecv media descriptions, i.e they are a mix of both encode and
 * decode capabilities. In theory, when the profile in local_supported_params
 * represent a strict superset of the profile in remote_offered_params, we
 * could limit the profile in answer_params to the profile in
 * remote_offered_params. However, to simplify the code, each supported H264
 * profile should be listed explicitly in the list of local supported codecs,
 * even if they are redundant. Then each local codec in the list should be
 * tested one at a time against the remote codec, and only when the profiles are
 * equal should this function be called. Therefore, this function does not need
 * to handle profile intersection, and the profile of local_supported_params
 * and remote_offered_params must be equal before calling this function. The
 * parameters that are used when negotiating are the level part of
 * profile-level-id and level-asymmetry-allowed.
 *
 * @param {Array<String>} local_supported_profile_levels_ids
 * @param {Array<String>} remote_offered_profile_levels_ids
 * @param {Boolean} level_asymmetry_allowed - Must be allowed by local and remote.
 *
 * @returns {String} Canonical string representation as three hex bytes of the
 *   profile level id, or null if not found or invalid.
 */
// export function generateProfileLevelIdForAnswer(
// 	local_supported_profile_levels_ids,
// 	remote_offered_profile_levels_ids,
// 	level_asymmetry_allowed
// )
// {
// 	// If both local and remote have zero profile-level-id values, they are both
// 	// using the default profile. In this case, don't set profile-level-id in answer
// 	// either.
// 	if (
// 		local_supported_profile_levels_ids.length === 0 &&
// 		remote_offered_profile_levels_ids.length === 0
// 	)
// 	{
// 		return ''; // TODO
// 	}

// 	// Parse profile-level-ids.
// 	const local_profile_level_id =
// 		ParseSdpProfileLevelId(local_supported_params);
// 	const rtc::Optional<ProfileLevelId> remote_profile_level_id =
// 	    ParseSdpProfileLevelId(remote_offered_params);
// 	// The local and remote codec must have valid and equal H264 Profiles.
// 	RTC_DCHECK(local_profile_level_id);
// 	RTC_DCHECK(remote_profile_level_id);
// 	RTC_DCHECK_EQ(local_profile_level_id->profile,
// 	              remote_profile_level_id->profile);
// 	// Parse level information.
// 	const bool level_asymmetry_allowed =
// 	    IsLevelAsymmetryAllowed(local_supported_params) &&
// 	    IsLevelAsymmetryAllowed(remote_offered_params);
// 	const Level local_level = local_profile_level_id->level;
// 	const Level remote_level = remote_profile_level_id->level;
// 	const Level min_level = Min(local_level, remote_level);
// 	// Determine answer level. When level asymmetry is not allowed, level upgrade
// 	// is not allowed, i.e., the level in the answer must be equal to or lower
// 	// than the level in the offer.
// 	const Level answer_level = level_asymmetry_allowed ? local_level : min_level;
// 	// Set the resulting profile-level-id in the answer parameters.
// 	(*answer_params)[kProfileLevelId] = *ProfileLevelIdToString(
// 	    ProfileLevelId(local_profile_level_id->profile, answer_level));
// }

// Returns true if the parameters have the same H264 profile, i.e. the same
// H264::Profile (Baseline, High, etc).
// bool IsSameH264Profile(const CodecParameterMap& params1,
//                        const CodecParameterMap& params2);
