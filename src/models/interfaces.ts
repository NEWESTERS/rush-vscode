import { Uri } from "vscode";

export interface IPackageJson {
  name: string;
  version: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface IRushJson {
  projects?: Array<{
    packageName: string;
    projectFolder: string;
    shouldPublish?: string;
  }>;
}

export interface IRushProject {
  path: Uri;
}

export interface IRushMonorepo {
  hasPackage(name: string): boolean;
  getPackagePath(name: string): Uri;
}

export interface IDependencyMeta {
  type: "dependencies" | "devDependencies";
}

export interface IRushProjectMeta {
  path: Uri;
}
