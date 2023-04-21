import { RushMonorepo } from "./RushMonorepo";
import { RushProject } from "./RushProject";

export class RushTree {
  private _monorepo: RushMonorepo;

  public constructor(monorepo: RushMonorepo) {
    this._monorepo = monorepo;
  }

  public getChildren(): Thenable<RushProject[]> {
    const dependencyNames: string[] = [];

    this._monorepo.projects.forEach((_, packageName) => {
      dependencyNames.push(packageName);
    });

    return Promise.all(
      dependencyNames.map((packageName) =>
        this._monorepo.getProject(packageName)
      )
    );
  }
}
