import { RushMonorepo } from "./RushMonorepo";
import { RushProject } from "./RushProject";

export class RushProjectGroup {
  public readonly name: string;
  private _monorepo: RushMonorepo;
  private _parent?: RushProject;

  public constructor(
    name: string,
    monorepo: RushMonorepo,
    parent?: RushProject
  ) {
    this.name = name;
    this._monorepo = monorepo;
    this._parent = parent;
  }

  public getChildren(): Thenable<RushProject[]> {
    const dependencyNames: string[] = [];

    if (this._parent) {
      this._parent.dependencies.forEach((_, dependencyName) => {
        dependencyNames.push(dependencyName);
      });
    } else {
      this._monorepo.projects.forEach((_, packageName) => {
        dependencyNames.push(packageName);
      });
    }

    return Promise.all(
      dependencyNames.map((packageName) =>
        this._monorepo.getProject(packageName)
      )
    );
  }
}
