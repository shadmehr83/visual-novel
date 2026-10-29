# Phone weather and contact strip · 2.18.2

The contact portrait, name and online status now appear only inside Ember messages. Home has no contact strip; Insta, Settings and Weather use a simple app heading with a Back button. Story notifications retain their existing behavior.

Open **Weather** from the phone home screen or its widget. The seven-day forecast is deliberately rainy every day, with fictional temperatures. It needs no API, geolocation permission or internet connection.

The **Show weather widget** checkbox is available in:

- The standard editor’s **Phone** controls.
- **Advanced devices → Appearance**.
- The phone’s own **Settings** app.

It controls the widget below the home-screen clock; the Weather app remains available when the widget is hidden. It is enabled unless explicitly switched off. The preference is included in project saves and exported games and respects the existing shared/independent phone appearance setting.

Project artwork, scene effects, dialogue and uploaded images are unchanged. Offline packaging uses a higher gzip memory level at build time to stay under the hosting file limit; the packaged images and videos are lossless copies of the previous inputs.
