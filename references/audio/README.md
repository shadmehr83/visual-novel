# Original demo sound designs

These six deterministic, synthetic sound effects were created for Stillframe 2.4. They are not third-party recordings. `scripts/make-demo-sounds.py` creates them and encodes Ogg/Vorbis with ffmpeg. Rain lasts about twelve seconds and is blended into a loop; the indoor sample is a low-pass version of the same outdoor rain. Walking is a single step played by the camera’s footstep scheduler. Phone, closet and coat sounds are short one-shot cues. All are embedded in project exports and can be replaced in the Sound library.
