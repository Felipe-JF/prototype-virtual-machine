export const enum Opcode {
  halt,
  Debug,
  Int8Constant,
  Int16Constant,
  Int24Constant,
  Int32Constant,
  Load,
  Store,
  Input,
  Output,
  Add,
  Subtract,
  BranchInt8,
  BranchIfLessEqual0,
  Decrement,
  Increment,
  Move,
  Call0Int8,
  Call1Int8,
  Return0,
  Return1,
  Return0If0,
  Push,
  Pop,
  TailCall0Int8,
}
export type BinaryOpcode = [number, ...number[]];

export function Halt(): BinaryOpcode {
  return [Opcode.halt];
}
export function Debug(): BinaryOpcode {
  return [Opcode.Debug];
}
//Constants
export function ConstantInt8(literal: number): BinaryOpcode {
  return [Opcode.Int8Constant, literal];
}
export function ConstantInt16(literal: number): BinaryOpcode {
  return [Opcode.Int16Constant, literal];
}
export function ConstantInt32(literal: number): BinaryOpcode {
  return [Opcode.Int32Constant, literal];
}
//Branching
export function BranchInt8($offset: number): BinaryOpcode {
  return [Opcode.BranchInt8, $offset];
}
export function BranchIfLessEqual0Int8(
  $data: number,
  $offset: number,
): BinaryOpcode {
  return [Opcode.BranchIfLessEqual0, $data, $offset];
}

// Alu 1 operands
export function Decrement($a: number): BinaryOpcode {
  return [Opcode.Decrement, $a];
}
export function Increment($a: number): BinaryOpcode {
  return [Opcode.Increment, $a];
}
export function Copy($a: number): BinaryOpcode {
  return [Opcode.Move, $a];
}
// Alu 2 operands
export function Add($a: number, $b: number): BinaryOpcode {
  return [Opcode.Add, $a, $b];
}
export function Subtract($a: number, $b: number): BinaryOpcode {
  return [Opcode.Subtract, $a, $b];
}

export function Load($address: number): BinaryOpcode {
  return [Opcode.Load, $address];
}
export function Input($address: number): BinaryOpcode {
  return [Opcode.Input, $address];
}

export function Store($address: number, $data: number): BinaryOpcode {
  return [Opcode.Store, $address, $data];
}
export function Output($address: number, $data: number): BinaryOpcode {
  return [Opcode.Output, $address, $data];
}
export function Call0Int8(offset: number): BinaryOpcode {
  return [Opcode.Call0Int8, offset];
}
export function Call1Int8(offset: number, $data: number): BinaryOpcode {
  return [Opcode.Call1Int8, offset, $data];
}
export function Return0(): BinaryOpcode {
  return [Opcode.Return0];
}
export function Return1($data: number): BinaryOpcode {
  return [Opcode.Return1, $data];
}
export function Push($data: number): BinaryOpcode {
  return [Opcode.Push, $data];
}
export function Pop(): BinaryOpcode {
  return [Opcode.Pop];
}
export function Return0If0(): BinaryOpcode {
  return [Opcode.Return0If0];
}
