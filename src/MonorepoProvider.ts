import * as vscode from "vscode";
import json5 from "json5";

import { RushMonorepo } from "./models";

export class MonorepoProvider {
  public async refresh(): Promise<RushMonorepo> {
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

    this._cachedMonorepo = new RushMonorepo(
      vscode.Uri.joinPath(rushJsonPath, ".."),
      rushJson
    );

    return this._cachedMonorepo;
  }

  private _cachedMonorepo: RushMonorepo | undefined;

  public get monorepo(): Promise<RushMonorepo> {
    return this._cachedMonorepo
      ? Promise.resolve(this._cachedMonorepo)
      : this.refresh();
  }
}
