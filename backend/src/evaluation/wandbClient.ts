export class WandbClient {
  public async log(data: any) {
    console.debug("[W&B Mock] Log:", data);
  }
  
  public init(config: any) {
      console.debug("[W&B Mock] Init:", config);
  }
}
export const wandbClient = new WandbClient();
