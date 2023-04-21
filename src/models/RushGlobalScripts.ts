import { CliCommand } from "./CliScript";

export class RushGlobalScripts {
  private static _scripts: Record<string, CliCommand> = {
    update: new CliCommand("update", "rush update"),
    build: new CliCommand("build", "rush build"),
    change: new CliCommand("change", "rush change"),
  };

  public static get scriptNames(): string[] {
    return Object.keys(RushGlobalScripts._scripts);
  }

  public static getScript(scriptName: string): CliCommand | undefined {
    return RushGlobalScripts._scripts[scriptName];
  }

  public static get all(): CliCommand[] {
    return Object.values(RushGlobalScripts._scripts);
  }
}
