import { CliCommand } from "./CliScript";
import { RushGlobalScripts } from "./RushGlobalScripts";
import { RushProject } from "./RushProject";

export class ScriptGroup {
  readonly name: string;
  readonly scripts: CliCommand[];

  public constructor(name: string, scripts: CliCommand[]) {
    this.name = name;
    this.scripts = scripts;
  }

  public static createGlobal(): ScriptGroup {
    return new ScriptGroup("Global scripts", RushGlobalScripts.all);
  }

  public static fromProject(project: RushProject): ScriptGroup {
    return new ScriptGroup("Package scripts", [...project.scripts.values()]);
  }
}
