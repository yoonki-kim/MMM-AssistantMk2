 
# Google Assistant Setup

## Get Auth and credentials to make profile.
1. Create or open a project in the [Actions Console](https://console.actions.google.com/)
2. After creation, Enable `Google Assistant API` for your project in the [Cloud Platform Console](https://console.cloud.google.com/)
3. Return to Actions Console and Follow the instructions to [register a device model](https://developers.google.com/assistant/sdk/guides/service/python/embed/register-device)

(If you cannot find `Device registration` menu, you can use this URL https://console.actions.google.com/u/[0]/project/[yourprojectId]/deviceregistration/) (change [] to your project) or [Manual registration](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual))

4. In register steps(step 2), you can download your `credentials.json` for OAuth. Carefully store it in `MMM-AssistantMk2` directory.
 - Or you can find your credentials from [Cloud Platform Console](https://console.cloud.google.com/) (Your Project > APIs & Services > Credentials)
5. In your SBC, you can run auth-tool for auth. (not via SSH)
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
node auth_and_test.js
```
   a. If you meet some errors related with node version, execute `npm rebuild` and try again.

   b. At first execution, this script will try opening a browser and getting permission of a specific user for using this Assistant. (So you'd better to execute this script in your RPI shell, not via SSH)

   c. After confirmation, Some code (`4/ABCD1234XXXXX....`) will appear in the browser. Copy that code and paste in your console's request (`Paste your code:`)

   d. On success, Prompt `Type your request` will be displayed. Type anything for testing assistant. (e.g; `Hello`, `How is the weather today?`)

   e. Now you can find `token.json` in your `MMM-AssistantMk2` directory. Move it under `profiles` directory with rename `default.json`. This will be used in module as `default` profile.

 ```sh
 mv token.json ./profiles/default.json
 ```
  f. If you want to make more profiles(for your family??), do the step 5 again. and move the `token.json` generated to profiles directory with another profile name, and don't forget setting your configuration.
```sh
mv token.json ./profiles/mom.json
```


## `OAuth Consent Screen` setup
Sometimes, you might encounter some problem related to `OAuth Consent Screen missing`.
In that case, go to [Cloud Platform Console](https://console.cloud.google.com/), then navigate to `APIs & Services > OAuth Consent Screen`. At first, you'll be asked which user type would use your project. Just select `External`. The page will be changed to `OAuth consent screen`, but leave it as unverified. On dev stage, it's enough.


## Get `deviceModelId` and `deviceInstanceId`
> If you are not an experienced developer or don't need `gactions` implements, pass this section.

If you want not only pure Assistant embeding but also customized gactions for device, you might need to get `deviceModelId` and `deviceInstanceId`. To help understanding, **deviceModel** is something like `Volkswagen Golf` or `MagicMirror` and **deviceInstance** is something like `mom's car` or `mirror in living room`.

### For `deviceModelId`
You can get `deviceModelId` as a result of previous [register a device model](https://developers.google.com/assistant/sdk/guides/service/python/embed/register-device) step. In `Device registration` menu in `Actions Console`, you can find it.

### For `deviceInstanceId`
You need additional `google-assistant-sdk` library. See [
Manually Register a Device with the REST API](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual#get-access-token) page.
