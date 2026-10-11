# Railway Static GK — Android / CodeMagic project

This repository packages the existing Railway Static GK HTML quiz as an offline Android WebView app. The original quiz is bundled at `app/src/main/assets/index.html`; it is not rewritten or hosted remotely.

## CodeMagic build

1. Upload this folder to a GitHub repository.
2. In CodeMagic, add the GitHub repository and select `codemagic.yaml`.
3. Start the `railway-static-gk-android` workflow.
4. Download the generated APK to install directly, or the AAB for Play Console.

The workflow generates the Gradle wrapper in the build environment and produces both release APK and AAB artifacts.

## App identity

- App name: Railway Static GK
- Application ID: `in.railway.staticgk`
- Version: `1.0.0`
- Minimum Android: Android 6.0 (API 23)
- Quiz content: bundled/offline HTML
- App icon: `app/src/main/res/drawable-nodpi/app_icon.png`

## Before publishing

The project is configured to build in CodeMagic without adding source files. For Play Store release, set up signing credentials in CodeMagic and verify your final application ID/versioning. No signing secrets are included in this repository.
