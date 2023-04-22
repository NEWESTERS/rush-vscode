import * as vscode from "vscode";

import { RushProjectGroup } from "../models";

export class RushProjectGroupView extends vscode.TreeItem {
  public readonly group: RushProjectGroup;

  public constructor(group: RushProjectGroup) {
    super(group.name, vscode.TreeItemCollapsibleState.Collapsed);

    this.group = group;
    this.iconPath = new vscode.ThemeIcon("symbol-function");
  }
}
