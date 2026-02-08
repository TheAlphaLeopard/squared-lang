export function highlight(code) {
    const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const rules = [
        { regex: /(#.*)/g, class: 'token-comment' },
        { regex: /\b(var|func|return|if|else|while|for|break|continue)\b/g, class: 'token-keyword' },
        { regex: /\b(int|str|bool|obj|prop|a|f)\b/g, class: 'token-type' },
        { regex: /\b(print|random|eval|fstr|fint|fobj|val|e\d+)\b/g, class: 'token-builtin' },
        { regex: /(\b\d+\b)/g, class: 'token-number' },
        { regex: /([[\]{}()=.,+\-*/<>!])/g, class: 'token-punctuation' }
    ];

    let result = escaped;
    // We apply them sequentially but that's risky for overlaps. 
    // Let's use a single pass approach for efficiency and safety.
    const combined = new RegExp(rules.map(r => `(${r.regex.source})`).join('|'), 'g');

    return escaped.replace(combined, (...args) => {
        const match = args[0];
        for (let i = 0; i < rules.length; i++) {
            if (args[i + 1] !== undefined) {
                return `<span class="${rules[i].class}">${match}</span>`;
            }
        }
        return match;
    });
}