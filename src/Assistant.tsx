import { taskHelp, type Provider, type AssistantTask } from "./aiProviders";
import { DemandExport } from "./DemandExport";
import { useEffect, useRef, useState } from "react";
import { applyProposal, aiContext, proposalSchema, type Proposal } from "./ai";
import type { Project } from "./model";
import { ClaudeMark } from "./ClaudeMark";
import { aiLog, characterReplyMode, claudeApiStatus, claudeLocalStatus, setCharacterReplyMode, studioSession, type CharacterReplyMode, type ClaudeLocalStatus } from "./characterReply";
// "claude-local" uses this computer's Claude Code sign-in (local studio only, no API key).
type TaskProvider = Provider | "claude-local";
export function Assistant({
  project,
  sceneId,
  nodeId,
  edit,
  apply,
}: {
  project: Project;
  sceneId: string;
  nodeId: string;
  edit: (fn: (p: Project) => void) => void;
  apply: (p: Project) => void;
}) {
  const [mode, setMode] = useState<"demand" | "provider">("provider");
  const [task,setTask]=useState<AssistantTask>("dialogue");
  const [routes,setRoutes]=useState<Record<AssistantTask,TaskProvider>>(()=>{try{return {dialogue:"claude-local","system-ui":"openai",effects:"openai",...JSON.parse(localStorage.getItem("stillframe-ai-routes")||"{}")};}catch{return {dialogue:"claude-local","system-ui":"openai",effects:"openai"};}});
  const [available,setAvailable]=useState<Record<string,boolean>>({});
  const [local,setLocal]=useState<ClaudeLocalStatus|null>(null);
  const [replyMode,setReplyMode]=useState<CharacterReplyMode>(characterReplyMode);
  const [logCount,setLogCount]=useState(()=>aiLog.read().length);
  useEffect(()=>{const t=setInterval(()=>setLogCount(aiLog.read().length),3000);return()=>clearInterval(t);},[]);
  useEffect(()=>{let live=true;claudeLocalStatus().then(s=>{if(live)setLocal(s);});return()=>{live=false;};},[]);
  const localLabel=local?.connected?"· connected":local?"· not connected":"· checking…";
  const [api,setApi]=useState<{ready:boolean;reason?:string}|null>(null);
  useEffect(()=>{let live=true;claudeApiStatus().then(s=>{if(live)setApi(s);});return()=>{live=false;};},[]);
  const useLocal=routes[task]==="claude-local";
  const [prompt, setPrompt] = useState(
    "Add gentle rain and dim this scene slightly.",
  );
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [base, setBase] = useState("");
  const [status, setStatus] = useState("Checking AI connection…");
  const [configured, setConfigured] = useState(false);
  const [consent, setConsent] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recognition = useRef<any>(null);
  useEffect(() => {
    if (mode !== "provider") return;
    if (location.protocol === "file:") {
      setStatus(
        "Local HTML mode. The offline helper works here. Use your hosted studio for provider AI; never put an API key into this file.",
      );
      return;
    }
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((v) => {
        setConfigured(v.configured === true);
        setAvailable(v.providers || {openai:v.configured});
        setStatus(
          v.configured
            ? "AI connected. Review each proposal before applying."
            : "AI not configured. The offline rain/dim helper still works.",
        );
      })
      .catch(() =>
        setStatus(
          "AI unavailable here. Use the offline helper, or deploy with the server function.",
        ),
      );
    return () => {
      recognition.current?.abort();
      speechSynthesis?.cancel();
    };
  }, [mode]);
  function voice() {
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setStatus(
        "Voice input is unavailable in this browser. Try Chrome or Edge over HTTPS, or type your request.",
      );
      return;
    }
    if (listening) {
      recognition.current?.stop();
      return;
    }
    if (
      !confirm(
        "Your browser may send microphone audio to its speech-recognition service. Start dictation?",
      )
    )
      return;
    const r = new Recognition();
    recognition.current = r;
    r.lang = navigator.language;
    r.interimResults = false;
    r.onresult = (e: any) => {
      setPrompt((v) => v + " " + e.results[0][0].transcript);
      setProposal(null);
    };
    r.onerror = (e: any) =>
      setStatus(
        "Microphone: " + e.error + ". You can still type your request.",
      );
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  }
  async function propose(local = false) {
    setBusy(true);
    setProposal(null);
    try {
      let result: unknown;
      if (local) {
        if (!/rain|dim/i.test(prompt))
          throw Error(
            "The offline helper supports rain and dimming. Configure AI for broader requests.",
          );
        result = {
          explanation: "Offline preset for the selected scene.",
          assumptions: ["Existing rain region is preserved."],
          operations: [
            {
              type: "effects",
              scene: sceneId,
              values: {
                ...(/rain/i.test(prompt) ? { rain: true, density: 65 } : {}),
                ...(/dim/i.test(prompt) ? { brightness: 0.85 } : {}),
              },
            },
          ],
        };
      } else {
        if (!consent)
          throw Error(
            "Choose whether to share text context before requesting AI help.",
          );
        const r = await fetch(useLocal ? "/api/claude-local/assistant" : "/api/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(useLocal ? {} : { Authorization: "Bearer " + password }),
          },
          body: JSON.stringify({
            prompt: prompt + " Selected scene: " + sceneId,
            context: aiContext(project),
            ...(useLocal ? {} : { provider: routes[task] }), task,
          }),
        });
        result = await r.json();
        if (!r.ok) throw Error((result as any).error || "AI request failed");
      }
      const p = proposalSchema.parse(result);
      applyProposal(project, p);
      setBase(JSON.stringify(project));
      setProposal(p);
      setStatus("Proposal ready. Nothing has changed yet.");
    } catch (e) {
      setStatus(String(e));
    } finally {
      setBusy(false);
    }
  }
  // One place to choose the AI for each job (by Claude). Character texts are the in-game replies.
  const textsLabel = { "claude-local": "Claude Code · this computer", anthropic: "Claude API · site key", off: "Off · written story only", online: "Claude API · site key" } as const;
  const editLabel = { "claude-local": "Claude Code · this computer", openai: "OpenAI API (ChatGPT)", anthropic: "Claude API · reserved for texts" } as const;
  const chooseEdit = (t: AssistantTask, p: TaskProvider) => {
    if (p === "anthropic" && !confirm("The Claude API is reserved for character texts (self-replies) for now. Using it here spends your Anthropic credit on editing tasks.\n\nUse the Claude API for this task anyway?")) return;
    const next = { ...routes, [t]: p };
    setRoutes(next);
    try { localStorage.setItem("stillframe-ai-routes", JSON.stringify(next)); } catch { /* lasts for this page only */ }
  };
  const providerStatus = (p: string, forTexts: boolean) =>
    p === "claude-local"
      ? local?.connected ? `✓ Connected. This is Claude (Anthropic) running through Claude Code on this computer with your Claude Pro plan: ${forTexts ? "Claude Haiku 5.5 for fast character texts" : "Claude Sonnet 5.5 for edit proposals"}. Local studio only.` : local?.reason || "Checking Claude Code on this computer…"
      : p === "anthropic" || p === "online"
        ? forTexts ? (api?.ready ? "✓ Claude API connected through this site's key (Claude Haiku 5.5). Used for character texts only." : api?.reason || "Checking the Claude API…") : "⚠ Reserved for character texts. Proposals here spend your Anthropic credit."
        : p === "openai" ? (available.openai ? "✓ OpenAI API connected through this site's key." : "OpenAI API not configured on this site (needs AI_API_KEY).")
        : "Characters keep to the written story; self-replies are only recorded.";
  return (
    <div className="library-body assistant">
      <div
        className="assistant-modes"
        role="tablist"
        aria-label="Assistant mode"
      >
        <button
          role="tab"
          aria-selected={mode === "provider"}
          data-help="Choose which AI handles each job (character texts, dialogue rewrites, phone and item UI, effects) and ask for edit proposals."
          onClick={() => setMode("provider")}
        >
          AI assistant
        </button>
        <button
          role="tab"
          aria-selected={mode === "demand"}
          data-help="Dictate and log change requests for your coding chat. Copy or export the handoff and save it to GitHub without using API credits."
          onClick={() => setMode("demand")}
        >
          AI Demand Export
        </button>
      </div>
      {mode === "demand" ? (
        <DemandExport
          key={project.id}
          project={project}
          sceneId={sceneId}
          nodeId={nodeId}
          edit={edit}
        />
      ) : (
        <>
          <h3>AI assistant <ClaudeMark help="Redesigned by Claude: every job picks its own AI here. Claude Code is Claude on this computer; the Claude API is the site's Anthropic key." /></h3>
          <section className="ai-job">
            <label>Character texts (self-replies)<select aria-label="Character replies" data-help="Who answers when a player types their own reply during play. Claude Code uses your Claude Pro plan on this computer (local studio); the Claude API uses this site's Anthropic key and also powers the share link." value={replyMode} onChange={e=>{const m=e.target.value as CharacterReplyMode;setCharacterReplyMode(m);setReplyMode(m);}}>
              <option value="claude-local">{textsLabel["claude-local"]} {localLabel}</option>
              <option value="anthropic">{textsLabel.anthropic} {api?.ready?"· connected":api?"· not connected":"· checking…"}</option>
              <option value="off">{textsLabel.off}</option>
            </select></label>
            <p className={"small claude-status"+((replyMode==="claude-local"?local?.connected:replyMode==="anthropic"?api?.ready:false)?" ok":"")} role="status">{providerStatus(replyMode, true)}</p>
            {replyMode==="anthropic" && api && !api.ready && <label>Studio access password<input type="password" autoComplete="off" aria-label="Character reply studio password" data-help="Needed only when this studio was not opened from a link with ?code=. Kept in memory for this tab, never saved." defaultValue={studioSession.password} onChange={e=>{studioSession.password=e.target.value;}} /></label>}
            <div className="ai-log-row" data-help="Every AI conversation is logged with its scene, line, chosen path, your text, the answer, whether the story moved on and how long it took. Use it to keep favourite answers, tune replies or spot conversations that ran too long.">
              <span className="small">Playthrough log · {logCount} AI {logCount === 1 ? "reply" : "replies"}{local?.logFolder ? " · also saved to playtest-logs/" : ""}</span>
              <button disabled={!logCount} aria-label="Download AI playthrough log" onClick={() => aiLog.download()}>Download log</button>
              <button disabled={!logCount} aria-label="Clear AI playthrough log" onClick={() => { if (confirm("Clear the AI playthrough log saved in this browser? Files in playtest-logs/ are kept.")) { aiLog.clear(); setLogCount(0); } }}>Clear</button>
            </div>
          </section>
          {(Object.keys(taskHelp) as AssistantTask[]).map((t) => (
            <section className="ai-job" key={t}>
              <label>{{ dialogue: "Dialogue rewrites", "system-ui": "Phone & item UI", effects: "Lighting & effects" }[t]}<select aria-label={"AI for " + t} data-help={taskHelp[t] + " Proposals always wait for your approval."} value={routes[t]} onChange={e=>chooseEdit(t, e.target.value as TaskProvider)}>
                <option value="claude-local">{editLabel["claude-local"]} {localLabel}</option>
                <option value="openai">{editLabel.openai} {available.openai?"· ready":"· not configured"}</option>
                <option value="anthropic">{editLabel.anthropic}</option>
              </select></label>
              <p className={"small claude-status"+((routes[t]==="claude-local"&&local?.connected)||(routes[t]==="openai"&&available.openai)?" ok":"")}>{providerStatus(routes[t], false)}</p>
            </section>
          ))}
          <h3>Ask for an edit</h3>
          <label>Job<select aria-label="Assistant task" data-help="Which job this request belongs to; it uses the AI chosen for that job above." value={task} onChange={e=>setTask(e.target.value as AssistantTask)}>{(Object.keys(taskHelp) as AssistantTask[]).map((id)=><option key={id} value={id}>{{ dialogue: "Dialogue rewrites", "system-ui": "Phone & item UI", effects: "Lighting & effects" }[id]} · {editLabel[routes[id]]}</option>)}</select></label>
          <p className="small muted">
            Ask for mood changes, dialogue rewrites or scene titles. The
            assistant proposes edits; you stay in control.
          </p>
          <textarea
            aria-label="Assistant request"
            rows={6}
            maxLength={4000}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setProposal(null);
            }}
          />
          <button className="wide" onClick={voice}>
            {listening ? "Stop dictation" : "🎙 Speak your request"}
          </button>
          {(configured || (useLocal && local?.connected)) && (
            <>
              {!useLocal && <label>
                Studio access password
                <input
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>}
              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                Share this request, scene text, asset names and character notes
                with the AI provider. Artwork and audio are excluded.
              </label>
              <button
                className="wide primary"
                disabled={busy || !consent || (!useLocal && !password)}
                onClick={() => propose()}
              >
                Ask AI
              </button>
            </>
          )}
          <button
            className="wide"
            disabled={busy}
            onClick={() => propose(true)}
          >
            Preview offline rain / dim preset
          </button>
          <p role="status" className="small">
            {busy ? "Thinking…" : status}
          </p>
          {proposal && (
            <div className="clue">
              <b>{proposal.explanation}</b>
              {proposal.assumptions.map((s, i) => (
                <p key={i}>{s}</p>
              ))}
              <pre>{JSON.stringify(proposal.operations, null, 2)}</pre>
              <button
                className="wide primary"
                onClick={() => {
                  try {
                    if (base !== JSON.stringify(project))
                      throw Error(
                        "Project changed. Request a fresh proposal before applying.",
                      );
                    apply(applyProposal(project, proposal));
                    setProposal(null);
                    setStatus("Applied. Use Undo to reverse this edit.");
                  } catch (e) {
                    setStatus(String(e));
                  }
                }}
              >
                Apply approved changes
              </button>
              <button className="wide" onClick={() => setProposal(null)}>
                Reject / revise
              </button>
              <button
                className="wide"
                onClick={() => {
                  speechSynthesis.cancel();
                  speechSynthesis.speak(
                    new SpeechSynthesisUtterance(proposal.explanation),
                  );
                }}
              >
                Read proposal aloud
              </button>
            </div>
          )}
          <p className="small muted">
            No provider key belongs in this panel. The server uses a Cloudflare
            secret. Dictation transcribes speech; it never applies edits
            automatically.
          </p>
        </>
      )}
    </div>
  );
}
