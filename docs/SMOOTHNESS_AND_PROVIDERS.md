# Smoothness and provider routing — v2.18

Project edits share unchanged data rather than deep-copying embedded media. Undo retains old versions through shared references. GIF rendering is capped near 30 fps. These changes reduce work; no fixed RAM or frame-rate improvement is promised on every device.

Windows & docking → Restore all window positions clears dock geometry and stale custom preview sizing. All preview, dock and divider resizing controls remain available. Whole workspace panes support home and floating positions; docking a workspace into its own child surface is prevented, including older saved layouts. Custom-preview CSS applies only to its direct editor, preventing nested workspaces from inheriting the wrong dimensions. Crowded preview controls scroll within their pane.

Assistant → API assistant → Assistant task assigns a provider separately for dialogue, system UI suggestions and effects. Assignments stay in this browser. OpenAI uses AI_API_KEY and optional AI_MODEL. Claude uses ANTHROPIC_API_KEY and optional ANTHROPIC_MODEL. Both require STUDIO_ACCESS_TOKEN. Enter no provider keys into the browser. API proposals still require review; engine-code requests use AI Demand Export. Provider selection alone does not configure credentials or verify billing/model availability.

Recent controls have a NEW marker or hover label for the latest two releases. Update history retains descriptions, clickable feature titles and separate links for affected settings areas. Added layout descriptions explain individual controls briefly.
