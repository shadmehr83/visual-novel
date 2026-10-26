import { defaultEffects, type Project, type Node, type Choice } from "./model";
const a = (
  key: string,
  value: string | number | boolean,
  op: "set" | "add" = "set",
) => ({ key, value, op });
const c = (
  id: string,
  text: string,
  target: string,
  actions: Choice["actions"] = [],
): Choice => ({ id, text, target, actions, note: "" });
const n = (
  id: string,
  speaker: string,
  text: string,
  choices: Choice[] = [],
  next?: string,
): Node => ({ id, speaker, text, choices, next });
export function demo(): Project {
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    title: "The space between us",
    metadata: { created: new Date().toISOString() },
    settings: { reducedEffects: false, guides: false },
    assets: [],
    characters: [
      {
        id: "mara",
        name: "Mara",
        notes:
          "Dry humour, warm but reserved. Knows only the messages exchanged so far.",
        portrait: null,
      },
    ],
    variables: {
      attachment: 0,
      trust: 0,
      compliance: 0,
      independence: 0,
      suspicion: 0,
      hostility: 0,
      support: 1,
      employment: true,
      housing: true,
      finances: 100,
      danger: false,
      delayed: false,
      messageOpened: false,
      outfit: "",
      item: "",
      stallObserved: false,
      boundaryRespected: false,
    },
    clues: [
      {
        id: "stallObserved",
        fact: "Mara looked up the ice-cream stall before the date.",
        source: "cafe",
        interpretations: [
          "She wanted to make the evening special.",
          "She likes planning ahead.",
          "She wanted to shape the evening.",
        ],
      },
    ],
    scenes: [
      {
        id: "bedroom",
        title: "Another evening",
        subtitle: "BEDROOM · 18:42",
        art: "bedroom",
        background: null,
        fit: "cover",
        x: 0,
        y: 0,
        scale: 1,
        effects: { ...defaultEffects(), density: 45 },
        entry: [],
        nodes: [
          n(
            "room",
            "Narrator",
            "The room has been the same for weeks: the blue wash of the monitor, clothes over the chair, a glass you keep meaning to take downstairs. Your thumb moves before you decide what you’re looking for.",
            [],
            "notification",
          ),
          n("notification", "Your phone", "New message.", [
            c("open", "Open the message", "messages", [
              a("messageOpened", true),
            ]),
            c("wait", "Keep scrolling for a minute", "again", [
              a("delayed", true),
              a("independence", 1, "add"),
            ]),
          ]),
          n(
            "again",
            "Your phone",
            "I was going to ask you something, but I don’t want to sound weird.",
            [
              c("open-later", "Okay. Open it.", "messages", [
                a("messageOpened", true),
              ]),
            ],
          ),
        ],
      },
      {
        id: "messages",
        title: "A small interruption",
        subtitle: "DATING APP · 18:46",
        art: "phone",
        background: null,
        fit: "cover",
        x: 0,
        y: 0,
        scale: 1,
        effects: { ...defaultEffects(), rain: false },
        entry: [],
        nodes: [
          n(
            "hello",
            "Mara",
            "This is probably a strange opening line, but your profile makes you look like someone who has strong opinions about the worst café in the city.",
            [
              c(
                "playful",
                "I have a ranked list. It’s a serious problem.",
                "banter",
                [a("attachment", 1, "add")],
              ),
              c("guarded", "Depends. Are you collecting evidence?", "guarded", [
                a("suspicion", 1, "add"),
              ]),
            ],
          ),
          n(
            "banter",
            "Mara",
            "Good. I need someone willing to take a stand on burnt coffee.",
            [],
            "invite",
          ),
          n(
            "guarded",
            "Mara",
            "Only about coffee. Your other crimes can wait.",
            [],
            "invite",
          ),
          n(
            "invite",
            "Mara",
            "There’s a place on Alder Street. Six thirty? We can give it a fair trial.",
            [
              c("yes", "Six thirty. I’ll be there.", "outfit", [
                a("trust", 1, "add"),
              ]),
              c("ask", "Why that place?", "followup"),
            ],
          ),
          n(
            "followup",
            "Mara",
            "Big windows. You can watch the weather if the conversation is terrible.",
            [
              c(
                "agree",
                "That’s a reassuring backup plan. See you there.",
                "outfit",
                [a("trust", 1, "add")],
              ),
            ],
          ),
        ],
      },
      {
        id: "outfit",
        title: "Something like yourself",
        subtitle: "GETTING READY · 18:58",
        art: "outfit",
        background: null,
        fit: "cover",
        x: 0,
        y: 0,
        scale: 1,
        effects: { ...defaultEffects(), rain: false },
        entry: [],
        nodes: [
          n(
            "clothes",
            "Narrator",
            "The wardrobe offers three different versions of someone who is definitely not overthinking this.",
            [
              c("casual", "The soft, familiar jumper", "bring", [
                a("outfit", "jumper"),
              ]),
              c("smart", "A clean shirt. Make an effort.", "bring", [
                a("outfit", "shirt"),
              ]),
              c("jacket", "The weathered denim jacket", "bring", [
                a("outfit", "jacket"),
                a("independence", 1, "add"),
              ]),
            ],
          ),
          n("bring", "Narrator", "Keys, phone… anything else?", [
            c("book", "Bring the book you’re halfway through", "cafe", [
              a("item", "book"),
            ]),
            c("nothing", "Just yourself", "cafe", [a("item", "nothing")]),
          ]),
        ],
      },
      {
        id: "cafe",
        title: "A table by the window",
        subtitle: "CAFÉ · 19:16",
        art: "cafe",
        background: null,
        fit: "cover",
        x: 0,
        y: 0,
        scale: 1,
        effects: {
          ...defaultEffects(),
          mask: [
            { x: 65, y: 30 },
            { x: 590, y: 30 },
            { x: 590, y: 370 },
            { x: 65, y: 370 },
          ],
        },
        entry: [],
        nodes: [
          n(
            "arrival",
            "Mara",
            "You found it. The {outfit} suits you. I was starting to think the ranked list came with a strict dress code.",
            [
              c("warm", "Only for the top three. You’re safe.", "detail", [
                a("trust", 1, "add"),
                a("attachment", 1, "add"),
              ]),
              c("curious", "Do you come here often?", "detail", [
                a("trust", 1, "add"),
              ]),
              c(
                "reserved",
                "Let’s see if the coffee is any good first.",
                "detail",
                [a("independence", 1, "add")],
              ),
              c("dismissive", "It looks like every other café.", "detail", [
                a("hostility", 1, "add"),
              ]),
            ],
          ),
          n(
            "detail",
            "Mara",
            "Not often. I looked up that little ice-cream stall around the corner, though. Apparently they’re open late, even in this weather.",
            [
              c("notice", "You planned a second stop?", "clue", [
                a("stallObserved", true),
              ]),
              c(
                "easy",
                "Coffee first. We’ll see where the evening goes.",
                "boundary",
                [a("boundaryRespected", true)],
              ),
            ],
          ),
          n(
            "clue",
            "Mara",
            "A possibility, not an itinerary. I thought it might be nice. We can always stay here.",
            [],
            "ending",
          ),
          n(
            "boundary",
            "Mara",
            "That sounds fair. One small decision at a time.",
            [],
            "ending",
          ),
          n(
            "ending",
            "Narrator",
            "Outside, the rain softens the streetlights. She nudges the menu between you. For now, there is only the table, the weather, and somewhere else you might go.",
          ),
        ],
      },
    ],
  };
}
