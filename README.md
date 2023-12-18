# h264-profile-level-id

TypeScript utility to process [H264](https://tools.ietf.org/html/rfc6184) `profile-level-id` values based on Google's libwebrtc C++ code:
- [h264_profile_level_id.cc](https://webrtc.googlesource.com/src/+/refs/heads/main/api/video_codecs/h264_profile_level_id.cc)
- [h264_profile_level_id.h](https://webrtc.googlesource.com/src/+/refs/heads/main/api/video_codecs/h264_profile_level_id.h)
- [h264_profile_level_id_unittest.cc](https://webrtc.googlesource.com/src/+/refs/heads/main/api/video_codecs/test/h264_profile_level_id_unittest.cc)

```bash
$ npm install h264-profile-level-id
```

## API

```ts
import {
  // H264 Profile enum
  Profile,
  // H264 Level enum
  Level,
  // Class.
  ProfileLevelId,
  // Functions.
  parseProfileLevelId,
  profileLevelIdToString,
  profileToString,
  levelToString,
  parseSdpProfileLevelId,
  isSameProfile,
  generateProfileLevelIdStringForAnswer
} from 'h264-profile-level-id';
```

```ts
enum Profile
{
  ConstrainedBaseline = 1,
  Baseline = 2,
  Main = 3,
  ConstrainedHigh = 4,
  High = 5,
  PredictiveHigh444 = 6
}
```

```ts
enum Level
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
```

### class ProfileLevelId

Class containing both H264 Profile and Level.

```js
const profile_level_id = new ProfileLevelId(Profile.Main, Level.Level3_1);

console.log('profile:%d, level:%d', profile_level_id.profile, profile_level_id.level);
// => profile:3, level:31
```

Both `profile` and `level` members are public.

### function parseProfileLevelId(str: string): ProfileLevelId \| undefined

Parse profile level id that is represented as a string of 3 hex bytes. Nothing will be returned if the string is not a recognized H264 profile level id.


### function profileLevelIdToString(profile_level_id: ProfileLevelId): string \| undefined

Return canonical string representation as three hex bytes of the profile level id, or returns nothing for invalid profile level ids.

### function profileToString(profile: Profile): string \| undefined

Return a human friendly name for the given profile.

### function levelToString(level: Level): string \| undefined

Return a human friendly name for the given level.

### function parseSdpProfileLevelId(params: any = {}): ProfileLevelId \ undefined

Parse profile level id that is represented as a string of 3 hex bytes contained in an SDP key-value map. A default profile level id will be returned if the `profile-level-id` key is missing. Nothing will be returned if the key is present but the string is invalid.

### function isSameProfile(params1: any = {}, params2: any = {}): boolean

Return true if the parameters have the same H264 profile, i.e. the same H264 profile (Baseline, High, etc).

### function generateProfileLevelIdForAnswer(local_supported_params: any = {}, remote_offered_params: any = {}): string \| undefined

Generate a profile level id that is represented as a string of 3 hex bytes suitable for an answer in an SDP negotiation based on local supported parameters and remote offered parameters. The parameters that are used when negotiating are the level part of `profile-level-id` and `level-asymmetry-allowed`.

**NOTE:** This function is just intended to manage H264 profile levels ids with same profile (otherwise it will throw). Use `isSameProfile()` API before this one.


## Usage examples

See the [unit tests](src/tests/test.js).


## Author

* Iñaki Baz Castillo [[website](https://inakibaz.me)|[github](https://github.com/ibc/)]


## License

[ISC](./LICENSE)
