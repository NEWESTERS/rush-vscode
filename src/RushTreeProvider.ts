import * as vscode from "vscode";
import {
  RushProject,
  CliCommand,
  ScriptGroup,
  RushTree,
  RushMonorepo,
} from "./models";
import { RushProjectView, CliScriptView, ScriptGroupView } from "./views";

type RushTreeItem = RushProject | CliCommand | ScriptGroup | RushTree;

export class RushTreeProvider implements vscode.TreeDataProvider<RushTreeItem> {
  private _monorepo: RushMonorepo;

  public constructor(monorepo: RushMonorepo) {
    this._monorepo = monorepo;
  }

  public getTreeItem(
    element: RushTreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (element instanceof RushProject) {
      return new RushProjectView(element);
    } else if (element instanceof CliCommand) {
      return new CliScriptView(element);
    } else if (element instanceof ScriptGroup) {
      return new ScriptGroupView(element);
    } else if (element instanceof RushTree) {
      const view = new vscode.TreeItem(
        "Projects",
        vscode.TreeItemCollapsibleState.Expanded
      );

      view.iconPath = new vscode.ThemeIcon("symbol-function");

      return view;
    }

    throw new Error("Unknown element type");
  }

  public getChildren(
    element?: RushTreeItem | undefined
  ): vscode.ProviderResult<RushTreeItem[]> {
    if (!element) {
      return [ScriptGroup.createGlobal(), new RushTree(this._monorepo)];
    }

    if (element instanceof RushProject) {
      const dependencyNames: string[] = [];

      element.dependencies.forEach((_, packageName) => {
        dependencyNames.push(packageName);
      });

      return Promise.all(
        dependencyNames.map((packageName) =>
          this._monorepo.getProject(packageName)
        )
      ).then((dependencies) => [
        ScriptGroup.fromProject(element),
        ...dependencies,
      ]);
    } else if (element instanceof CliCommand) {
      return [];
    } else if (element instanceof ScriptGroup) {
      return element.scripts;
    } else if (element instanceof RushTree) {
      return element.getChildren();
    }
  }
}
