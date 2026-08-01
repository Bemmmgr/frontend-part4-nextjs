import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";

export const metadata = {
  title: "Home",
};

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredPRoducts = await getFeaturedProducts();

  return (
    <>
      {featuredPRoducts.length > 0 && (
        <ProductCarousel data={featuredPRoducts} />
      )}
      <ProductList data={latestProducts} limit={4} title="Newest Arrivals" />
      <ViewAllProductsButton />
    </>
  );
};

export default HomePage;
