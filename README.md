# Loud Spam 📢

A playful React Native app built with **Expo SDK 54** that reacts to loud noises by triggering a chaotic "Spam Mode".

![Demo](/assets/spam/loud1.png)

## 🚀 Features

- **Audio Trigger**: Monitors microphone input levels in real-time.
- **Spam Mode**: If volume exceeds **-10 dB** (loud clap, shout, etc.), the screen is hijacked by a flashing spam overlay.
- **Chaos Animation**: Rapidly cycles through "Loud" themed retro spam ads.
- **Camera Preview**: Uses the front-facing camera as the background (selfie mode).

## 🛠 Tech Stack

- **Expo / React Native**: Core framework.
- **expo-camera**: For the front-facing camera preview (`CameraView`).
- **expo-av**: For audio recording and metering logic.

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/loud-spam.git
    cd loud-spam
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the app**:
    ```bash
    npx expo start
    ```

4.  **Test on Device**:
    - Build relies on physical hardware (Camera/Microphone).
    - Use **Expo Go** app on your phone to scan the QR code.
    - Grant Camera and Microphone permissions.
    - **SCREAM!** (or clap loud) to test.

## 📝 Configuration

You can adjust the sensitivity threshold in `App.js`:

```javascript
// App.js
if (status.metering > -10 && !spamMode) { // Change -10 to adjust sensitivity
   triggerSpamMode();
}
```
