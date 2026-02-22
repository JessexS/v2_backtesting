export class XorShift32 {
  private state: number;

  constructor(seed: number) {
    // nolla ei ole hyvä state xorshiftille
    this.state = (seed >>> 0) || 0xdeadbeef;
  }

  nextU32(): number {
    let x = this.state >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }

  nextFloat01(): number {
    // [0,1)
    return this.nextU32() / 0x100000000;
  }

  // Box-Muller: N(0,1)
  nextNormal(): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.nextFloat01();
    while (v === 0) v = this.nextFloat01();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}
