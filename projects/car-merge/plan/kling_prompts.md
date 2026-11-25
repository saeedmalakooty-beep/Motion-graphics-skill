# Kling still prompts (kling-image-o1, 1k, 9:16, 1 image each)
CAR = Keep this exact car identical to the reference photo: a black 2020 BMW X7 xDrive40i (G07 generation, pre-facelift), Carbon Black metallic paint, large chrome kidney grille with vertical slats, slim LED headlights, chrome lower front trim, aluminium running boards, silver Y-spoke alloy wheels, chrome window surround, roof rails, plate 3194 DI.
STYLE = golden hour, warm low sun, trees with green-gold leaves, gravel road, cinematic luxury car commercial, shallow depth of field, warm film grade, clean glossy paint without water spots, vertical 9:16, no text, no watermark, no people.

# Video prompts (720p, 5 s, no audio)
| Shot | Model | Credits | Camera move |
|---|---|---|---|
| v0 s0 front (transition) | kling-video-v3_0_turbo | 40 | very slow dolly-in at headlight height |
| v1 s1 front 3/4 | kling-video-v2_5 (enable_audio=false) | 15 | slow dolly-in (came out almost static + sun flare) |
| v3 s3 under tree | kling-video-v2_5 | 15 | push forward through foreground leaves |
| v4 s4 wheel | kling-video-v2_5 | 15 | slide sideways along body past the wheel, light glints on spokes |
| v5 s5 rear 3/4 | kling-video-v2_5 | 15 | slight orbit left, taillights glow |
| v7 s7 interior | kling-video-v2_5 | 15 | push through open rear door, sunbeams move over cognac leather |
Each prompt: "car stays parked and still · keep car/grille/wheels/KHAZAR MOTOR plate exactly unchanged · smooth steady gimbal, no shake, no people, no text".
