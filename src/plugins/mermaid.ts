import type { Html } from "mdast";
import type { MdastPluginDefinition } from "satteri";

const escapeHtml = (text: string) =>
	text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/**
 * Turns ```mermaid code blocks into <pre class="mermaid"> before Expressive Code sees them,
 * so they are not syntax-highlighted. src/components/blog/PostEnhancements.astro renders them client side.
 */
export function satteriMermaidPlugin(): MdastPluginDefinition {
	return {
		name: "til-mermaid",
		code(node): Html | undefined {
			if (node.lang !== "mermaid") return;
			return { type: "html", value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>` };
		},
	};
}
