import * as vscode from "vscode";

import { RushProject } from "../models";

export class RushProjectView extends vscode.TreeItem {
  public readonly project: RushProject;

  public constructor(project: RushProject) {
    super(project.name, vscode.TreeItemCollapsibleState.Collapsed);

    this.project = project;
    this.contextValue = "monorepoPackage";
    this.tooltip = `${project.name}@${project.version}`;
  }
}
