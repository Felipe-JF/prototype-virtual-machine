import { Opcode } from "./opcode.ts";
import { Subject } from "./Observable.ts";

export class CPU extends Subject<[number, number]> {
  belt = new Belt();
  instruction = new InstructionMemory();
  ram = new Ram();
  isHalt = false;
  stack = new Stack();
  returnStack = new Stack();
  constructor(program?: number[]) {
    super();
    if (program) {
      for (let index = 0; index < program.length; index++) {
        this.instruction.view.setInt8(index, program[index]);
      }
    }
  }

  run(fn: () => void) {
    queueMicrotask(() => {
      this.step();
      if (this.isHalt) {
        return fn();
      }
      this.run(fn);
    });
  }
  step() {
    const instruction = this.instruction.fetchInt8();
    this.execute(instruction);
  }
  start(fn: () => void) {
    this.run(fn);
    return this;
  }
  private execute(instruction: number) {
    switch (instruction) {
      case Opcode.halt: {
        this.halt();
        break;
      }
      case Opcode.Debug: {
        this.debug();
        break;
      }
      case Opcode.Int8Constant: {
        this.constant();
        break;
      }
      case Opcode.Add: {
        this.add();
        break;
      }
      case Opcode.Subtract: {
        this.subtract();
        break;
      }
      case Opcode.BranchInt8: {
        this.unconditionalBranch();
        break;
      }
      case Opcode.BranchIfLessEqual0: {
        this.branchLesserEqual0();
        break;
      }

      case Opcode.Decrement: {
        this.decrement();
        break;
      }

      case Opcode.Move: {
        this.move();
        break;
      }
      case Opcode.Call0Int8: {
        this.Call0_i8();
        break;
      }
      case Opcode.Call1Int8: {
        this.Call1_i8();
        break;
      }
      case Opcode.Return0: {
        this.Return0();
        break;
      }
      case Opcode.Load: {
        this.load();
        break;
      }
      case Opcode.Store: {
        this.store();
        break;
      }
      case Opcode.Push: {
        this.Push();
        break;
      }
      case Opcode.Pop: {
        this.Pop();
        break;
      }
      case Opcode.Increment: {
        this.increment();
        break;
      }
      case Opcode.Return1: {
        this.Return1();
        break;
      }
      default: {
        throw new Error("Not implemented " + instruction);
      }
    }
  }
  private ConditionalReturn0() {
    const $data = this.instruction.fetchInt8();
    const data = this.belt.read($data);
    if (data === 0) {
      const address = this.returnStack.pop();
      this.instruction.jump(address);
      this.belt.popFrame();
      console.log("ConditionalReturn0:", address);
    }
  }
  private Push() {
    const $data = this.instruction.fetchInt8();
    const data = this.belt.read($data);
    this.stack.push(data);
    console.log("Push:", data);
  }

  private Pop() {
    const data = this.stack.pop();
    this.belt.push(data);
    console.log("Pop:", data);
  }

  private Call0_i8() {
    const offset = this.instruction.fetchInt8();
    this.returnStack.push(this.instruction.pointer);
    this.instruction.branch(offset);
    this.belt.pushFrame();
    console.log("Call0_i8:", this.instruction.pointer);
  }
  private Call1_i8() {
    const offset = this.instruction.fetchInt8();
    const $data = this.instruction.fetchInt8();
    this.returnStack.push(this.instruction.pointer);
    this.instruction.branch(offset);
    const data = this.belt.read($data);
    this.belt.pushFrame();
    this.belt.push(data);
    console.log("Call1_i8:", this.instruction.pointer);
  }
  private Return0() {
    const address = this.returnStack.pop();
    this.instruction.jump(address);
    this.belt.popFrame();
    console.log("Return:", address);
  }
  private Return1() {
    const $data = this.instruction.fetchInt8();
    const address = this.returnStack.pop();
    this.instruction.jump(address);
    const data = this.belt.read($data);
    this.belt.popFrame();
    this.belt.push(data);
    console.log("Return1:", address);
  }
  private load() {
    this.input((address) => {
      const data = this.ram.load(address);
      console.log("Load:", { address, data });
      return data;
    });
  }

  private store() {
    this.output((address, data) => {
      this.ram.store(address, data);
      console.log("Store:", { address, data });
    });
  }

  private systemInput() {
    //this.input((address) => )
    throw new Error("systemInput");
  }

  private systemOutput() {
    this.output((address, data) => this.dispatch([address, data]));
  }
  private input(fn: (address: number) => number) {
    const $address = this.instruction.fetchInt8();
    const address = this.belt.read($address);
    const data = fn(address);
    this.belt.push(data);
  }

