// このクラスの使い方
// 1.NAME_SPACEを継承先(extends)で再定義する
// 2.継承先でIpcIdを指定する
export class IpcIdBase {
  static readonly NAME_SPACE: string
  private static counter = 0

  // mainプロセスとrendererプロセスでそれぞれ同じ順番で呼ばれるため、同じIDが生成できる
  static generateIpcId(): string {
    this.counter++
    return `${this.NAME_SPACE}-${this.counter}`
  }

  // 継承先での指定例
  // public static ToMainProc = class {
  //   static readonly SOME_IPC_ID: string = IpcId.generateIpcId();
  // }
  //
  // public static ToRenderer = class {
  //   static readonly SOME_IPC_ID: string = IpcId.generateIpcId();
  // }
}
