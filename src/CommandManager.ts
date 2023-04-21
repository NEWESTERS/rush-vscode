import * as vscode from "vscode";

import {
  RushMonorepo,
  RushProject,
  CliCommand,
  RushGlobalScripts,
} from "./models";

export class RushCommandManager {
  private readonly _context: vscode.ExtensionContext;
  private readonly _monorepo: RushMonorepo;

  public constructor(context: vscode.ExtensionContext, monorepo: RushMonorepo) {
    this._context = context;
    this._monorepo = monorepo;
  }

  public init(): void {
    this._context.subscriptions.push(
      vscode.commands.registerCommand(
        "rush-vscode.buildDeps",
        this._handleBuildDeps
      )
    );

    this._context.subscriptions.push(
      vscode.commands.registerCommand(
        "rush-vscode.runPackageScript",
        this._runPackageScript
      )
    );

    this._context.subscriptions.push(
      vscode.commands.registerCommand("rush-vscode.runScript", this._runScript)
    );
  }

  private _handleBuildDeps = async (item?: RushProject) => {
    let project = item;

    if (!project || !(project instanceof RushProject)) {
      project = await this._monorepo.promptProject("Package to build");
    }

    if (!project) {
      return;
    }

    project.buildDependencies();
  };

  private _runPackageScript = async (item?: RushProject) => {
    let project = item;

    if (!project || !(project instanceof RushProject)) {
      project = await this._monorepo.promptProject("Package to run script");
    }

    if (!project) {
      return;
    }

    const script = await project.promptScript("Package script to run");

    if (script) {
      script.execute();
    }
  };

  private _runScript = async (item?: CliCommand) => {
    let script = item;

    if (!script || !(script instanceof CliCommand)) {
      const scriptName = await vscode.window.showQuickPick(
        RushGlobalScripts.scriptNames,
        {
          title: "Global script",
        }
      );

      if (!scriptName) {
        return;
      }

      script = RushGlobalScripts.getScript(scriptName);
    }

    if (!script) {
      return;
    }

    script.execute();
  };
}
