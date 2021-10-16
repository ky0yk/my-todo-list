export class ResourceName {
  public readonly systemName: string;
  public readonly systemEnv: string;

  constructor(systemName: string, systemEnv: string) {
    this.systemName = systemName;
    this.systemEnv = systemEnv;
  }

  private basicName(name: string): string {
    return `${this.systemName}-${this.systemEnv}-${name}`;
  }

  public apiName(name: string): string {
    return this.basicName(`${name}-api`);
  }

  public lambdaName(name: string): string {
    return this.basicName(`${name}-function`);
  }

  public dynamodbName(name: string): string {
    return this.basicName(`${name}-table`);
  }

  public userPoolName(name: string): string {
    return this.basicName(`${name}-user-pool`);
  }

  public userPoolClientName(name: string): string {
    return this.basicName(`${name}-user-pool-client`);
  }

  public stackName(name: string): string {
    return this.basicName(`${name}-stack`);
  }
}
