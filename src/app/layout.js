import "./globals.css";

export const metadata = {
  title: "Digital Time Capsule Social",
  description: "Lock a message for your future self or someone you care about.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
