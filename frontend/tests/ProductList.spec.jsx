import { render, screen } from "@testing-library/react";
import Products from "../src/pages/Products.jsx";
import axiosClient from "../src/api/axiosClient.js";
import { MemoryRouter } from "react-router-dom"; // wrap if necessary

vi.mock("../src/api/axiosClient");

test("renders products table", async () => {
  axiosClient.get.mockResolvedValue({
    data: [
      { id: "1", name: "Test Product", sku: "SKU1", price: 10, quantity: 5 },
    ],
  });

  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Test Product/)).toBeInTheDocument();
  expect(screen.getByText(/SKU1/)).toBeInTheDocument();
});
