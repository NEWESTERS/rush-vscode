// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { RushCommandManager } from "./CommandManager";
import { RushTreeProvider } from "./RushTreeProvider";
import { MonorepoProvider } from "./MonorepoProvider";

export function activate(context: vscode.ExtensionContext) {
  const monorepoProvider = new MonorepoProvider();

  vscode.window.createTreeView("rush-vscode.main", {
    treeDataProvider: new RushTreeProvider(monorepoProvider),
  });

  const commands = new RushCommandManager(context, monorepoProvider);

  commands.init();
}

// This method is called when your extension is deactivated
export function deactivate() {}
