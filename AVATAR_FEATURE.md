# 3D Avatar Feature for Pro Users

## Overview
A 3D animated avatar that appears during interview calls for PRO plan users. The avatar responds to user interactions with realistic animations.

## Features
- **Interactive 3D Avatar**: Built with Three.js, rendered in real-time
- **Smart Animations**:
  - Listening state: Head tilts and eyes follow microphone input
  - Speaking state: Mouth movements and arm gestures
  - Idle state: Subtle floating and blinking animations
- **Pro-Only Feature**: Avatar displays only for users with PRO subscription

## Files Added
- `src/components/Avatar3D.tsx` - Main 3D avatar component using Three.js

## Files Modified
- `src/components/InterviewUI.tsx` - Added avatar display and isPro prop
- `src/app/(dashboard)/interview/[sessionId]/page.tsx` - Added user plan detection and passing to InterviewUI
- `package.json` - Added Three.js and @types/three dependencies

## Installation
1. Install dependencies:
   ```bash
   npm install three @types/three
   ```

2. The component is automatically integrated into the interview page

## Usage
The avatar displays automatically for PRO users at the top of the interview UI:

```tsx
<Avatar3D isListening={isRecording} isSpeaking={hasAnswered && isEvaluating} />
```

### Props
- `isListening` (boolean, optional): Triggers head tilt and eye movements when user is recording
- `isSpeaking` (boolean, optional): Triggers mouth animation and arm gestures when AI is evaluating/speaking

## Customization
You can customize the avatar's appearance by modifying `src/components/Avatar3D.tsx`:

- **Colors**: Change material colors (head, body, eyes, etc.)
- **Geometry**: Adjust the mesh sizes and proportions
- **Animations**: Modify speed/intensity of animations in the animate function
- **Lighting**: Change ambient/directional light colors and intensity

## Performance
- Uses WebGL with optimized Three.js rendering
- Responsive to container size
- Cleans up resources on unmount
- Estimated impact: ~2-5% additional CPU usage during interview

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires WebGL 2.0 support

## Future Enhancements
- Multiple avatar styles/skins
- Lip-sync with audio
- Gesture recognition integration
- Custom avatar creation for PRO+ tier
