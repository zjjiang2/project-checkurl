const { axiosRequest } = require("./axiosRequest");

describe("axioRequest Tests", () => {
  test("Good Link Should Respond with Status Code of 200", () => {
    const url = "https://www.google.com";
    axiosRequest(url).then((res) => {
      expect(res.status).toBe(200);
    });
  });

  test("Bad Link Should Respond with Status Code of 404", () => {
    const url = "http://abc.go.com/%";
    axiosRequest(url).then((res) => {
      expect(res.status).toBe(404);
    });
  });
});
