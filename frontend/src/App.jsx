import { useEffect, useState } from "react";
import { Box, Heading, List, ListItem, Spinner } from "@chakra-ui/react";
import './App.css'

function App() {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const email = import.meta.env.VITE_ADMIN_EMAIL;
  const password = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Auto-login
        const loginRes = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        // Save token to localStorage (optional)
        localStorage.setItem("token", token);

        // Fetch products with token
        const res = await fetch(`${backendUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [backendUrl, email, password]);

  if (loading) return <Spinner />;

  return (
    <Box p={6}>
      <Heading size="md">Products</Heading>
      <List>
        {products.map((p) => (
          <ListItem key={p.id}>
            {p.sku} - {p.name} (${p.price})
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default App;
