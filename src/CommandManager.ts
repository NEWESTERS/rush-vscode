import * as vscode from "vscode";

import { RushProject, CliCommand, RushGlobalScripts } from "./models";
import { MonorepoProvider } from "./MonorepoProvider";

export class RushCommandManager {
  private readonly _context: vscode.ExtensionContext;
  private readonly _provider: MonorepoProvider;

  public constructor(
    context: vscode.ExtensionContext,
    provider: MonorepoProvider
  ) {
    this._context = context;
    this._provider = provider;
  }

  public init(): void {
    this._context.subscriptions.push(
      this._registerCommand("rush-vscode.buildDeps", this._buildDeps)
    );

    this._context.subscriptions.push(
      this._registerCommand(
        "rush-vscode.runPackageScript",
        this._runPackageScript
      )
    );

    this._context.subscriptions.push(
      this._registerCommand("rush-vscode.runScript", this._runScript)
    );

    this._context.subscriptions.push(
      this._registerCommand("rush-vscode.startPackage", this._startPackage)
    );
  }

  private _registerCommand: typeof vscode.commands.registerCommand = (
    command,
    callback
  ) => {
    return vscode.commands.registerCommand(command, (...args) => {
      const result = callback(...args);

      if (result instanceof Promise) {
        result.catch((error) => {
          let message = `Something went wrong while executing command "${command}"`;

          if (error instanceof Error) {
            message = error.message;
          }

          vscode.window.showErrorMessage(message);
        });
      }
    });
  };

  private _startPackage = async (item?: RushProject) => {
    let project = item;

    if (!project || !(project instanceof RushProject)) {
      project = await this._provider.monorepo.then((monorepo) =>
        monorepo.promptProject("Package to run script")
      );
    }

    if (!project) {
      return;
    }

    await project.start();
  };

  private _buildDeps = async (item?: RushProject) => {
    let project = item;

    if (!project || !(project instanceof RushProject)) {
      project = await this._provider.monorepo.then((monorepo) =>
        monorepo.promptProject("Package to build")
      );
    }

    if (!project) {
      return;
    }

    project.buildDependencies();
  };

  private _runPackageScript = async (item?: RushProject) => {
    let project = item;

    if (!project || !(project instanceof RushProject)) {
      project = await this._provider.monorepo.then((monorepo) =>
        monorepo.promptProject("Package to run script")
      );
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
