// Small "Claude" chip marking features and text made by Claude.
export function ClaudeMark({ help }: { help: string }) {
  return (
    <span className="claude-mark" tabIndex={0} data-help={help} title={help}>
      Claude
    </span>
  );
}
