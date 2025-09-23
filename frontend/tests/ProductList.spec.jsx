import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ProductsList from "../src/components/lists/ProductsList.jsx";

test("renders products table", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { id: 1, name: "Test Product", sku: "SKU1", price: 100 },
    ],
  });

  render(
    <MemoryRouter>
      <ProductsList />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Test Product/)).toBeInTheDocument();
  expect(await screen.findByText(/SKU1/)).toBeInTheDocument();
});
