import * as vscode from "vscode";
import json5 from "json5";

import { IRushJson, IRushMonorepo, IRushProjectMeta } from "./interfaces";
import { RushProject } from "./RushProject";

export class RushMonorepo implements IRushMonorepo {
  private readonly _projects: Map<string, IRushProjectMeta>;

  public readonly rootPath: vscode.Uri;

  public get projects(): ReadonlyMap<string, IRushProjectMeta> {
    return this._projects;
  }

  public constructor(rootPath: vscode.Uri, rushJson: IRushJson) {
    this.rootPath = rootPath;

    this._projects = new Map(
      rushJson.projects?.map?.(({ packageName, projectFolder }) => [
        packageName,
        { path: vscode.Uri.joinPath(rootPath, projectFolder) },
      ])
    );
  }

  public hasPackage(name: string): boolean {
    return this._projects.has(name);
  }

  public getPackagePath(name: string): vscode.Uri {
    const meta = this._projects.get(name);

    if (!meta) {
      throw new Error(`Project with name ${name} does not exist in monorepo`);
    }

    return meta.path;
  }

  private readonly _projectsCache = new Map<string, RushProject>();

  public async getProject(name: string): Promise<RushProject> {
    let project = this._projectsCache.get(name);

    if (!project) {
      const packageJsonFile = await vscode.workspace.fs.readFile(
        vscode.Uri.joinPath(this.getPackagePath(name), "package.json")
      );

      const packageJson = json5.parse(packageJsonFile.toString());

      project = new RushProject(this, packageJson);
    }

    return project;
  }

  private get _projectPromptOptions(): string[] {
    const options: string[] = [];
    const currentFileUri = vscode.window.activeTextEditor?.document?.uri;

    this.projects.forEach(({ path }, projectName) => {
      if (currentFileUri && currentFileUri.fsPath.startsWith(path.fsPath)) {
        options.unshift(projectName);
      } else {
        options.push(projectName);
      }
    });

    return options;
  }

  public async promptProject(title?: string): Promise<RushProject | undefined> {
    const projectName = await vscode.window.showQuickPick(
      this._projectPromptOptions,
      {
        title,
      }
    );

    if (!projectName) {
      return;
    }

    return this.getProject(projectName);
  }

  public static async init(): Promise<RushMonorepo> {
    const [rushJsonPath] = await vscode.workspace.findFiles(
      "rush.json",
      undefined,
      1
    );

    if (!rushJsonPath) {
      throw new Error("rush.json not found");
    }

    const rushJsonFile = await vscode.workspace.fs.readFile(rushJsonPath);

    const rushJson = json5.parse(rushJsonFile.toString());

    return new RushMonorepo(vscode.Uri.joinPath(rushJsonPath, ".."), rushJson);
  }
}
