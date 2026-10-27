export function PhoneApps({
  screen,
  onOpen,
}: {
  screen: "home" | "feed";
  onOpen: (screen: "home" | "feed" | "chat") => void;
}) {
  return screen === "home" ? (
    <div className="phone-home-screen" data-no-advance>
      <div className="phone-clock">
        16:00<small>A quiet afternoon</small>
      </div>
      <div className="phone-app-grid">
        <button
          data-help="Open Nearside messages on this fictional phone. This does not send anything to a real person or advance the story."
          onClick={() => onOpen("chat")}
        >
          <span>♡</span>Nearside<small>Messages</small>
        </button>
        <button
          data-help="Open the local Loop feed. Scroll for mock posts; browsing does not choose a dialogue reply."
          onClick={() => onOpen("feed")}
        >
          <span>▶</span>Loop<small>Short videos</small>
        </button>
        <div className="phone-app-disabled">
          ◉<small>Camera · decorative</small>
        </div>
        <div className="phone-app-disabled">
          ☀<small>Weather · decorative</small>
        </div>
      </div>
      <p className="small muted">
        Nearside and Loop open. Other icons are scenery.
      </p>
    </div>
  ) : (
    <div className="loop-feed" data-no-advance aria-label="Loop scrolling feed">
      {[
        {
          name: "nightwalks",
          title: "The city after rain",
          body: "Little lights. Long walks.",
          style: "rain",
        },
        {
          name: "quietcorners",
          title: "A small pause",
          body: "Tea cooling on a windowsill.",
          style: "tea",
        },
        {
          name: "softstatic",
          title: "One more before I go",
          body: "Nothing urgent. Just another afternoon.",
          style: "room",
        },
        {
          name: "latehours",
          title: "Somewhere warm",
          body: "A window, a table, a little rain.",
          style: "rain",
        },
      ].map((card, i) => (
        <article className={"loop-card loop-" + card.style} key={i}>
          <span className="loop-play" aria-hidden>
            ▶
          </span>
          <div>
            <b>@{card.name}</b>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <small>Fictional feed · scroll for more</small>
          </div>
          <aside aria-hidden>
            ♡<br />◌<br />↗
          </aside>
        </article>
      ))}
    </div>
  );
}
