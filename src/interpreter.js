/**
 * Squared (^2) JIT Compiler
 * A lean, high-performance engine for the Squared Language.
 */
export class Compiler {
    constructor(outputCallback, inputCallback) {
        this.output = outputCallback || console.log;
        this.inputPrompt = inputCallback || (() => Promise.resolve(""));
        this.modules = new Map();
    }

    async compile(ast) {
        const body = await this.compileBlock(ast.body);
        const funcString = `return (async function() {
            const { print, input, modules, format } = __ctx;
            ${body}
        })();`;
        const fn = new Function('__ctx', funcString);
        return {
            execute: () => fn({
                print: (...args) => this.output(args.map(a => this.formatOutput(a)).join(' ')),
                input: async (msg) => await this.inputPrompt(this.formatOutput(msg)),
                modules: this.modules,
                format: (v) => this.formatOutput(v)
            })
        };
    }

    async compileBlock(statements) {
        let js = '';
        for (const stmt of statements) js += await this.compileStatement(stmt);
        return js;
    }

    async compileStatement(node) {
        switch (node.type) {
            case 'ImportStatement':
                const url = window.__sqrdModules?.get(node.moduleName) || `./${node.moduleName}`;
                const mod = await import(url);
                const obj = mod.default || mod;
                this.modules.set(node.moduleName, obj);
                let mJs = `var ${node.moduleName.split('.')[0]} = modules.get('${node.moduleName}');\n`;
                if (typeof obj === 'object') {
                    for (const k in obj) mJs += `var ${k} = ${node.moduleName.split('.')[0]}['${k}'];\n`;
                }
                return mJs;
            case 'VarDeclaration': return `var ${node.name} = ${await this.compileExpression(node.value)};\n`;
            case 'AssignmentStatement': return `${node.name} = ${await this.compileExpression(node.value)};\n`;
            case 'FunctionDeclaration':
                return `var ${node.name} = async (${node.params.join(', ')}) => {\n${await this.compileBlock(node.body)}\n};\n`;
            case 'IfStatement':
                let ifJs = `if (${await this.compileExpression(node.test)}) {\n${await this.compileBlock(node.consequent)}}\n`;
                if (node.alternate) ifJs += `else {\n${await this.compileBlock(node.alternate)}}\n`;
                return ifJs;
            case 'WhileStatement': return `while (${await this.compileExpression(node.test)}) {\n${await this.compileBlock(node.body)}}\n`;
            case 'ReturnStatement': return `return ${node.value ? await this.compileExpression(node.value) : 'null'};\n`;
            case 'BreakStatement': return 'break;\n';
            case 'ContinueStatement': return 'continue;\n';
            case 'ExpressionStatement': return `${await this.compileExpression(node.expression)};\n`;
            default: return '';
        }
    }

    async compileExpression(node) {
        if (!node) return 'null';
        switch (node.type) {
            case 'Literal': return JSON.stringify(node.value);
            case 'Identifier': return node.value;
            case 'BinaryExpression': return `(${await this.compileExpression(node.left)} ${node.operator} ${await this.compileExpression(node.right)})`;
            case 'CallExpression':
                const callee = await this.compileExpression(node.callee);
                const args = await Promise.all(node.arguments.map(a => this.compileExpression(a)));
                if (callee === 'input') return `(await input(${args[0] || '""'}))`;
                return `(await ${callee}(${args.join(', ')}))`;
            case 'MemberExpression':
                const obj = await this.compileExpression(node.object);
                const prop = node.dynamic ? await this.compileExpression(node.property) : `'${node.property}'`;
                return `(${obj}[${prop}])`;
            case 'TypeConstruction': return await this.compileTypeConstruction(node);
            default: return 'null';
        }
    }

    async compileTypeConstruction(node) {
        const { callee, bodyTokens } = node;
        const raw = bodyTokens.map(t => t.raw || t.value).join('');
        if (callee === 'int') return `parseInt(${JSON.stringify(raw)}, 10)`;
        if (callee === 'str') return JSON.stringify(raw);
        if (callee === 'bool') return `(${JSON.stringify(raw.trim().toLowerCase())} === 'true')`;
        if (callee === 'var') return raw.trim();
        if (callee === 'f') return await this.compileTokensAsExpr(bodyTokens);
        if (callee === 'a') {
            let elements = [], current = [], bal = 0;
            for (let t of bodyTokens) {
                if (t.value === ',' && bal === 0) { elements.push(await this.compileTokensAsExpr(current)); current = []; }
                else { if (t.value === '[') bal++; if (t.value === ']') bal--; current.push(t); }
            }
            if (current.length) elements.push(await this.compileTokensAsExpr(current));
            return `[${(await Promise.all(elements)).join(', ')}]`;
        }
        if (callee === 'fstr') {
            let js = '`', i = 0;
            while (i < bodyTokens.length) {
                if (bodyTokens[i].value === '{') {
                    let exprT = [], b = 1; i++;
                    while (i < bodyTokens.length && b > 0) {
                        if (bodyTokens[i].value === '{') b++;
                        if (bodyTokens[i].value === '}') { b--; if (b === 0) break; }
                        exprT.push(bodyTokens[i]); i++;
                    }
                    js += '${format(' + await this.compileTokensAsExpr(exprT) + ')}';
                } else js += (bodyTokens[i].raw || bodyTokens[i].value).replace(/`/g, '\\`').replace(/\$/g, '\\$');
                i++;
            }
            return js + '`';
        }
        return JSON.stringify(raw);
    }

    async compileTokensAsExpr(tokens) {
        if (!tokens.length) return 'null';
        const { Parser, Lexer } = await import('./parser.js');
        const code = tokens.map(t => t.raw || t.value).join('').trim();
        return await this.compileExpression(new Parser(new Lexer(code).tokenize()).parseExpression());
    }

    formatOutput(val) {
        if (val === null || val === undefined) return 'null';
        if (Array.isArray(val)) return `[${val.map(v => this.formatOutput(v)).join(', ')}]`;
        return String(val);
    }
}