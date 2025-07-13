import {
    apply,
    applyTemplates,
    chain,
    filter,
    mergeWith,
    move,
    Rule,
    SchematicContext,
    Tree,
    url
} from '@angular-devkit/schematics';
import {strings} from '@angular-devkit/core';
const updateNotifier = require('update-notifier');
import * as fs from 'fs';
import * as path from 'path';

// Read package.json manually
const pkgPath = path.resolve(__dirname, '../../../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

updateNotifier({ pkg: pkg.default || pkg }).notify();

export interface StoreOptions {
    name: string;
    actions?: string;
    path?: string;
    appState?: boolean;
    separateFiles?: boolean;
}

export function storeGenerator(options: StoreOptions): Rule {
    const actions = (options.actions || '').split(',').map(a => a.trim());
    const targetPath = options.path || 'src/app/store';
    const dasherizedName = strings.dasherize(options.name);
    const rules: Rule[] = [];
    // ✅ Centralized folders for separateFiles flag
    const storeParts = ['action', 'reducer', 'selector'];

    // 1️⃣ Generate feature store files
    if (options.separateFiles) {
        // Create separate folders for actions, reducers, etc.
        for (const part of storeParts) {
            const templateSource = apply(url('./files/__name__'), [
                filter(path => path.endsWith(`.${part}.ts.template`)),
                applyTemplates({
                    ...options,
                    ...strings,
                    actions,
                    separateFiles: !!options.separateFiles
                }),
                move(`${targetPath}/${part}s`), // store/actions, store/reducers, etc.
            ]);
            rules.push(mergeWith(templateSource));
        }
    } else {
        const storeTemplateSource = apply(url('./files/__name__'), [
            applyTemplates({
                ...options,
                ...strings,
                actions,
                separateFiles: !!options.separateFiles
            }),
            move(`${targetPath}/${dasherizedName}`)
        ]);
        rules.push(mergeWith(storeTemplateSource));
    }

    // 2️⃣ Handle app-state-files.ts logic
    if (options.appState) {
        rules.push((tree: Tree, context: SchematicContext) => {
            const appStatePath = `${targetPath}/app-state.ts`;

            if (!tree.exists(appStatePath)) {
                // 2a. Create app-state-files.ts from template
                const appStateTemplateSource = apply(url('./files/app-state-files'), [
                    applyTemplates({
                        ...options,
                        ...strings
                    }),
                    move(targetPath)
                ]);
                context.logger.info(`📝 Creating app-state.ts at ${appStatePath}`);
                // Return a chain so mergeWith executes properly
                return chain([
                    mergeWith(appStateTemplateSource),
                    (tree2: Tree, ctx: SchematicContext) => {
                        updateAppStateFile(tree2, ctx, options.name, targetPath, options.separateFiles);
                        return tree2;
                    }
                ])(tree, context);
            } else {
                // 2b. If it exists, just update
                updateAppStateFile(tree, context, options.name, targetPath, options.separateFiles);
                return tree;
            }
        });
    }

    return (tree: Tree, context: SchematicContext) => {
        context.logger.info('✅ NgRx Store schematic started.');
        context.logger.info(`📦 Name: ${options.name}`);
        context.logger.info(`📄 Actions: ${actions.join(', ')}`);
        context.logger.info(`📁 Target path: ${targetPath}`);
        context.logger.info(`🧩 App state flag: ${options.appState === true}`);

        const result = chain(rules)(tree, context);

        for (const action of tree.actions || []) {
            context.logger.info(`📝 ${action.kind}: ${action.path}`);
        }

        context.logger.info('✅ Schematic completed.');
        return result;
    };
}

// 🔧 Update app-state-files.ts to include a new slice
function updateAppStateFile(tree: Tree, context: SchematicContext, name: string, targetPath: string, separateFiles?: boolean) {
    const appStatePath = `${targetPath}/app-state.ts`;
    const dasherized = strings.dasherize(name);
    const classed = strings.classify(name);

    let content = tree.read(appStatePath)?.toString('utf-8') || '';

    const importPath = separateFiles
        ? `./reducers/${dasherized}.reducer`
        : `./${dasherized}`;

    const importLine = `import { ${classed}Reducer, ${classed}State } from '${importPath}';`;
    if (!content.includes(importLine)) {
        content = `${importLine}\n${content}`;
    }

    const interfaceRegex = /export\s+interface\s+AppState\s*{([\s\S]*?)}/;
    const interfaceMatch = content.match(interfaceRegex);
    const newInterfaceProp = `  ${classed}: ${classed}State;`;

    if (interfaceMatch && !interfaceMatch[1].includes(`${classed}:`)) {
        content = content.replace(
            interfaceRegex,
            `export interface AppState {\n${interfaceMatch[1].trim()}\n${newInterfaceProp}\n}`
        );
    }

    const reducerMapRegex = /export\s+const\s+reducers:\s*ActionReducerMap<AppState>\s*=\s*{([\s\S]*?)}/;
    const reducerMatch = content.match(reducerMapRegex);
    const newReducerEntry = `  ${classed}: ${classed}Reducer`;

    if (reducerMatch && !reducerMatch[1].includes(`${classed}:`)) {
        content = content.replace(
            reducerMapRegex,
            `export const reducers: ActionReducerMap<AppState> = {\n${reducerMatch[1].trim()},\n${newReducerEntry}\n}`
        );
    }

    tree.overwrite(appStatePath, content);
    context.logger.info(`🔧 app-state.ts updated with '${classed}' slice.`);
}