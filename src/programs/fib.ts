import { ProgramAssembly } from "../compiler.ts";

export const fibbonacci = new ProgramAssembly()
  .constant(1) //$a
  .constant(0) //$b
  .constant(8) //$counter
  .subroutine("loop")
  .branchLessEqual0_int8(0, "endloop")
  .add(2, 1) // $$a = Add($a, $b)
  .debug()
  .move(3) // $b = $a
  .decrement(2) //$counter = Decrement($counter)
  .jump("loop")
  .subroutine("endloop")
  .move(2)
  .debug();

function fib() {
  return loop(1, 0, 5);
}

function loop(a: number, b: number, counter: number): number {
  if (counter <= 0) {
    return a;
  } else {
    return loop(a + b, a, counter - 1);
  }
}
/*
:start
  $b = constant(0)
  $a = constant(1)
  $index = constant(5)
:loop(b, a, index)
  branch :endloop if ($index <= 0)
  $b = $a
  $a = add($a, $$b)
  print($a)
  $index = decrement($index)
  branch :loop
:endloop
  print($a)
*/
/*
:main
  literal 0
  literal 1
  call("loop", 0, 1, 5)

:loop($a, $b, $counter)
  isPositive($counter) //let $isPositive
  conditionalReturn($isPositive, $a) //if(!$isPositive)
  add($a, $b)           //let $result
  decrement($counter) //let $nextCounter
  tailCall("loop", 0, $result, $nextCounter)
  return
*/
