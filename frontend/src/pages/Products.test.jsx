import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import Products from "./Products";
import { store } from "../store/store";
import { http } from "../api/http";

vi.mock("../api/http", () => ({
  http: {
    get: vi.fn(),
  },
}));

describe("Products page", () => {
  beforeEach(() => {
    http.get.mockResolvedValue({ data: { items: [] } });
  });

  it("shows empty state when no products are returned", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText("No products found")).toBeInTheDocument();
  });
});
