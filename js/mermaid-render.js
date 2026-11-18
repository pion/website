document.addEventListener('DOMContentLoaded', async () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const getPreferredScheme = () => mediaQuery.matches ? 'dark' : 'default';

    const mermaidBlocks = document.querySelectorAll(`code[data-lang="mermaid"]`);
    const mermaidDivs = [];

    mermaidBlocks.forEach(block => {
        const div = document.createElement("div");
        div.className = "mermaid";

        div.dataset.originalText = block.textContent;

        block.replaceWith(div);
        mermaidDivs.push(div);
    });

    const renderDiagrams = async (theme) => {
        mermaid.initialize({ startOnLoad: false, theme: theme });

        mermaidDivs.forEach(div => {
            div.textContent = div.dataset.originalText;


            div.removeAttribute('data-processed');
        });

        if (mermaid.run) {
            await mermaid.run({ nodes: mermaidDivs });
        } else {
            mermaid.init(undefined, mermaidDivs);
        }
    };

    await renderDiagrams(getPreferredScheme());

    mediaQuery.addEventListener('change', async (e) => {
        const newTheme = e.matches ? 'dark' : 'default';
        await renderDiagrams(newTheme);
    });
});