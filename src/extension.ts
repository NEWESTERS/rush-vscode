// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { RushCommandManager } from "./CommandManager";
import { RushMonorepo } from "./models";
import { RushTreeProvider } from "./RushTreeProvider";

export function activate(context: vscode.ExtensionContext) {
  RushMonorepo.init().then((monorepo) => {
    const monorepoProvider = new RushTreeProvider(monorepo);

    vscode.window.createTreeView("rush-vscode.main", {
      treeDataProvider: monorepoProvider,
    });

    const commands = new RushCommandManager(context, monorepo);

    commands.init();
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
