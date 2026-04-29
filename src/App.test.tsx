import { render, screen } from "@testing-library/react";
import { expect, test } from "@jest/globals";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders the login page on the default route", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByRole("heading", { name: /login/i })).toBeTruthy();
});
