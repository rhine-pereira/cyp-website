import Image from "next/image";
import Carousel from "./components/Carousel";
import WhoWeAre from "./components/WhoWeAre";

export default function Home() {
  return (
    <div>
      <Carousel />
      <WhoWeAre />
    </div>
  );
}
