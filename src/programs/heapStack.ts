import { ProgramAssembly } from "../compiler.ts";

export const heapStack = new ProgramAssembly()
  .Call0_i8("createStack") // push(data)
  .constant(12)
  .Call1_i8("push", 0)
  .constant(34)
  .Call1_i8("push", 0)
  .Call0_i8("pop")
  .debug()
  .halt()
  //:createStack
  .subroutine("createStack") // createStack()
  .constant(0) //$topLocation* = 0
  .constant(1) //$top = 1
  .store(1, 0) // [$topLocation*] = $top
  .Return0()
  //:Push
  .subroutine("push") // push($data)
  .constant(0) // $topLocation* = 0
  .load(0) // $index* = [$topLocation*]
  .store(0, 2) // [$index*] = $data
  .increment(0) // $index* = $index* + 1
  .store(2, 0) // [$topLocation*] = $index*
  .Return0()
  //:Pop
  .subroutine("pop")
  .constant(0) // let $topLocation* = 0
  .load(0) // let $top* = [$topLocation*]
  .decrement(0) // let $nextTop* = $top* - 1
  .store(2, 0) // [$topLocation*] = $nextTop*
  .load(0) // let $data = [$nextTop*]
  .Return1(0); // return $data

function pop(program: ProgramAssembly) {
  return program
    .constant(0) // let $topLocation* = 0
    .load(0) // let $top* = [$topLocation*]
    .decrement(0) // let $nextTop* = $top* - 1
    .store(2, 0) // [$topLocation*] = $nextTop*
    .load(0) // let $data = [$nextTop*]
    .Return1(0); // return $data
}
