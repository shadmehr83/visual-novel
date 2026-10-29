# AI Demand Export

1. Open **Assistant → AI Demand Export**.
2. Type a change or press **Speak a demand**. Stop dictation and review the transcript.
3. Press **Save request** to keep its timestamp and current scene/dialogue in your editable project.
4. Press **Copy + open ChatGPT**, review/paste the handoff and press Send in ChatGPT.

To continue in this existing conversation, expand **Use my existing ChatGPT conversation**, paste its HTTPS conversation link, and use the same button. That preference stays in this browser. With no link, the studio opens a new ChatGPT chat with a prefilled request when the site supports it. Clipboard failure shows a selectable handoff instead. Long requests use clipboard handoff rather than oversized URLs.

**Save request in GitHub** opens a prefilled file in `demands/inbox`. Finish with **Commit changes** in GitHub. Large requests download as a Markdown file to upload instead. If direct GitHub publishing is already configured, **Direct GitHub save** can commit it using your studio password and confirms the resulting link. No OpenAI API key is used by this panel.

Saved requests appear newest first. Select one to copy or download it, mark it done, reopen it or remove the local entry. Complete project JSON files preserve the log; **Export request log** produces a small text-only JSON backup. Drafts and the optional chat link stay on this browser. Removing a local entry does not delete a committed GitHub file.

This is a request handoff, not a live connection to an existing chat. The studio cannot press Send inside ChatGPT or make this Codex task run automatically. A GitHub commit does not start a coding task. The separate **API assistant** remains available for future provider setup.

## Update times and help

The toolbar badge now shows only the current version. **Update history** retains release names, changes and feature directions, and displays Sydney timestamps down to the second. Historical times come from Git commits; the current entry records when its release was prepared. These are not Cloudflare deployment completion times.

Chapter fields, rule comparisons, scenario priorities, ending checkboxes and test-state controls have short, specific hover descriptions. New demand controls also describe their action on hover.
