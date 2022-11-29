import {} from "./opcode.ts";
import { CPU } from "./cpu.ts";

import { fibbonacci } from "./programs/fib.ts";
import { heapStack } from "./programs/heapStack.ts";
const cpu = new CPU(heapStack.make());
cpu.subscribe(([device, data]) => {
  switch (device) {
    case 0x0000: {
      // Print
      console.log("Print:", data.toString(16));
      break;
    }
    case 0x0001: {
      const response = prompt("Enter a message");

      break;
    }
  }
});
cpu.start(() => {
  console.log(cpu.ram.buffer);
});
