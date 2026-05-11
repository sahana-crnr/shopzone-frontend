import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

export default function Contact() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-4 text-muted-foreground leading-7">
            If you need help with an order, account, or product issue, reach out
            to the ShopZone team.
          </p>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>
              Email: <span className="font-medium text-foreground">support@shopzone.com</span>
            </p>
            <p>
              Phone: <span className="font-medium text-foreground">+91 98765 43210</span>
            </p>
            <p>
              Address:{" "}
              <span className="font-medium text-foreground">
                221, Shopping Street, Bengaluru, Karnataka, India
              </span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
