import * as Opcodes from "./opcode.ts";

export class ProgramAssembly {
  fns: Array<() => Opcodes.BinaryOpcode> = [];
  labels = new Map<string, number>();
  index = 0;
  variables = new Map<string, number>();

  subroutine(label: string) {
    this.labels.set(label, this.index);
    console.log("Label:", label, "in", this.index);
    return this;
  }

  constant(data: number, label?: string) {
    this.index += 2;
    //this.variables.set(label!, 0);
    this.fns.push(() => Opcodes.ConstantInt8(data));
    return this;
  }

  jump(label: string) {
    this.index += 2;
    const index = this.index;
    this.fns.push(() => {
      const address = this.labels.get(label);
      if (address === undefined) throw new Error(`Label "${label}" not found`);
      const offset = address - index;
      return Opcodes.BranchInt8(offset);
    });
    return this;
  }

  Call0_i8(label: string) {
    this.index += 2;
    const index = this.index;
    this.fns.push(() => {
      const address = this.labels.get(label);
      if (address === undefined) throw new Error(`Label "${label}" not found`);
      const offset = address - index;
      return Opcodes.Call0Int8(offset);
    });
    return this;
  }
  Call1_i8(label: string, $data: number) {
    this.index += 3;
    const index = this.index;
    this.fns.push(() => {
      const address = this.labels.get(label);
      if (address === undefined) throw new Error(`Label "${label}" not found`);
      const offset = address - index;
      return Opcodes.Call1Int8(offset, $data);
    });
    return this;
  }
  Return0() {
    this.index += 1;
    this.fns.push(() => Opcodes.Return0());
    return this;
  }
  Return1($data: number) {
    this.index += 2;
    this.fns.push(() => Opcodes.Return1($data));
    return this;
  }
  push($register: number) {
    this.index += 2;
    this.fns.push(() => Opcodes.Push($register));
    return this;
  }

  pop() {
    this.index += 1;
    this.fns.push(() => Opcodes.Pop());
    return this;
  }

  add($a: number, $b: number) {
    this.index += 3;
    this.fns.push(() => Opcodes.Add($a, $b));
    return this;
  }

  debug() {
    this.index += 1;
    this.fns.push(() => Opcodes.Debug());
    return this;
  }

  move($operand: number) {
    this.index += 2;
    this.fns.push(() => Opcodes.Copy($operand));
    return this;
  }

  branchLessEqual0_int8($predicate: number, label: string) {
    this.index += 3;
    const index = this.index;
    this.fns.push(() => {
      const address = this.labels.get(label);
      if (address === undefined) throw new Error(`Label "${label}" not found`);

      const offset = address - index;
      return Opcodes.BranchIfLessEqual0Int8($predicate, offset);
    });

    return this;
  }

  decrement($operand: number) {
    this.index += 2;
    this.fns.push(() => Opcodes.Decrement($operand));
    return this;
  }
  increment($operand: number) {
    this.index += 2;
    this.fns.push(() => Opcodes.Increment($operand));
    return this;
  }
  load($address: number) {
    this.index += 2;
    this.fns.push(() => Opcodes.Load($address));
    return this;
  }
  store($address: number, $data: number) {
    this.index += 3;
    this.fns.push(() => Opcodes.Store($address, $data));
    return this;
  }

  halt() {
    this.index += 1;
    this.fns.push(() => Opcodes.Halt());
    return this;
  }
  make() {
    const binaryProgram = this.fns.map((fn) => fn());

    console.log("Program:", binaryProgram);
    return binaryProgram.flat();
  }
}
interface IAssembly {
  type: "Subroutine" | "Opcode";
}

interface IOpcodeLine extends IAssembly {
  type: "Opcode";
  opcode: Opcodes.Opcode;
  byteLength: number;
}

interface ILiteral extends IOpcodeLine {
  literal: number;
}
interface IControlFlow extends IOpcodeLine {
  label: string;
}

interface Subroutine extends IAssembly {
  type: "Subroutine";
  label: string;
}
interface Constant extends ILiteral {
  opcode: Opcodes.Opcode.Int8Constant;
}

type ControlFlow = IControlFlow;
type Literal = Constant;
type OpcodeLine = Literal;
type Assembly = Subroutine | OpcodeLine;

function Constant(literal: number): Constant {
  return {
    type: "Opcode",
    opcode: Opcodes.Opcode.Int8Constant,
    byteLength: 2,
    literal,
  };
}

function Subroutine(label: string): Subroutine {
  return {
    type: "Subroutine",
    label,
  };
}

interface CompilerState {
  labels: { label: string; ip: number }[];
  opcodes: OpcodeLine[];
}
function CompilerState(): CompilerState {
  return {
    labels: [],
    opcodes: [],
  };
}
function separeLabels(state: CompilerState, line: Assembly): CompilerState {
  switch (line.type) {
    case "Subroutine": {
      return {
        ...state,
        labels: [...state.labels, {
          label: line.label,
          ip: state.opcodes.length,
        }],
      };
    }
    case "Opcode": {
      return {
        ...state,
        opcodes: [...state.opcodes, line],
      };
    }
  }
}

function compiler(xs: Assembly[]) {
  const { labels, opcodes } = xs.reduce(separeLabels, CompilerState());
  opcodes.map((opcodeLine): [number, ...number[]] => {
    switch (opcodeLine.opcode) {
      case Opcodes.Opcode.Int8Constant: {
        return Opcodes.ConstantInt8(opcodeLine.literal);
      }
    }
  });
}
