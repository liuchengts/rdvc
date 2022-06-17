interface Demo {
  name: string,
  age: number,

  out(): string
}

class Impl implements Demo {
  out(): string {
    return this.name + "_" + this.age;
  }

  age: number = 12;
  name: string = "zhang san";

}

export default Impl
