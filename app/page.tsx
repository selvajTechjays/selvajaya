import CareerTunnel from "@/components/CareerTunnel";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Work from "@/components/Work";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <CareerTunnel />
        <Work />
        <Contact />
      </main>
      <footer>Designed &amp; built by Selva Jaya · {new Date().getFullYear()}</footer>
    </>
  );
}
