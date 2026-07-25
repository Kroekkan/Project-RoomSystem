import { Header } from "./layout";
import { Navbar } from "./component/Navbar";

export default function Home() {
  return (
    <div className="h-screen">
      <Header />
      <Navbar />
    </div>
  );
}

