import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

export default function About() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground">About ShopZone</h1>
          <p className="mt-4 text-muted-foreground leading-7">
            ShopZone is a simple shopping experience focused on a clean catalog,
            fast checkout, and a lightweight cart and wishlist flow. The product
            data is powered by the Django backend, while the React frontend
            provides the user experience.
          </p>
          <p className="mt-4 text-muted-foreground leading-7">
            The project is organized with separate backend and frontend repos so
            each side can be developed and reviewed independently.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
