import { render, screen } from "@testing-library/react";
import { expect, test } from "@jest/globals";
import { MemoryRouter } from "react-router";
import App from "./App";

jest.mock("react-router-dom", () => require("react-router"), { virtual: true });

test("renders the login page on the default route", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );

  expect(await screen.findByRole("heading", { name: /login/i })).toBeTruthy();
});
