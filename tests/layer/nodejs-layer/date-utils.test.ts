import { getNow } from "../../../src/layer/nodejs-layer/"

describe("date-utils.ts", () => {
  it("return value is Date instancd", async () => {
    const date = getNow()
    expect(date).toBeInstanceOf(Date)
  })
})
