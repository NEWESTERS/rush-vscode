import * as vscode from "vscode";
import {
  RushProject,
  CliCommand,
  ScriptGroup,
  RushProjectGroup,
} from "./models";
import {
  RushProjectView,
  CliScriptView,
  ScriptGroupView,
  RushProjectGroupView,
} from "./views";
import { MonorepoProvider } from "./MonorepoProvider";

type RushTreeItem = RushProject | CliCommand | ScriptGroup | RushProjectGroup;

export class RushTreeProvider implements vscode.TreeDataProvider<RushTreeItem> {
  private _provider: MonorepoProvider;

  public constructor(provider: MonorepoProvider) {
    this._provider = provider;
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
      return this._provider.monorepo.then((monorepo) => [
        ScriptGroup.createGlobal(),
        new RushProjectGroup("Projects", monorepo),
      ]);
    }

    if (element instanceof RushProject) {
      const children: RushTreeItem[] = [ScriptGroup.fromProject(element)];

      if (element.hasDependencies) {
        return this._provider.monorepo.then((monorepo) => [
          ...children,
          new RushProjectGroup("Dependencies", monorepo, element),
        ]);
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
