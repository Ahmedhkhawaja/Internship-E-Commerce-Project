import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "./ProductCard";

describe("ProductCard", () => {
  it("renders product name and price", () => {
    const product = {
      _id: "p1",
      name: "Test Product",
      priceCents: 2599,
      images: [],
    };

    render(<ProductCard product={product} onAdd={vi.fn()} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$25.99")).toBeInTheDocument();
  });

  it("calls onAdd when clicking Add to cart", () => {
    const product = {
      _id: "p2",
      name: "Another Product",
      priceCents: 1000,
      images: [],
    };
    const onAdd = vi.fn();

    render(<ProductCard product={product} onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(onAdd).toHaveBeenCalledWith(product);
  });
});
