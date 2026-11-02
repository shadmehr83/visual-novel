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
  const [mode, setMode] = useState<"demand" | "provider">("demand");
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
  return (
    <div className="library-body assistant">
      <section className="character-replies">
        <h3>Character replies <ClaudeMark help="Added by Claude. When a player uses Self-reply, the speaking character answers them in their own voice, then the authored story continues unchanged." /></h3>
        <label>Who answers self-replies<select aria-label="Character replies" data-help="Choose who answers when a player types their own reply during Play story. Claude on this computer uses your signed-in Claude subscription in the local studio; no API key or password. Off keeps the authored story only." value={replyMode} onChange={e=>{const m=e.target.value as CharacterReplyMode;setCharacterReplyMode(m);setReplyMode(m);}}>
          <option value="claude-local">Claude (this computer) {localLabel}</option>
          <option value="anthropic">Claude API · texts only {api?.ready?"· connected":api?"· not connected":"· checking…"}</option>
          <option value="off">Off · authored story only</option>
        </select></label>
        {replyMode==="claude-local" && <p className={"small claude-status"+(local?.connected?" ok":"")} role="status">{local?.connected ? "✓ Claude Pro connected through Claude Code on this computer. Characters answer automatically." : local?.reason || "Checking Claude on this computer…"}</p>}
        <div className="ai-log-row" data-help="Every AI conversation is logged with its scene, line, chosen path, your text, the answer, whether the story moved on and how long it took. Use it to keep favourite answers, tune replies or spot conversations that ran too long.">
          <span className="small">Playthrough log · {logCount} AI {logCount === 1 ? "reply" : "replies"}{local?.logFolder ? " · also saved to playtest-logs/" : ""}</span>
          <button disabled={!logCount} aria-label="Download AI playthrough log" onClick={() => aiLog.download()}>Download log</button>
          <button disabled={!logCount} aria-label="Clear AI playthrough log" onClick={() => { if (confirm("Clear the AI playthrough log saved in this browser? Files in playtest-logs/ are kept.")) { aiLog.clear(); setLogCount(0); } }}>Clear</button>
        </div>
        {replyMode==="anthropic" && <p className={"small claude-status"+(api?.ready?" ok":"")} role="status">{api?.ready ? "✓ Claude API connected · used for character texts only (self-replies). Other Assistant tasks keep their own provider." : api?.reason || "Checking the Claude API…"}</p>}
        {replyMode==="anthropic" && api && !api.ready && <label>Studio access password<input type="password" autoComplete="off" aria-label="Character reply studio password" data-help="Needed only for the server API key mode. Kept in memory for this tab, never saved." defaultValue={studioSession.password} onChange={e=>{studioSession.password=e.target.value;}} /></label>}
      </section>
      <div
        className="assistant-modes"
        role="tablist"
        aria-label="Assistant mode"
      >
        <button
          role="tab"
          aria-selected={mode === "demand"}
          data-help="Dictate and log change requests for your coding chat. Copy or export the handoff and save it to GitHub without using OpenAI API credits."
          onClick={() => setMode("demand")}
        >
          AI Demand Export
        </button>
        <button
          role="tab"
          aria-selected={mode === "provider"}
          data-help="The existing optional API assistant proposes scene and dialogue edits after its server connection is configured."
          onClick={() => setMode("provider")}
        >
          API assistant
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
          <span className="badge">
            {configured ? "SERVER AI" : "OFFLINE MODE"}
          </span>
          <h3>Cilia AI assistant</h3>
          <label>Assistant task<select aria-label="Assistant task" data-help="Choose the task whose provider assignment you want to use. Each task remembers its own provider in this browser." value={task} onChange={e=>setTask(e.target.value as AssistantTask)}>{Object.entries(taskHelp).map(([id,text])=><option key={id} value={id}>{id}</option>)}</select></label>
          <p className="small">{taskHelp[task]}</p>
          <label>Provider for this task<select aria-label="AI task provider" data-help="Assign OpenAI or Claude to this task. Server keys are required for the chosen provider; assignments do not send requests automatically." value={routes[task]} onChange={e=>{const next={...routes,[task]:e.target.value as Provider};setRoutes(next);localStorage.setItem("stillframe-ai-routes",JSON.stringify(next));}}><option value="openai">OpenAI / ChatGPT {available.openai?"· ready":"· not configured"}</option><option value="anthropic">Anthropic / Claude API {available.anthropic?"· ready":"· not configured"}</option><option value="claude-local">Claude (this computer) {localLabel}</option></select></label>
          {useLocal && <p className={"small claude-status"+(local?.connected?" ok":"")}>{local?.connected ? "✓ Claude Pro connected. No API key or password needed." : local?.reason || "Checking Claude on this computer…"} <ClaudeMark help="Added by Claude: proposals for this task come from Claude through your Claude Code sign-in on this computer." /></p>}
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
