import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";

export const metadata = {
  title: "Home",
};

/*    test loading
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HomePage = async () => {
  await delay(2000);
  return <>ProStore!</>;
};
*/

const HomePage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <>
      <ProductList data={latestProducts} limit={4} title="Newest Arrivals" />
    </>
  );
};

export default HomePage;
