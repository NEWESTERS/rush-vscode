import * as vscode from "vscode";

import { ScriptGroup } from "../models";

export class ScriptGroupView extends vscode.TreeItem {
  public readonly group: ScriptGroup;

  public constructor(group: ScriptGroup) {
    super(group.name, vscode.TreeItemCollapsibleState.Collapsed);

    this.group = group;
    this.iconPath = new vscode.ThemeIcon("symbol-module");
  }
}
