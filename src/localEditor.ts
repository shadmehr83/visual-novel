export async function downloadLocalEditor() {
  const response = await fetch("/stillframe-studio.html.gz");
  if (!response.ok)
    throw Error(
      "The local editor download is available from a production build.",
    );
  const bytes = new Uint8Array(await response.arrayBuffer());
  const html = bytes[0] === 31 && bytes[1] === 139
    ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text()
    : new TextDecoder().decode(bytes);
  if (!html.includes('data-stillframe-standalone="true"'))
    throw Error(
      "No standalone editor was found. Please use the latest deployed app.",
    );
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "stillframe-studio.html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
