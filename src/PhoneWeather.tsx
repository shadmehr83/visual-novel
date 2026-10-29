// Story weather, intentionally independent of location services or a live API.
export const rainyWeek = [
  { day: "Monday", high: 14, low: 10 },
  { day: "Tuesday", high: 13, low: 9 },
  { day: "Wednesday", high: 14, low: 10 },
  { day: "Thursday", high: 12, low: 9 },
  { day: "Friday", high: 13, low: 10 },
  { day: "Saturday", high: 14, low: 11 },
  { day: "Sunday", high: 13, low: 10 },
];
export function WeatherWidget({ onOpen }: { onOpen: () => void }) {
  return <button className="phone-weather-widget" onClick={onOpen} data-help="Open the story’s Weather app. Every day this week is rainy; this is fictional weather, not a live forecast.">
    <span aria-hidden>☂</span><span><b>14° · Rain</b><small>Rain throughout the week</small></span>
  </button>;
}
export function PhoneWeather() {
  return <section className="phone-weather-screen" aria-label="Weekly weather" data-no-advance>
    <h2>Rainy afternoon</h2><p className="weather-temperature">14°</p><p>Rain · High 14° / Low 10°</p>
    <h3>This week</h3>
    <ul>{rainyWeek.map(day => <li key={day.day}><b>{day.day}</b><span>☂ Rain</span><span>{day.high}° / {day.low}°</span></li>)}</ul>
    <small>Story forecast · No location or live weather service used.</small>
  </section>;
}
