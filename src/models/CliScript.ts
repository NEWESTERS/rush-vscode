import * as vscode from "vscode";

import { IRushProject } from "./interfaces";

interface ICliCommandOptions {
  project?: IRushProject;
  description?: string;
}

export class CliCommand {
  public readonly name: string;
  public readonly body: string;
  private _options?: ICliCommandOptions;

  public get description(): string | undefined {
    return this._options?.description;
  }

  public constructor(
    name: string,
    script: string,
    options: ICliCommandOptions = {}
  ) {
    this.name = name;
    this.body = script;
    this._options = options;
  }

  private get _task(): vscode.Task {
    return new vscode.Task(
      { type: this.body },
      vscode.TaskScope.Workspace,
      this.name,
      this.body.split(" ")[0],
      new vscode.ShellExecution(this.body, {
        cwd: this._options?.project?.path?.fsPath,
      })
    );
  }

  public execute(): Thenable<vscode.TaskExecution> {
    return vscode.tasks.executeTask(this._task);
  }
}
