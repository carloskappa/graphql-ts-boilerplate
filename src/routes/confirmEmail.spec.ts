import fetch from "node-fetch";
test("sends invalid if bad key", async () => {
  const response = await fetch(
    `${process.env.TEST_HOST}/confirm/7123hjhasdhjasd6123`
  );
  const text = await response.text();
  expect(text).toEqual("invalid");
});
