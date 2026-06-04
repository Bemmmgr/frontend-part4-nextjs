import { APP_NAME } from "@/lib/constants";

// 011 - footer component
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="p-5 flex-center">
        {currentYear} {APP_NAME}. ALl Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
