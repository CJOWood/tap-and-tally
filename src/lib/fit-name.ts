import { tick } from "svelte";

/** Fit one line to its slot without changing the size of the tile. */
export function fitName(line: HTMLElement, text: string) {
  const label = line.firstElementChild as HTMLElement;

  function fit() {
    label.style.fontSize = "";
    if (line.clientWidth === 0 || label.offsetWidth <= line.clientWidth) return;

    const preferredSize = parseFloat(getComputedStyle(label).fontSize);
    const readableMinimum =
      parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.7;
    let smallest = Math.min(readableMinimum, preferredSize);
    let largest = preferredSize;

    // Find the biggest size that fits to within a fraction of a pixel.
    while (largest - smallest > 0.25) {
      const size = (smallest + largest) / 2;
      label.style.fontSize = `${size}px`;
      if (label.offsetWidth <= line.clientWidth) smallest = size;
      else largest = size;
    }
    label.style.fontSize = `${smallest}px`;
  }

  let previousWidth = -1;
  const observer = new ResizeObserver(() => {
    if (line.clientWidth === previousWidth) return;
    previousWidth = line.clientWidth;
    fit();
  });
  observer.observe(line);
  void document.fonts.ready.then(() => {
    if (line.isConnected) fit();
  });

  return {
    update(nextText: string) {
      if (nextText === text) return;
      text = nextText;
      void tick().then(() => {
        if (line.isConnected) fit();
      });
    },
    destroy: () => observer.disconnect(),
  };
}
