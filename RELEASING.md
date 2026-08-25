# Releasing new-habbit

## Local Build

```bash
bun install
bun run build:spa
bunx cap sync android
cd android
./gradlew bundleRelease
```

The AAB is at `android/app/build/outputs/bundle/release/app-release.aab`.

## Signing

Keystore: `android/app/new-habbit-upload.keystore`
Properties: `android/app/keystore.properties` (not committed)
Template: `android/app/keystore.properties.template`

For Play Store, use the upload keystore. Google Play will manage the final app signing key.

## Play Store Deployment

### Manual

1. Open https://play.google.com/console
2. Create app with package name `com.newhabbit.app`
3. Go to `Release > Production > Create new release`
4. Upload `app-release.aab`
5. Add release notes, set privacy policy to `https://new-habbit.pages.dev/privacy-policy.html`
6. Complete app listing and content rating
7. Review and publish

### Automated (GitHub Actions)

1. Generate a Google Play service account JSON with `Release Manager` role.
2. Add GitHub secrets:
   - `PLAY_STORE_SERVICE_ACCOUNT_JSON`
   - `SIGNING_KEYSTORE_BASE64` — base64 of `new-habbit-upload.keystore`
   - `SIGNING_STORE_PASSWORD`
   - `SIGNING_KEY_PASSWORD`
   - `SIGNING_KEY_ALIAS` (`new-habbit`)
3. Trigger workflow: `.github/workflows/playstore.yml`

## Widget

The app ships with a lock screen clock home screen widget. Add it from the Android launcher after install.
