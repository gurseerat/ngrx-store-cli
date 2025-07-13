# NgRx Store CLI

[![npm version](https://img.shields.io/npm/v/ngrx-store-cli.svg?color=brightgreen&label=version)](https://www.npmjs.com/package/ngrx-store-cli)
[![GitHub](https://img.shields.io/badge/GitHub-gurseerat%2Fngrx--store--cli-blue?logo=github)](https://github.com/gurseerat/ngrx-store-cli)

A schematic for Angular that simplifies the creation of NgRx store slices — including actions, reducers, selectors, effects, and automatic integration with your `app-state.ts`.

---

## ✨ Features

- 🚀 One command to generate full NgRx boilerplate
- 🧱 Supports both flat and structured folder layouts
- 🧩 Optional integration with a central `app-state.ts` file
- 🧼 Automatically appends reducers + interface to your app state

---

## 📦 Installation

```bash
npm install ngrx-store-cli --save-dev
```

---

## 🚀 Usage

Generate a new store slice using command:

```bash
ng generate ngrx-store-cli:store feature-name --actions="actionOne,actionTwo" -a --path=your/path -s
````
```bash
ng g ngrx-store-cli:store user --actions="load,loadSuccess" -a --path=src/app/store -s
```

### ✅ Options

| Option             | Alias | Required | Description                                                                  |
|--------------------|-------|----------|------------------------------------------------------------------------------|
| `--name`           |       | ✅        | Name of the feature or slice                                                 |
| `--actions`        |       | ✅        | Comma-separated list of action names to generate                             |
| `--app-state`      | `-a`  | ❌        | Add this flag to auto-generate and integrate with `app-state.ts`             |
| `--separate-files` | `-s`  | ❌        | Add this flag to generate separate folders for actions, reducers, etc.       |
| `--path`           |       | ❌        | Target path where files will be generated (default: `src/app/store`)         |

---

## 📁 Output Structure

### 🔹 Default (No `--separate-files`)
```
src/app/store/user/
├── user.actions.ts
├── user.reducer.ts
├── user.effects.ts
├── user.selectors.ts
```

### 🔸 With `--separate-files` (`-s`)
```
src/app/store/
├── actions/
│   └── user.actions.ts
├── reducers/
│   └── user.reducer.ts
├── effects/
│   └── user.effects.ts
├── selectors/
│   └── user.selectors.ts
```

---

## 📄 app-state.ts Example

When `--app-state`(`-a`) is passed, the schematic:
- Generates `app-state.ts` if it doesn't exist
- Appends your new reducer and interface to it

```ts
import { ActionReducerMap } from '@ngrx/store';
import { userReducer, UserState } from './user/user.reducer';

export interface AppState {
    user: UserState;
}

export const reducers: ActionReducerMap<AppState> = {
    user: userReducer
};
```

---

## 💡 Tip
You can pass both `--app-state`(`-a`) and `--separate-files`(`-s`) to fully customize your state structure.

---

## 📝 License
MIT

---

## 🤝 Contributions
PRs welcome!

---

## 🔗 Links
- [NgRx Docs](https://ngrx.io)
- [Angular CLI Docs](https://angular.io/cli)
