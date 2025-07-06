import { getDate } from "../../../src/layer/nodejs-layer/"

describe("date-utils.ts", () => {
  it("return value is Date instancd", async () => {
    const date = getDate()
    expect(date).toBeInstanceOf(Date)
  })
})
