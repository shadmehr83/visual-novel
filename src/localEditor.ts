export async function downloadLocalEditor() {
  const response = await fetch("/stillframe-studio.html");
  if (!response.ok)
    throw Error(
      "The local editor download is available from a production build.",
    );
  const html = await response.text();
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
