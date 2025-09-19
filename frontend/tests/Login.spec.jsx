import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Login from "../src/pages/Login.jsx";

test("Login form submits", async () => {
  // set the spy once, inside the test or in a beforeEach
  const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ token: "abc123" }),
  });

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

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() =>
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/login$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "test@test.com",
          password: "password",
        }),
      })
    )
  );

  fetchSpy.mockRestore(); // clean up the spy after the test

});
