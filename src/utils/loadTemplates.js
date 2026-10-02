export function loadTemplates() {
    const templateFiles = import.meta.glob("../**/*.xml", {
        query: "?raw",
        import: "default",
        eager: true,
    });

    const content = Object.values(templateFiles)
        .map((xml) =>
            String(xml)
                .replace(/^\s*<templates[^>]*>/, "")
                .replace(/<\/templates>\s*$/, "")
        )
        .join("\n");

    return `
        <templates xml:space="preserve">
            ${content}
        </templates>
    `;
}
