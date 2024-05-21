export class MyClass {
    name: string;
  
    constructor(name: string) {
      this.name = name;
    }
  
    getMessage(): string {
      return `Hello ${this.name}`
    }
  }
  