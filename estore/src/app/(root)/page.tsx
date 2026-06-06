import sampleData from "../../../db/sample-data";
import ProductList from "@/components/shared/product/product-list";

/*    test loading
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HomePage = async () => {
  await delay(2000);
  return <>ProStore!</>;
};
*/

const HomePage = () => {
  return (
    <>
      <ProductList
        data={sampleData.products}
        limit={4}
        title="Newest Arrivals"
      />
    </>
  );
};

export const metadata = {
  title: "Home",
};

export default HomePage;
