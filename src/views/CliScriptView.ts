import * as vscode from "vscode";

import { CliCommand } from "../models/CliScript";

export class CliScriptView extends vscode.TreeItem {
  public readonly script: CliCommand;

  public constructor(script: CliCommand) {
    super(script.name);

    this.script = script;
    this.tooltip = script.description;
    this.contextValue = "script";
  }
}
