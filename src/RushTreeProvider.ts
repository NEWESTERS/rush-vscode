import * as vscode from "vscode";
import {
  RushProject,
  CliCommand,
  ScriptGroup,
  RushProjectGroup,
  RushMonorepo,
} from "./models";
import {
  RushProjectView,
  CliScriptView,
  ScriptGroupView,
  RushProjectGroupView,
} from "./views";

type RushTreeItem = RushProject | CliCommand | ScriptGroup | RushProjectGroup;

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
    } else if (element instanceof RushProjectGroup) {
      return new RushProjectGroupView(element);
    }

    throw new Error("Unknown element type");
  }

  public getChildren(
    element?: RushTreeItem | undefined
  ): vscode.ProviderResult<RushTreeItem[]> {
    if (!element) {
      return [
        ScriptGroup.createGlobal(),
        new RushProjectGroup("Projects", this._monorepo),
      ];
    }

    if (element instanceof RushProject) {
      const children: RushTreeItem[] = [ScriptGroup.fromProject(element)];

      if (element.hasDependencies) {
        children.push(
          new RushProjectGroup("Dependencies", this._monorepo, element)
        );
      }

      return children;
    } else if (element instanceof CliCommand) {
      return [];
    } else if (element instanceof ScriptGroup) {
      return element.scripts;
    } else if (element instanceof RushProjectGroup) {
      return element.getChildren();
    }
  }
}