  private output(fn: (address: number, data: number) => void) {
    const $address = this.instruction.fetchInt8();
    const $data = this.instruction.fetchInt8();
    const address = this.belt.read($address);
    const data = this.belt.read($data);
    fn(address, data);
  }
  private constant() {
    const data = this.instruction.fetchInt8();
    this.belt.push(data);
    console.log("Constant:", data);
  }
  private conditionalBranch(fn: (data: number) => boolean) {
    const $data = this.instruction.fetchInt8();
    const offset = this.instruction.fetchInt8();
    if (fn(this.belt.read($data))) {
      this.instruction.branch(offset);
      console.log(
        "Branch conditionally to instruction",
        this.instruction.pointer,
      );
    } else {
      console.log(
        "Branch conditionally fail, continue on ",
        this.instruction.pointer,
      );
    }
  }
  private alu(fn: (a: number, b: number) => number) {
    const $a = this.instruction.fetchInt8();
    const $b = this.instruction.fetchInt8();
    const a = this.belt.read($a);
    const b = this.belt.read($b);
    const result = fn(a, b);
    this.belt.push(result);
    console.log("Alu:", `(${a}, ${b}) => ${result} in`, fn.toString());
  }

  private decrement() {
    const $a = this.instruction.fetchInt8();
    const a = this.belt.read($a);
    const result = a - 1;
    this.belt.push(result);
    console.log("Decrement", `(${a}) => ${result}`);
  }

  private increment() {
    const $a = this.instruction.fetchInt8();
    const a = this.belt.read($a);
    const result = a + 1;
    this.belt.push(result);
    console.log("Increment", `(${a}) => ${result}`);
  }
  private branchNot0() {
    this.conditionalBranch((a) => a !== 0);
  }
  private branch0() {
    this.conditionalBranch((a) => a === 0);
  }
  private branchPositive() {
    this.conditionalBranch((a) => a > 0);
  }
  private branchLesserEqual0() {
    this.conditionalBranch((a) => a <= 0);
  }
  private branchGreaterEqual0() {
    this.conditionalBranch((a) => a >= 0);
  }
  private unconditionalBranch() {
    const offset = this.instruction.fetchInt8();

    this.instruction.branch(offset);
    console.log(
      "Branch unconditionally to instruction:",
      this.instruction.pointer,
    );
  }

  private move() {
    const $a = this.instruction.fetchInt8();
    const a = this.belt.read($a);
    this.belt.push(a);
    console.log("Move:", a, $a);
  }
  private add() {
    this.alu((a, b) => a + b);
  }

  private subtract() {
    this.alu((a, b) => a - b);
  }

  private halt() {
    console.log("Halt", this.instruction.pointer);
    this.isHalt = true;
  }

  private debug() {
    console.log("Debug:", this.belt.frameStack);
  }
}

class Belt {
  pointerStack: [number, ...number[]] = [0];
  frameStack: [Int32Array, ...Int32Array[]] = [new Int32Array(0x100)];

  pushFrame() {
    this.frameStack.push(new Int32Array(0x100));
    this.pointerStack.push(0);
  }

  popFrame() {
    if (this.frameStack.length <= 1) {
      throw new Error("PopFrame, stackFrame.length <= 1");
    }
    this.frameStack.pop();
    this.pointerStack.pop();
  }
  get frame() {
    return this.frameStack[this.frameStack.length - 1];
  }

  get pointer() {
    return this.pointerStack[this.pointerStack.length - 1] & 0xff;
  }

  set pointer(data: number) {
    this.pointerStack[this.pointerStack.length - 1] = data & 0xff;
  }

  push(data: number) {
    this.frame[this.pointer] = data;
    this.pointer = this.pointer + 1;
  }

  read(temporal: number) {
    return this.frame[this.pointer - temporal - 1];
  }

  toString() {
    return this.frame.toString().split(",").map((a) => parseInt(a)).slice(
      Math.max(0, this.pointer - 17),
      this.pointer - 1,
    ).reverse();
  }
}

class Stack {
  view = new DataView(new ArrayBuffer(0x100));
  top = 0;
  push(data: number) {
    this.view.setInt8(this.top, data);
    this.top = this.top + 1 & 0xff;
  }

  pop() {
    return this.view.getInt8(this.top = this.top - 1 & 0xff);
  }
}

class Ram {
  buffer = new Int8Array(0xff);
  view = new DataView(this.buffer.buffer);
  load(address: number) {
    return this.view.getInt8(address);
  }

  loadInt16(address: number) {
    return this.view.getInt16(address, true);
  }

  store(address: number, data: number) {
    this.view.setInt8(address, data);
  }

  storeInt16(address: number, data: number) {
    this.view.setInt16(address, data);
  }
}

class InstructionMemory extends Ram {
  pointer = 0;
  fetchInt8() {
    return this.load(this.pointer++);
  }

  jump(address: number) {
    this.pointer = address;
  }

  branch(offset: number) {
    this.pointer += offset;
  }
}
