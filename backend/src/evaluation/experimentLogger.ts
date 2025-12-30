import { wandbClient } from './wandbClient';

export class ExperimentLogger {
  public logExperiment(name: string, data: any) {
    wandbClient.log({ experiment: name, ...data });
  }
}
export const experimentLogger = new ExperimentLogger();
