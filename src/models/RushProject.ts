import * as vscode from "vscode";

import { IDependencyMeta, IPackageJson, IRushMonorepo } from "./interfaces";
import { CliCommand } from "./CliScript";

export class RushProject {
  private readonly _localDependencies: Map<string, IDependencyMeta> = new Map();
  private readonly _scripts: Map<string, CliCommand> = new Map();
  private readonly _monorepo: IRushMonorepo;

  public get dependencies(): ReadonlyMap<string, IDependencyMeta> {
    return this._localDependencies;
  }

  public get scripts(): ReadonlyMap<string, CliCommand> {
    return this._scripts;
  }

  public get path(): vscode.Uri {
    return this._monorepo.getPackagePath(this.name);
  }

  public get hasDependencies(): boolean {
    return this._localDependencies.size !== 0;
  }

  public readonly name: string;

  public readonly version: string;

  public constructor(monorepo: IRushMonorepo, packageJson: IPackageJson) {
    this._monorepo = monorepo;
    this.name = packageJson.name;
    this.version = packageJson.version;

    packageJson.dependencies &&
      Object.keys(packageJson.dependencies).forEach((packageName) => {
        if (monorepo.hasPackage(packageName)) {
          this._localDependencies.set(packageName, { type: "dependencies" });
        }
      });

    packageJson.devDependencies &&
      Object.keys(packageJson.devDependencies).forEach((packageName) => {
        if (monorepo.hasPackage(packageName)) {
          this._localDependencies.set(packageName, { type: "devDependencies" });
        }
      });

    packageJson.scripts &&
      Object.entries(packageJson.scripts).forEach(
        ([scriptName, scriptBody]) => {
          this._scripts.set(
            scriptName,
            new CliCommand(scriptName, `rushx ${scriptName}`, {
              project: this,
              description: scriptBody,
            })
          );
        }
      );
  }

  public async buildDependencies(): Promise<void> {
    await new CliCommand("rush build", `rush build -T ${this.name}`, {
      project: this,
    }).execute();
  }

  public async runScript(scriptName: string): Promise<void> {
    const script = this._scripts.get(scriptName);

    if (script) {
      script.execute();
    }
  }

  public async start(): Promise<void> {
    let startScript: CliCommand | undefined;

    for (const [scriptName, script] of this._scripts) {
      if (scriptName === "start") {
        startScript = script;
        break;
      }
    }

    if (!startScript) {
      throw new Error(`Package "${this.name}" has no "start" script`);
    }

    await startScript.execute();
  }

  public async promptScript(title?: string): Promise<CliCommand | undefined> {
    const scriptName = await vscode.window
      .showQuickPick(
        [...this.scripts.keys()].map((scriptName) => ({
          label: scriptName,
          description: this._scripts.get(scriptName)?.description,
        })),
        {
          title,
        }
      )
      .then((item) => item?.label);

    if (scriptName) {
      return this.scripts.get(scriptName);
    }
  }
}
