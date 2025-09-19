import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../src/pages/Login.jsx";
import axiosClient from "../src/api/axiosClient.js";
import { MemoryRouter } from "react-router-dom";

vi.mock("../src/api/axiosClient");

test("Login form submits", async () => {
  axiosClient.post.mockResolvedValue({ data: { token: "abc123" } });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: "test@test.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "password" },
  });

  // ✅ Use getByRole to get the button specifically
  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  expect(axiosClient.post).toHaveBeenCalledWith("/auth/login", {
    email: "test@test.com",
    password: "password",
  });
});
