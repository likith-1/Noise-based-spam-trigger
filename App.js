
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';

// Import spam assets
const SPAM_IMAGES = [
  require('./assets/spam/loud1.png'),
  require('./assets/spam/loud2.png'),
  require('./assets/spam/loud3.png'),
];

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState(false);
  const [spamMode, setSpamMode] = useState(false);
  const [currentSpamImage, setCurrentSpamImage] = useState(0);
  const [recording, setRecording] = useState();
  const [metering, setMetering] = useState(-160);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const audioStatus = await Audio.requestPermissionsAsync();
      setAudioPermission(audioStatus.status === 'granted');

      // Start recording for metering
      if (audioStatus.status === 'granted') {
        startRecording();
      }
    })();

    return () => {
      if (recording) {
        stopRecording();
      }
    }
  }, []);

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );

      setRecording(recording);

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          setMetering(status.metering);
          // Threshold: -10 dB is pretty loud (close to 0 is max)
          // Normal conversation is around -25 to -15
          if (status.metering > -10 && !spamMode) {
            triggerSpamMode();
          }
        }
      });

      // Metering must be enabled
      await recording.setProgressUpdateInterval(100);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
  }

  useEffect(() => {
    let interval;
    if (spamMode) {
      interval = setInterval(() => {
        setCurrentSpamImage(prev => (prev + 1) % SPAM_IMAGES.length);
      }, 150); // Change image every 150ms
    }
    return () => clearInterval(interval);
  }, [spamMode]);

  const triggerSpamMode = () => {
    // We check spamMode using a functional update to ensure we don't re-trigger
    setSpamMode(prev => {
      if (prev) return prev; // Already in spam mode

      const randomIndex = Math.floor(Math.random() * SPAM_IMAGES.length);
      setCurrentSpamImage(randomIndex);
      return true;
    });
  };

  const dismissSpam = () => {
    setSpamMode(false);
  };

  if (!permission || !audioPermission) {
    // Permission loading or not granted yet
    if (!permission) {
      // Request on mount if not loaded, but usually useCameraPermissions hook handles loading state?
      // Actually hook returns [permission, requestPermission]. permission is null initially.
      if (permission === null) requestPermission();
    }
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white' }}>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.testButton}>
          <Text style={styles.testButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!spamMode ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          <View style={styles.controls}>
            <Text style={styles.instructionText}></Text>
            <Text style={styles.meterText}>Volume: {metering ? metering.toFixed(0) : -160} dB</Text>
          </View>
        </CameraView>
      ) : (
        <TouchableOpacity style={styles.spamContainer} onPress={dismissSpam} activeOpacity={1}>
          <Image source={SPAM_IMAGES[currentSpamImage]} style={styles.spamImage} resizeMode="cover" />
          <Text style={styles.dismissText}>Tap to Close</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    marginBottom: 50,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  meterText: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  spamContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  spamImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  dismissText: {
    position: 'absolute',
    bottom: 50,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  }
});
